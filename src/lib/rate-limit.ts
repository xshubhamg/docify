import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

type RateLimitOptions = {
  /** Stable bucket name, e.g. "documents:create". */
  name: string;
  /** Caller identity — a user id where possible, otherwise an IP. */
  identifier: string;
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

const redisUrl = env.UPSTASH_REDIS_REST_URL;
const redisToken = env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

let warnedAboutFallback = false;

const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(name: string, limit: number, windowSeconds: number) {
  if (!redis) {
    if (env.NODE_ENV === "production" && !warnedAboutFallback) {
      warnedAboutFallback = true;
      console.warn(
        "[rate-limit] Upstash is not configured; falling back to per-instance memory. " +
          "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for shared limits.",
      );
    }

    return null;
  }

  const key = `${name}:${limit}:${windowSeconds}`;
  const existing = upstashLimiters.get(key);

  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix: `docify:${key}`,
  });

  upstashLimiters.set(key, limiter);

  return limiter;
}

type MemoryWindow = { count: number; resetAt: number };
const memoryWindows = new Map<string, MemoryWindow>();
const MAX_MEMORY_WINDOWS = 10_000;

function pruneMemory(now: number) {
  if (memoryWindows.size < MAX_MEMORY_WINDOWS) {
    return;
  }

  for (const [key, window] of memoryWindows) {
    if (window.resetAt <= now) {
      memoryWindows.delete(key);
    }
  }
}

function checkMemory(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  pruneMemory(now);

  const existing = memoryWindows.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    memoryWindows.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;

  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Returns a 429 response when the caller is over the limit, otherwise `null`.
 *
 * Uses Upstash when configured (shared across serverless instances) and falls
 * back to per-instance memory for local development.
 */
export async function enforceRateLimit({
  name,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<NextResponse | null> {
  const key = `${name}:${identifier}`;
  const limiter = getUpstashLimiter(name, limit, windowSeconds);

  let result: RateLimitResult;

  try {
    if (limiter) {
      const upstashResult = await limiter.limit(key);
      result = {
        success: upstashResult.success,
        remaining: upstashResult.remaining,
        resetAt: upstashResult.reset,
      };
    } else {
      result = checkMemory(key, limit, windowSeconds);
    }
  } catch (error) {
    // Never let a rate-limit outage take down the endpoint.
    console.error("[rate-limit] backend failed; using memory fallback", error);
    result = checkMemory(key, limit, windowSeconds);
  }

  if (result.success) {
    return null;
  }

  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));

  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

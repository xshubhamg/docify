import { NextResponse } from "next/server";
import { ZodError } from "zod/v4";

import { auth } from "@/lib/auth";
import { isDocumentFlowError } from "@/lib/documents/errors";

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** A malformed request from the client, safe to surface as a 400. */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export async function getSessionOrNull(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

/**
 * Returns the authenticated session or throws `UnauthorizedError`.
 * Wrap route bodies in try/catch and pass failures to `toErrorResponse`.
 */
export async function requireSession(request: Request): Promise<AuthSession> {
  const session = await getSessionOrNull(request);

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Maps domain errors to stable HTTP responses. Unknown errors are logged and
 * replaced with a generic message so internals never leak to the client.
 */
export function toErrorResponse(error: unknown, fallback: string) {
  if (error instanceof UnauthorizedError) {
    return jsonError("Unauthorized", 401);
  }

  if (error instanceof BadRequestError) {
    return jsonError(error.message, 400);
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request payload.", details: error.issues },
      { status: 400 },
    );
  }

  if (isDocumentFlowError(error)) {
    return jsonError(error.message, error.statusCode);
  }

  console.error(`[api] ${fallback}`, error);

  return jsonError(fallback, 500);
}

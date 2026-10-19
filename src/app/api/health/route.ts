import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for uptime checks. Confirms the process can reach
 * Postgres; returns 503 (not 200) when it cannot so monitors can alert.
 */
export async function GET() {
  try {
    await db.execute(sql`select 1`);

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] database check failed", error);

    return NextResponse.json(
      { status: "degraded", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}

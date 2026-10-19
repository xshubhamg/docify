import { NextResponse } from "next/server";

import { requireSession, toErrorResponse } from "@/lib/api";
import { searchDocumentSegments } from "@/lib/documents/queries";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 8;

// Keyword search over a user's document segments for voice grounding.
//
// Phase 1 (current): session-authenticated. The reader fetches an overview
// (no query) before `vapi.start` and passes it via `variableValues`; the VAPI
// dashboard system prompt must reference {{documentTitle}}/{{documentContext}}.
//
// Phase 2 (planned): point a VAPI `search_document` server tool at this URL
// (`GET ?query=`). That needs non-cookie tool auth first (signed per-session
// token) — do NOT expose this route without auth before then.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug } = await params;
    const url = new URL(request.url);
    const query = (url.searchParams.get("query") ?? "").slice(0, 500);
    const rawLimit = Number(url.searchParams.get("limit"));
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.floor(rawLimit), 1), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const result = await searchDocumentSegments(session.user.id, slug, query, limit);

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error, "Could not search the document.");
  }
}

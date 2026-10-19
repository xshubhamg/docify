import { NextResponse } from "next/server";

import { requireSession, toErrorResponse } from "@/lib/api";
import {
  createVoiceSession,
  getDocumentBySlugForUser,
  listVoiceSessionsForDocument,
} from "@/lib/documents/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug } = await params;
    const doc = await getDocumentBySlugForUser(session.user.id, slug);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const voiceSessions = await listVoiceSessionsForDocument(session.user.id, doc.id);

    return NextResponse.json({ voiceSessions });
  } catch (error) {
    return toErrorResponse(error, "Could not load voice sessions.");
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug } = await params;
    const doc = await getDocumentBySlugForUser(session.user.id, slug);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const voiceSession = await createVoiceSession(session.user.id, doc.id);

    return NextResponse.json({ voiceSession }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Could not start a voice session.");
  }
}

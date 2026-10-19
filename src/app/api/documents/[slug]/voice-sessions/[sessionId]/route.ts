import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { requireSession, toErrorResponse } from "@/lib/api";
import { finishVoiceSession, getDocumentBySlugForUser } from "@/lib/documents/queries";

const finishVoiceSessionSchema = z.object({
  endedAt: z.string().datetime(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; sessionId: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug, sessionId } = await params;
    const doc = await getDocumentBySlugForUser(session.user.id, slug);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const payload = finishVoiceSessionSchema.parse(await request.json());
    const voiceSession = await finishVoiceSession(
      session.user.id,
      sessionId,
      doc.id,
      new Date(payload.endedAt),
    );

    if (!voiceSession) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ voiceSession });
  } catch (error) {
    return toErrorResponse(error, "Could not finish voice session.");
  }
}

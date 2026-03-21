import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { auth } from "@/lib/auth";
import {
  finishVoiceSession,
  getDocumentBySlugForUser,
} from "@/lib/documents/queries";

const finishVoiceSessionSchema = z.object({
  endedAt: z.string().datetime(),
});

export async function PATCH(
  request: Request,
  {
    params,
  }: { params: Promise<{ slug: string; sessionId: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, sessionId } = await params;
  const doc = await getDocumentBySlugForUser(session.user.id, slug);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
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
    const message =
      error instanceof Error ? error.message : "Could not finish voice session.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

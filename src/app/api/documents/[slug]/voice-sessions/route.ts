import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  createVoiceSession,
  getDocumentBySlugForUser,
} from "@/lib/documents/queries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const doc = await getDocumentBySlugForUser(session.user.id, slug);

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const voiceSession = await createVoiceSession(session.user.id, doc.id);

  return NextResponse.json({ voiceSession }, { status: 201 });
}

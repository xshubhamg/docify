import { NextResponse } from "next/server";

import { requireSession, toErrorResponse } from "@/lib/api";
import { streamPrivateBlob } from "@/lib/documents/blob-response";
import { getDocumentBySlugForUser } from "@/lib/documents/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug } = await params;
    const doc = await getDocumentBySlugForUser(session.user.id, slug);

    if (!doc || !doc.coverBlobKey) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const response = await streamPrivateBlob(request, doc.coverBlobKey);

    return response ?? NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return toErrorResponse(error, "Could not stream the cover image.");
  }
}

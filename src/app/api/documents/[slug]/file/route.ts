import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getDocumentBySlugForUser } from "@/lib/documents/queries";
import { getPrivateBlob } from "@/lib/documents/storage";

export async function GET(
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

  const result = await getPrivateBlob(
    doc.fileBlobKey,
    request.headers.get("if-none-match") ?? undefined,
  );

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}

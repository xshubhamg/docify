import { NextResponse } from "next/server";

import { requireSession, toErrorResponse } from "@/lib/api";
import { deleteDocumentForUser, getDocumentReaderData } from "@/lib/documents/queries";
import { deleteBlob } from "@/lib/documents/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug } = await params;
    const document = await getDocumentReaderData(session.user.id, slug);

    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    return toErrorResponse(error, "Could not load the document.");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await requireSession(request);
    const { slug } = await params;
    const deleted = await deleteDocumentForUser(session.user.id, slug);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // DB row is the source of truth (already deleted above). Blob cleanup is
    // best-effort; orphans are tolerable until the storage GC pass lands.
    await Promise.allSettled(
      [deleted.fileBlobKey, deleted.coverBlobKey]
        .filter((key): key is string => Boolean(key))
        .map((key) => deleteBlob(key)),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Could not delete the document.");
  }
}

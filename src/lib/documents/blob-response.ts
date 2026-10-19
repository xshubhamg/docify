import { NextResponse } from "next/server";

import { getPrivateBlob } from "@/lib/documents/storage";

/**
 * Streams a private blob through an authenticated route.
 *
 * Returns `null` when the blob is missing so callers can respond with 404.
 */
export async function streamPrivateBlob(request: Request, pathname: string) {
  const result = await getPrivateBlob(
    pathname,
    request.headers.get("if-none-match") ?? undefined,
  );

  if (!result) {
    return null;
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

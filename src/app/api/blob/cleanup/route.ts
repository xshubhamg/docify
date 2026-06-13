import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { auth } from "@/lib/auth";
import { deleteBlob } from "@/lib/documents/storage";
import { assertOwnedBlobPathname } from "@/lib/documents/utils";

const cleanupBlobSchema = z.object({
  pathnames: z.array(z.string().min(1)).min(1).max(5),
});

function getBlobKind(pathname: string): "pdf" | "cover" {
  if (pathname.includes("/pdf/")) {
    return "pdf";
  }

  if (pathname.includes("/cover/")) {
    return "cover";
  }

  throw new Error("Invalid blob pathname.");
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pathnames } = cleanupBlobSchema.parse(await request.json());

    await Promise.allSettled(
      pathnames.map(async (pathname) => {
        const kind = getBlobKind(pathname);
        assertOwnedBlobPathname(session.user.id, kind, pathname);
        await deleteBlob(pathname);
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not clean up uploaded blobs.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { requireSession, toErrorResponse } from "@/lib/api";
import { deleteBlob } from "@/lib/documents/storage";
import { assertOwnedBlobPathname } from "@/lib/documents/utils";
import { enforceRateLimit } from "@/lib/rate-limit";

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
  try {
    const session = await requireSession(request);
    const limited = await enforceRateLimit({
      name: "blob:cleanup",
      identifier: session.user.id,
      limit: 60,
      windowSeconds: 60,
    });

    if (limited) {
      return limited;
    }

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
    return toErrorResponse(error, "Could not clean up uploaded blobs.");
  }
}

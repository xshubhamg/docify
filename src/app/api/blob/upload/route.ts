import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { BadRequestError, requireSession, toErrorResponse } from "@/lib/api";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "@/lib/constants";
import { assertOwnedBlobPathname } from "@/lib/documents/utils";
import { enforceRateLimit } from "@/lib/rate-limit";

function parseClientPayload(payload: string | null): { kind: "pdf" | "cover" } {
  if (!payload) {
    throw new BadRequestError("Missing upload payload.");
  }

  let parsed: { kind?: "pdf" | "cover" };

  try {
    parsed = JSON.parse(payload) as { kind?: "pdf" | "cover" };
  } catch {
    throw new BadRequestError("Malformed upload payload.");
  }

  const kind = parsed.kind;

  if (kind !== "pdf" && kind !== "cover") {
    throw new BadRequestError("Unsupported upload kind.");
  }

  return { kind };
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const limited = await enforceRateLimit({
      name: "blob:upload",
      identifier: session.user.id,
      limit: 30,
      windowSeconds: 600,
    });

    if (limited) {
      return limited;
    }

    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { kind } = parseClientPayload(clientPayload);
        assertOwnedBlobPathname(session.user.id, kind, pathname);

        return {
          addRandomSuffix: false,
          validUntil: Date.now() + 5 * 60 * 1000,
          maximumSizeInBytes: kind === "pdf" ? MAX_FILE_SIZE : MAX_IMAGE_SIZE,
          allowedContentTypes: kind === "pdf" ? ACCEPTED_PDF_TYPES : ACCEPTED_IMAGE_TYPES,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return toErrorResponse(error, "Could not authorize upload.");
  }
}

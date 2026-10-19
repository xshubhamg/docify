import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { requireSession, toErrorResponse } from "@/lib/api";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "@/lib/constants";

function parseClientPayload(payload: string | null) {
  if (!payload) {
    throw new Error("Missing upload payload.");
  }

  const parsed = JSON.parse(payload) as { kind?: "pdf" | "cover" };

  if (parsed.kind !== "pdf" && parsed.kind !== "cover") {
    throw new Error("Unsupported upload kind.");
  }

  return parsed;
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { kind } = parseClientPayload(clientPayload);
        const expectedPrefix = `users/${session.user.id}/${kind}/`;

        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("Invalid upload path.");
        }

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

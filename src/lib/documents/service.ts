import "server-only";

import { db } from "@/lib/db";
import { document, documentSegment } from "@/lib/db/schema";
import { extractPdfPages } from "@/lib/documents/pdf";
import { getUniqueDocumentSlug } from "@/lib/documents/queries";
import { deleteBlob, getPrivateBlob } from "@/lib/documents/storage";
import type { CreateDocumentPayload } from "@/lib/documents/types";
import {
  assertImageConstraints,
  assertPdfConstraints,
  ensureVoiceKey,
  isImageTooLarge,
} from "@/lib/documents/utils";

export async function createDocumentFromUploads(
  userId: string,
  payload: CreateDocumentPayload,
) {
  assertPdfConstraints(payload.pdfFileSize, payload.pdfMimeType);
  ensureVoiceKey(payload.voice);

  if (payload.coverImage) {
    const coverMetadata = await getPrivateBlob(payload.coverImage.pathname);
    if (coverMetadata?.statusCode !== 200) {
      throw new Error("Uploaded cover image could not be verified.");
    }

    assertImageConstraints(coverMetadata.blob.contentType);

    if (isImageTooLarge(coverMetadata.blob.size)) {
      throw new Error("Cover image must be 10MB or smaller.");
    }
  }

  const pdfResult = await getPrivateBlob(payload.pdf.pathname);

  if (pdfResult?.statusCode !== 200 || !pdfResult.stream) {
    throw new Error("Uploaded PDF could not be fetched.");
  }

  const { segments } = await extractPdfPages(pdfResult.stream);
  const slug = await getUniqueDocumentSlug(payload.title);
  const documentId = crypto.randomUUID();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(document).values({
        id: documentId,
        userId,
        title: payload.title.trim(),
        slug,
        author: payload.author.trim(),
        voiceId: payload.voice,
        fileUrl: payload.pdf.url,
        fileBlobKey: payload.pdf.pathname,
        coverUrl: payload.coverImage?.url ?? null,
        coverBlobKey: payload.coverImage?.pathname ?? null,
        fileSize: payload.pdfFileSize,
        mimeType: payload.pdfMimeType,
        totalSegments: segments.length,
      });

      if (segments.length) {
        await tx.insert(documentSegment).values(
          segments.map((segment) => ({
            id: crypto.randomUUID(),
            userId,
            documentId,
            content: segment.content,
            segmentIndex: segment.segmentIndex,
            pageNumber: segment.pageNumber ?? null,
            wordCount: segment.wordCount,
          })),
        );
      }
    });
  } catch (error) {
    await Promise.allSettled([
      deleteBlob(payload.pdf.pathname),
      payload.coverImage ? deleteBlob(payload.coverImage.pathname) : Promise.resolve(),
    ]);
    throw error;
  }

  return {
    id: documentId,
    slug,
    totalSegments: segments.length,
  };
}

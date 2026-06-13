import "server-only";

import { db } from "@/lib/db";
import { document, documentSegment } from "@/lib/db/schema";
import { DocumentFlowError } from "@/lib/documents/errors";
import { extractPdfPages } from "@/lib/documents/pdf";
import { getUniqueDocumentSlug } from "@/lib/documents/queries";
import { deleteBlob, getPrivateBlob } from "@/lib/documents/storage";
import type { CreateDocumentPayload } from "@/lib/documents/types";
import {
  assertImageConstraints,
  assertOwnedBlobPathname,
  assertPdfConstraints,
  ensureVoiceKey,
  isImageTooLarge,
} from "@/lib/documents/utils";

export async function createDocumentFromUploads(
  userId: string,
  payload: CreateDocumentPayload,
) {
  ensureVoiceKey(payload.voice);
  assertOwnedBlobPathname(userId, "pdf", payload.pdf.pathname);

  if (payload.coverImage) {
    assertOwnedBlobPathname(userId, "cover", payload.coverImage.pathname);
  }

  try {
    let coverUrl: string | null = null;
    let coverBlobKey: string | null = null;

    if (payload.coverImage) {
      const coverMetadata = await getPrivateBlob(payload.coverImage.pathname);
      if (coverMetadata?.statusCode !== 200) {
        throw new DocumentFlowError("Uploaded cover image could not be verified.", 422);
      }

      assertImageConstraints(coverMetadata.blob.contentType);

      if (isImageTooLarge(coverMetadata.blob.size)) {
        throw new DocumentFlowError("Cover image must be 10MB or smaller.", 422);
      }

      coverUrl = payload.coverImage.url;
      coverBlobKey = payload.coverImage.pathname;
    }

    const pdfResult = await getPrivateBlob(payload.pdf.pathname);

    if (pdfResult?.statusCode !== 200 || !pdfResult.stream) {
      throw new DocumentFlowError("Uploaded PDF could not be fetched.", 422);
    }

    assertPdfConstraints(pdfResult.blob.size, pdfResult.blob.contentType);

    const { segments } = await extractPdfPages(pdfResult.stream);
    const slug = await getUniqueDocumentSlug(payload.title);
    const documentId = crypto.randomUUID();

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
        coverUrl,
        coverBlobKey,
        fileSize: pdfResult.blob.size,
        mimeType: pdfResult.blob.contentType,
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

    return {
      id: documentId,
      slug,
      totalSegments: segments.length,
    };
  } catch (error) {
    await Promise.allSettled([
      deleteBlob(payload.pdf.pathname),
      payload.coverImage ? deleteBlob(payload.coverImage.pathname) : Promise.resolve(),
    ]);

    throw error;
  }
}

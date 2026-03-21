import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { document, documentSegment, voiceSession } from "@/lib/db/schema";
import type {
  DocumentCardItem,
  DocumentReaderData,
  DocumentSegmentPreview,
} from "@/lib/documents/types";
import { createSlug, truncateText } from "@/lib/documents/utils";

const DEFAULT_COVER_URL = "/default-cover.svg";

function buildCoverUrl(slug: string, hasCover: boolean) {
  if (!hasCover) {
    return DEFAULT_COVER_URL;
  }

  return `/api/documents/${slug}/cover`;
}

function toSegmentPreview(
  segmentRow: typeof documentSegment.$inferSelect,
): DocumentSegmentPreview {
  return {
    id: segmentRow.id,
    segmentIndex: segmentRow.segmentIndex,
    pageNumber: segmentRow.pageNumber,
    wordCount: segmentRow.wordCount,
    preview: truncateText(segmentRow.content, 160),
    content: segmentRow.content,
  };
}

export async function getUniqueDocumentSlug(title: string) {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let suffix = 2;

  // Keep slug creation deterministic and simple for now.
  while (true) {
    const existing = await db
      .select({ id: document.id })
      .from(document)
      .where(eq(document.slug, slug))
      .limit(1);

    if (!existing.length) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function listDocumentsForUser(userId: string): Promise<DocumentCardItem[]> {
  const rows = await db
    .select()
    .from(document)
    .where(eq(document.userId, userId))
    .orderBy(desc(document.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    slug: row.slug,
    voiceId: row.voiceId,
    totalSegments: row.totalSegments,
    createdAt: row.createdAt,
    coverURL: buildCoverUrl(row.slug, Boolean(row.coverBlobKey)),
  }));
}

export async function getDocumentBySlugForUser(userId: string, slug: string) {
  const rows = await db
    .select()
    .from(document)
    .where(and(eq(document.userId, userId), eq(document.slug, slug)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getDocumentReaderData(
  userId: string,
  slug: string,
): Promise<DocumentReaderData | null> {
  const doc = await getDocumentBySlugForUser(userId, slug);

  if (!doc) {
    return null;
  }

  const segments = await db
    .select()
    .from(documentSegment)
    .where(eq(documentSegment.documentId, doc.id))
    .orderBy(asc(documentSegment.segmentIndex));

  return {
    id: doc.id,
    title: doc.title,
    author: doc.author,
    slug: doc.slug,
    voiceId: doc.voiceId,
    mimeType: doc.mimeType,
    totalSegments: doc.totalSegments,
    fileSize: doc.fileSize,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    fileUrl: `/api/documents/${doc.slug}/file`,
    coverUrl: buildCoverUrl(doc.slug, Boolean(doc.coverBlobKey)),
    segments: segments.map(toSegmentPreview),
  };
}

export async function createVoiceSession(userId: string, documentId: string) {
  const [row] = await db
    .insert(voiceSession)
    .values({
      id: crypto.randomUUID(),
      userId,
      documentId,
      billingPeriodStart: new Date(),
    })
    .returning({
      id: voiceSession.id,
      startedAt: voiceSession.startedAt,
    });

  return row;
}

export async function finishVoiceSession(
  userId: string,
  sessionId: string,
  documentId: string,
  endedAt: Date,
) {
  const [existingSession] = await db
    .select({
      startedAt: voiceSession.startedAt,
    })
    .from(voiceSession)
    .where(
      and(
        eq(voiceSession.id, sessionId),
        eq(voiceSession.userId, userId),
        eq(voiceSession.documentId, documentId),
      ),
    )
    .limit(1);

  if (!existingSession) {
    return null;
  }

  const durationSeconds = Math.max(
    0,
    Math.round(
      (endedAt.getTime() - existingSession.startedAt.getTime()) / 1000,
    ),
  );

  const [row] = await db
    .update(voiceSession)
    .set({
      endedAt,
      durationSeconds,
    })
    .where(
      and(
        eq(voiceSession.id, sessionId),
        eq(voiceSession.userId, userId),
        eq(voiceSession.documentId, documentId),
      ),
    )
    .returning({
      id: voiceSession.id,
      endedAt: voiceSession.endedAt,
      durationSeconds: voiceSession.durationSeconds,
    });

  return row ?? null;
}

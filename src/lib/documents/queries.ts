import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { document, documentSegment, voiceSession } from "@/lib/db/schema";
import type {
  DocumentCardItem,
  DocumentContextResult,
  DocumentReaderData,
  DocumentSegmentPreview,
} from "@/lib/documents/types";
import { createSlug, truncateText } from "@/lib/documents/utils";
import { scoreSegmentContent, tokenizeQuery } from "@/lib/documents/search";

const DEFAULT_COVER_URL = "/default-cover.svg";
const CONTEXT_CONTENT_MAX_LENGTH = 1500;
const SEGMENT_PREVIEW_SOURCE_LENGTH = 400;
const SEGMENT_PREVIEW_LENGTH = 160;

function buildCoverUrl(slug: string, hasCover: boolean) {
  if (!hasCover) {
    return DEFAULT_COVER_URL;
  }

  return `/api/documents/${slug}/cover`;
}

function toSegmentPreview(row: {
  id: string;
  segmentIndex: number;
  pageNumber: number | null;
  wordCount: number;
  previewSource: string;
}): DocumentSegmentPreview {
  return {
    id: row.id,
    segmentIndex: row.segmentIndex,
    pageNumber: row.pageNumber,
    wordCount: row.wordCount,
    preview: truncateText(row.previewSource, SEGMENT_PREVIEW_LENGTH),
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

export async function deleteDocumentForUser(userId: string, slug: string) {
  const doc = await getDocumentBySlugForUser(userId, slug);

  if (!doc) {
    return null;
  }

  // Segments + voice sessions cascade via FK onDelete. Caller deletes blobs.
  await db
    .delete(document)
    .where(and(eq(document.id, doc.id), eq(document.userId, userId)));

  return {
    fileBlobKey: doc.fileBlobKey,
    coverBlobKey: doc.coverBlobKey,
  };
}

export async function listVoiceSessionsForDocument(
  userId: string,
  documentId: string,
  limit = 20,
) {
  return db
    .select({
      id: voiceSession.id,
      startedAt: voiceSession.startedAt,
      endedAt: voiceSession.endedAt,
      durationSeconds: voiceSession.durationSeconds,
    })
    .from(voiceSession)
    .where(and(eq(voiceSession.userId, userId), eq(voiceSession.documentId, documentId)))
    .orderBy(desc(voiceSession.startedAt))
    .limit(limit);
}

export async function getDocumentReaderData(
  userId: string,
  slug: string,
): Promise<DocumentReaderData | null> {
  const doc = await getDocumentBySlugForUser(userId, slug);

  if (!doc) {
    return null;
  }

  // The reader only renders a short preview per segment. Selecting a bounded
  // slice in Postgres keeps large documents from shipping megabytes of text.
  const segments = await db
    .select({
      id: documentSegment.id,
      segmentIndex: documentSegment.segmentIndex,
      pageNumber: documentSegment.pageNumber,
      wordCount: documentSegment.wordCount,
      previewSource: sql<string>`left(${documentSegment.content}, ${SEGMENT_PREVIEW_SOURCE_LENGTH})`,
    })
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

export async function searchDocumentSegments(
  userId: string,
  slug: string,
  query: string,
  limit: number,
): Promise<DocumentContextResult | null> {
  const doc = await getDocumentBySlugForUser(userId, slug);

  if (!doc) {
    return null;
  }

  const rows = await db
    .select()
    .from(documentSegment)
    .where(eq(documentSegment.documentId, doc.id))
    .orderBy(asc(documentSegment.segmentIndex));

  const terms = tokenizeQuery(query);

  let picked = rows;

  if (terms.length) {
    const matched = rows
      .map((row) => ({ row, score: scoreSegmentContent(row.content, terms) }))
      .filter((entry) => entry.score > 0)
      .sort(
        (first, second) =>
          second.score - first.score || first.row.segmentIndex - second.row.segmentIndex,
      )
      .map((entry) => entry.row);

    picked = (matched.length ? matched : rows).slice(0, limit);
  } else {
    picked = rows.slice(0, limit);
  }

  return {
    document: {
      id: doc.id,
      title: doc.title,
      author: doc.author,
      slug: doc.slug,
      voiceId: doc.voiceId,
      totalSegments: doc.totalSegments,
    },
    query,
    segments: picked.map((row) => ({
      segmentIndex: row.segmentIndex,
      pageNumber: row.pageNumber,
      wordCount: row.wordCount,
      content: truncateText(row.content, CONTEXT_CONTENT_MAX_LENGTH),
    })),
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
    Math.round((endedAt.getTime() - existingSession.startedAt.getTime()) / 1000),
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

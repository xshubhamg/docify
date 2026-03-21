import { randomUUID } from "node:crypto";

import { MAX_FILE_SIZE, MAX_IMAGE_SIZE, voiceOptions } from "@/lib/constants";
import type { SegmentInsert } from "@/lib/documents/types";

const WORDS_PER_SEGMENT = 180;
const WORD_OVERLAP = 30;

export function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildBlobPathname(
  userId: string,
  kind: "pdf" | "cover",
  filename: string,
) {
  return `users/${userId}/${kind}/${randomUUID()}-${sanitizeFilename(filename)}`;
}

export function createSlug(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `document-${randomUUID().slice(0, 8)}`;
}

export function ensureVoiceKey(voice: string) {
  if (!(voice in voiceOptions)) {
    throw new Error("Unsupported voice option.");
  }

  return voice;
}

export function assertPdfConstraints(fileSize: number, mimeType: string) {
  if (mimeType !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("PDF must be 50MB or smaller.");
  }
}

export function assertImageConstraints(mimeType: string) {
  if (!mimeType.startsWith("image/")) {
    throw new Error("Cover image must be an image file.");
  }
}

export function truncateText(value: string, maxLength = 180) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function segmentWords(words: string[], pageNumber?: number) {
  const segments: SegmentInsert[] = [];
  let cursor = 0;

  while (cursor < words.length) {
    const slice = words.slice(cursor, cursor + WORDS_PER_SEGMENT);
    const content = slice.join(" ").trim();

    if (content) {
      segments.push({
        content,
        segmentIndex: segments.length,
        pageNumber,
        wordCount: slice.length,
      });
    }

    if (cursor + WORDS_PER_SEGMENT >= words.length) {
      break;
    }

    cursor += WORDS_PER_SEGMENT - WORD_OVERLAP;
  }

  return segments;
}

export function buildSegmentsFromPages(
  pages: Array<{ pageNumber: number; text: string }>,
) {
  const allSegments: SegmentInsert[] = [];

  pages.forEach(({ pageNumber, text }) => {
    const words = text
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    if (!words.length) {
      return;
    }

    const segments = segmentWords(words, pageNumber);

    segments.forEach((segment) => {
      allSegments.push({
        ...segment,
        segmentIndex: allSegments.length,
      });
    });
  });

  return allSegments;
}

export function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getVoiceName(voiceId: string) {
  return voiceOptions[voiceId as keyof typeof voiceOptions]?.name ?? "Unknown";
}

export function isImageTooLarge(fileSize: number) {
  return fileSize > MAX_IMAGE_SIZE;
}

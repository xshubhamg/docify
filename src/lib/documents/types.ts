import type { PutBlobResult } from "@vercel/blob";

export interface UploadedBlobInput {
  pathname: string;
  url: string;
  downloadUrl?: string;
}

export interface CreateDocumentPayload {
  title: string;
  author: string;
  voice: string;
  pdf: UploadedBlobInput;
  coverImage?: UploadedBlobInput;
}

export interface SegmentInsert {
  content: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
}

export interface DocumentCardItem {
  id: string;
  title: string;
  author: string;
  slug: string;
  coverURL: string;
  voiceId: string;
  totalSegments: number;
  createdAt: Date;
}

export interface DocumentSegmentPreview {
  id: string;
  segmentIndex: number;
  pageNumber: number | null;
  wordCount: number;
  preview: string;
}

export interface DocumentContextSegment {
  segmentIndex: number;
  pageNumber: number | null;
  wordCount: number;
  content: string;
}

export interface DocumentContextResult {
  document: {
    id: string;
    title: string;
    author: string;
    slug: string;
    voiceId: string;
    totalSegments: number;
  };
  query: string;
  segments: DocumentContextSegment[];
}

export interface DocumentReaderData {
  id: string;
  title: string;
  author: string;
  slug: string;
  voiceId: string;
  mimeType: string;
  totalSegments: number;
  fileSize: number;
  createdAt: Date;
  updatedAt: Date;
  fileUrl: string;
  coverUrl: string;
  segments: DocumentSegmentPreview[];
}

export type BlobUploadResult = PutBlobResult;

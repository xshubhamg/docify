import { ReactNode } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { LucideIcon } from "lucide-react";
import { z } from "zod/v4";
import { UploadSchema } from "@/lib/zod";

// ============================================
// DATABASE MODELS
// ============================================

export interface IDocument {
  id: string;
  userId: string;
  title: string;
  slug: string;
  author: string;
  voiceId: string;
  fileUrl: string;
  fileBlobKey: string;
  coverUrl?: string;
  coverBlobKey?: string;
  fileSize: number;
  mimeType: string;
  totalSegments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentSegment {
  id: string;
  userId: string;
  documentId: string;
  content: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoiceSession {
  id: string;
  userId: string;
  documentId: string;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  billingPeriodStart: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FORM & INPUT TYPES
// ============================================

export type DocumentUploadFormValues = z.infer<typeof UploadSchema>;
export type BookUploadFormValues = DocumentUploadFormValues;

export interface CreateDocument {
  userId: string;
  title: string;
  author: string;
  voiceId: string;
  fileUrl: string;
  fileBlobKey: string;
  coverUrl?: string;
  coverBlobKey?: string;
  fileSize: number;
  mimeType: string;
}

export type CreateBook = CreateDocument;

export interface TextSegment {
  text: string;
  segmentIndex: number;
  pageNumber?: number;
  wordCount: number;
}

export interface BookCardProps {
  title: string;
  author: string;
  coverURL: string;
  slug: string;
}

export interface Messages {
  role: string;
  content: string;
}

export interface ShadowBoxProps {
  children: ReactNode;
  className?: string;
}

export interface VoiceSelectorProps {
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange: (voiceId: string) => void;
}

export interface InputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface FileUploadFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  acceptTypes: string[];
  disabled?: boolean;
  icon: LucideIcon;
  placeholder: string;
  hint: string;
}

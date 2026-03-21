import { z } from "zod/v4";

import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
} from "@/lib/constants";

export const UploadSchema = z.object({
  pdf: z
    .instanceof(File, { message: "Please upload a PDF file" })
    .refine((file) => ACCEPTED_PDF_TYPES.includes(file.type), "Only PDF files are accepted")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File must be under 50MB"),
  coverImage: z
    .instanceof(File)
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Invalid image type")
    .refine((file) => file.size <= MAX_IMAGE_SIZE, "Image must be under 10MB")
    .optional(),
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author name is required").max(200),
  voice: z.string().min(1, "Please select a voice"),
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(200),
  voice: z.string().trim().min(1),
  pdf: z.object({
    pathname: z.string().min(1),
    url: z.string().url(),
    downloadUrl: z.string().url().optional(),
  }),
  coverImage: z
    .object({
      pathname: z.string().min(1),
      url: z.string().url(),
      downloadUrl: z.string().url().optional(),
    })
    .optional(),
  pdfFileSize: z.number().int().positive(),
  pdfMimeType: z.string().min(1),
});

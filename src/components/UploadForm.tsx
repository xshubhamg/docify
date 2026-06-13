"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod/v4";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { voiceOptions, voiceCategories, DEFAULT_VOICE } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";
import type { CreateDocumentPayload } from "@/lib/documents/types";
import { buildBlobPathname } from "@/lib/documents/utils";
import { cn } from "@/lib/utils";
import { UploadSchema } from "@/lib/zod";

type UploadFormValues = z.infer<typeof UploadSchema>;

export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: DEFAULT_VOICE,
    },
  });

  const pdfFile = form.watch("pdf");
  const coverImage = form.watch("coverImage");

  async function uploadFile(file: File, kind: "pdf" | "cover") {
    if (!session?.user.id) {
      throw new Error("You must be signed in to upload documents.");
    }

    return upload(buildBlobPathname(session.user.id, kind, file.name), file, {
      access: "private",
      contentType: file.type,
      handleUploadUrl: "/api/blob/upload",
      clientPayload: JSON.stringify({ kind }),
      multipart: file.size > 5 * 1024 * 1024,
    });
  }

  async function cleanupUploadedFiles(pathnames: string[]) {
    if (!pathnames.length) {
      return;
    }

    await fetch("/api/blob/cleanup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pathnames }),
    });
  }

  async function onSubmit(values: UploadFormValues) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const uploadResults = await Promise.allSettled([
        uploadFile(values.pdf, "pdf"),
        values.coverImage ? uploadFile(values.coverImage, "cover") : Promise.resolve(null),
      ]);

      const successfulUploads = uploadResults.flatMap((result) =>
        result.status === "fulfilled" && result.value ? [result.value] : [],
      );

      const failedUpload = uploadResults.find((result) => result.status === "rejected");
      if (failedUpload?.status === "rejected") {
        await cleanupUploadedFiles(successfulUploads.map((upload) => upload.pathname));
        throw failedUpload.reason;
      }

      const [pdfUpload, coverUpload] = uploadResults.map((result) =>
        result.status === "fulfilled" ? result.value : null,
      );

      if (!pdfUpload) {
        throw new Error("PDF upload did not complete.");
      }

      const payload: CreateDocumentPayload = {
        title: values.title,
        author: values.author,
        voice: values.voice,
        pdf: {
          pathname: pdfUpload.pathname,
          url: pdfUpload.url,
          downloadUrl: pdfUpload.downloadUrl,
        },
        coverImage: coverUpload
          ? {
              pathname: coverUpload.pathname,
              url: coverUpload.url,
              downloadUrl: coverUpload.downloadUrl,
            }
          : undefined,
        pdfFileSize: values.pdf.size,
        pdfMimeType: values.pdf.type,
      };

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string; slug?: string };

      if (!response.ok || !result.slug) {
        await cleanupUploadedFiles(
          [pdfUpload.pathname, coverUpload?.pathname].filter(
            (pathname): pathname is string => Boolean(pathname),
          ),
        );
        throw new Error(result.error ?? "Could not create document.");
      }

      router.push(`/documents/${result.slug}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Document upload failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="new-book-wrapper space-y-8"
        >
          {errorMessage && (
            <div className="rounded-[18px] border border-(--red-200) bg-(--red-50) px-4 py-3 text-sm text-(--red-700)">
              {errorMessage}
            </div>
          )}

          {/* PDF Upload */}
          <FormField
            control={form.control}
            name="pdf"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Upload PDF</FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      "upload-dropzone border-2 border-dashed border-(--border-medium)",
                      pdfFile && "upload-dropzone-uploaded",
                    )}
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) field.onChange(file);
                      }}
                    />

                    {pdfFile ? (
                      <div className="flex items-center gap-3">
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">{pdfFile.name}</p>
                        <button
                          type="button"
                          className="upload-dropzone-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            field.onChange(undefined);
                            if (pdfInputRef.current) pdfInputRef.current.value = "";
                          }}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">Click to upload PDF</p>
                        <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cover Image Upload */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Cover Image</FormLabel>
                <FormControl>
                  <div
                    className={cn(
                      "upload-dropzone border-2 border-dashed border-(--border-medium)",
                      coverImage && "upload-dropzone-uploaded",
                    )}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) field.onChange(file);
                      }}
                    />

                    {coverImage ? (
                      <div className="flex items-center gap-3">
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">{coverImage.name}</p>
                        <button
                          type="button"
                          className="upload-dropzone-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            field.onChange(undefined);
                            if (imageInputRef.current) imageInputRef.current.value = "";
                          }}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">Click to upload cover image</p>
                        <p className="upload-dropzone-hint">
                          Leave empty to auto-generate from PDF
                        </p>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <input
                    className="form-input"
                    placeholder="ex: Rich Dad Poor Dad"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author */}
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <input
                    className="form-input"
                    placeholder="ex: Robert Kiyosaki"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Voice Selector */}
          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                <FormControl>
                  <div className="space-y-5">
                    <VoiceGroup
                      label="Male Voices"
                      keys={voiceCategories.male}
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                    <VoiceGroup
                      label="Female Voices"
                      keys={voiceCategories.female}
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <button
            type="submit"
            className="form-btn"
            disabled={isSubmitting}
          >
            Begin Synthesis
          </button>
        </form>
      </Form>
    </>
  );
}

function VoiceGroup({
  label,
  keys,
  selected,
  onSelect,
}: {
  label: string;
  keys: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-(--text-muted) mb-2">{label}</p>
      <div className="voice-selector-options flex-wrap">
        {keys.map((key) => {
          const voice = voiceOptions[key as keyof typeof voiceOptions];
          const isSelected = selected === key;
          return (
            <label
              key={key}
              className={cn(
                "voice-selector-option",
                isSelected
                  ? "voice-selector-option-selected"
                  : "voice-selector-option-default",
              )}
            >
              <input
                type="radio"
                name="voice"
                value={key}
                checked={isSelected}
                onChange={() => onSelect(key)}
                className="sr-only"
              />
              <div className="text-center">
                <p className="font-semibold text-(--text-primary)">{voice.name}</p>
                <p className="text-xs text-(--text-muted) mt-0.5">{voice.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

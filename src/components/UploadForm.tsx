"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, ImageIcon, X, type LucideIcon } from "lucide-react";
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
        values.coverImage
          ? uploadFile(values.coverImage, "cover")
          : Promise.resolve(null),
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
      setErrorMessage(error instanceof Error ? error.message : "Document upload failed.");
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
                  <FileDropzone
                    id="pdf-file"
                    accept=".pdf,application/pdf"
                    file={pdfFile}
                    onFileChange={field.onChange}
                    icon={Upload}
                    title="Choose a PDF or drop it here"
                    hint="PDF only, up to 50MB"
                  />
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
                  <FileDropzone
                    id="cover-file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    file={coverImage}
                    onFileChange={field.onChange}
                    icon={ImageIcon}
                    title="Choose a cover image or drop it here"
                    hint="JPG, PNG, or WebP up to 10MB. Leave empty for the default cover."
                  />
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
          <button type="submit" className="form-btn" disabled={isSubmitting}>
            Begin Synthesis
          </button>
        </form>
      </Form>
    </>
  );
}

function FileDropzone({
  id,
  accept,
  file,
  onFileChange,
  icon: Icon,
  title,
  hint,
}: {
  id: string;
  accept: string;
  file?: File;
  onFileChange: (file: File | undefined) => void;
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectFile(files: FileList | null) {
    const next = files?.[0];

    if (next) {
      onFileChange(next);
    }
  }

  function clearFile() {
    onFileChange(undefined);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div
      className={cn(
        "upload-dropzone border-2 border-dashed border-(--border-medium)",
        file && "upload-dropzone-uploaded",
        isDragging && "border-(--color-brand) bg-(--color-brand)/5",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        selectFile(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => selectFile(event.target.files)}
      />

      {file ? (
        <div className="flex flex-wrap items-center justify-center gap-3 px-4">
          <Icon className="upload-dropzone-icon mb-0" aria-hidden="true" />
          <p className="upload-dropzone-text max-w-[14rem] truncate">{file.name}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="upload-dropzone-action"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="upload-dropzone-remove"
              aria-label={`Remove ${file.name}`}
              onClick={clearFile}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex w-full flex-col items-center rounded-[6px] px-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-brand)"
          onClick={() => inputRef.current?.click()}
        >
          <Icon className="upload-dropzone-icon" aria-hidden="true" />
          <span className="upload-dropzone-text">{title}</span>
          <span className="upload-dropzone-hint">{hint}</span>
        </button>
      )}
    </div>
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
      <p className="mb-2 text-sm font-medium text-(--text-muted)">{label}</p>
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
                <p className="mt-0.5 text-xs text-(--text-muted)">{voice.description}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

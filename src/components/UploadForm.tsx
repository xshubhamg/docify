"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, ImageIcon, X } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import {
  voiceOptions,
  voiceCategories,
  DEFAULT_VOICE,
  MAX_FILE_SIZE,
  ACCEPTED_PDF_TYPES,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const uploadSchema = z.object({
  pdf: z
    .instanceof(File, { message: "Please upload a PDF file" })
    .refine((f) => ACCEPTED_PDF_TYPES.includes(f.type), "Only PDF files are accepted")
    .refine((f) => f.size <= MAX_FILE_SIZE, "File must be under 50MB"),
  coverImage: z
    .instanceof(File)
    .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), "Invalid image type")
    .refine((f) => f.size <= MAX_IMAGE_SIZE, "Image must be under 10MB")
    .optional(),
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author name is required").max(200),
  voice: z.string().min(1, "Please select a voice"),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      author: "",
      voice: DEFAULT_VOICE,
    },
  });

  const pdfFile = form.watch("pdf");
  const coverImage = form.watch("coverImage");

  async function onSubmit(values: UploadFormValues) {
    setIsSubmitting(true);
    try {
      // TODO: implement actual upload
      console.log("Submitting:", values);
      await new Promise((r) => setTimeout(r, 2000));
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
                      pdfFile && "upload-dropzone-uploaded"
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
                      coverImage && "upload-dropzone-uploaded"
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
                  : "voice-selector-option-default"
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

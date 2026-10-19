import { File } from "node:buffer";

import { describe, expect, it } from "vitest";

import { MAX_FILE_SIZE, MAX_IMAGE_SIZE } from "@/lib/constants";
import { createDocumentSchema, UploadSchema } from "@/lib/zod";

function pdfFile(size = 8) {
  return new File([new Uint8Array(size)], "document.pdf", {
    type: "application/pdf",
  });
}

describe("UploadSchema", () => {
  const base = {
    title: "Clean Code",
    author: "Robert Martin",
    voice: "rachel",
    pdf: pdfFile(),
  };

  it("accepts a valid upload", () => {
    expect(UploadSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a non-PDF file", () => {
    const result = UploadSchema.safeParse({
      ...base,
      pdf: new File(["hello"], "notes.txt", { type: "text/plain" }),
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    expect(UploadSchema.safeParse({ ...base, title: "" }).success).toBe(false);
  });

  it("rejects a missing voice", () => {
    expect(UploadSchema.safeParse({ ...base, voice: "" }).success).toBe(false);
  });

  it("rejects a PDF over the size limit", () => {
    const file = pdfFile();
    Object.defineProperty(file, "size", { value: MAX_FILE_SIZE + 1 });

    expect(UploadSchema.safeParse({ ...base, pdf: file }).success).toBe(false);
  });

  it("accepts a valid cover image", () => {
    const cover = new File([new Uint8Array(8)], "cover.png", { type: "image/png" });

    expect(UploadSchema.safeParse({ ...base, coverImage: cover }).success).toBe(true);
  });

  it("accepts an upload without a cover image", () => {
    expect(UploadSchema.safeParse({ ...base, coverImage: undefined }).success).toBe(true);
  });

  it("rejects a cover image with an unsupported type", () => {
    const cover = new File(["hello"], "cover.txt", { type: "text/plain" });

    expect(UploadSchema.safeParse({ ...base, coverImage: cover }).success).toBe(false);
  });

  it("rejects a cover image over the size limit", () => {
    const cover = new File([new Uint8Array(8)], "cover.png", { type: "image/png" });
    Object.defineProperty(cover, "size", { value: MAX_IMAGE_SIZE + 1 });

    expect(UploadSchema.safeParse({ ...base, coverImage: cover }).success).toBe(false);
  });
});

describe("createDocumentSchema", () => {
  const payload = {
    title: "Clean Code",
    author: "Robert Martin",
    voice: "rachel",
    pdf: {
      pathname: "users/u1/pdf/abc-document.pdf",
      url: "https://example.com/document.pdf",
    },
  };

  it("accepts a valid payload", () => {
    expect(createDocumentSchema.safeParse(payload).success).toBe(true);
  });

  it("accepts an optional cover image", () => {
    const result = createDocumentSchema.safeParse({
      ...payload,
      coverImage: {
        pathname: "users/u1/cover/abc-cover.png",
        url: "https://example.com/cover.png",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid blob URL", () => {
    const result = createDocumentSchema.safeParse({
      ...payload,
      pdf: { ...payload.pdf, url: "not-a-url" },
    });

    expect(result.success).toBe(false);
  });

  it("trims title and author", () => {
    const result = createDocumentSchema.parse({
      ...payload,
      title: "  Clean Code  ",
      author: "  Robert Martin ",
    });

    expect(result.title).toBe("Clean Code");
    expect(result.author).toBe("Robert Martin");
  });
});

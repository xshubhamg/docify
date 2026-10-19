import { describe, expect, it } from "vitest";

import { DocumentFlowError } from "@/lib/documents/errors";
import {
  assertImageConstraints,
  assertOwnedBlobPathname,
  assertPdfConstraints,
  buildBlobPathname,
  buildSegmentsFromPages,
  createSlug,
  ensureVoiceKey,
  formatFileSize,
  getVoiceName,
  isImageTooLarge,
  sanitizeFilename,
  truncateText,
} from "@/lib/documents/utils";
import { MAX_FILE_SIZE, MAX_IMAGE_SIZE } from "@/lib/constants";

function words(count: number) {
  return Array.from({ length: count }, (_, index) => `word${index + 1}`).join(" ");
}

describe("sanitizeFilename", () => {
  it("lowercases and replaces unsafe characters", () => {
    expect(sanitizeFilename("My Report (final).PDF")).toBe("my-report-final-.pdf");
  });

  it("collapses repeated separators", () => {
    expect(sanitizeFilename("a   ---   b.pdf")).toBe("a-b.pdf");
  });
});

describe("buildBlobPathname", () => {
  it("scopes keys by user and kind with a uuid prefix", () => {
    const pathname = buildBlobPathname("user_123", "pdf", "My File.pdf");

    expect(pathname).toMatch(/^users\/user_123\/pdf\/[0-9a-f-]{36}-my-file\.pdf$/);
  });

  it("uses a distinct prefix for covers", () => {
    expect(buildBlobPathname("u1", "cover", "c.png")).toMatch(/^users\/u1\/cover\//);
  });
});

describe("assertOwnedBlobPathname", () => {
  it("accepts a pathname under the user's kind prefix", () => {
    expect(() =>
      assertOwnedBlobPathname("u1", "pdf", "users/u1/pdf/abc-file.pdf"),
    ).not.toThrow();
  });

  it("rejects another user's pathname with 403", () => {
    expect.assertions(2);

    try {
      assertOwnedBlobPathname("u1", "pdf", "users/u2/pdf/abc-file.pdf");
    } catch (error) {
      expect(error).toBeInstanceOf(DocumentFlowError);
      expect((error as DocumentFlowError).statusCode).toBe(403);
    }
  });

  it("rejects a mismatched kind", () => {
    expect(() => assertOwnedBlobPathname("u1", "pdf", "users/u1/cover/abc.png")).toThrow(
      DocumentFlowError,
    );
  });
});

describe("createSlug", () => {
  it("normalizes text into a slug", () => {
    expect(createSlug("  Clean Code: A Handbook! ")).toBe("clean-code-a-handbook");
  });

  it("falls back to a generated slug for empty input", () => {
    expect(createSlug("!!!")).toMatch(/^document-[0-9a-f]{8}$/);
  });
});

describe("ensureVoiceKey", () => {
  it("accepts a known voice", () => {
    expect(ensureVoiceKey("rachel")).toBe("rachel");
  });

  it("rejects an unknown voice with 422", () => {
    expect(() => ensureVoiceKey("not-a-voice")).toThrowError(/Unsupported voice option/);
  });
});

describe("assertPdfConstraints", () => {
  it("accepts a valid PDF", () => {
    expect(() => assertPdfConstraints(1024, "application/pdf")).not.toThrow();
  });

  it("rejects a non-PDF content type", () => {
    expect(() => assertPdfConstraints(1024, "text/plain")).toThrowError(/Only PDF files/);
  });

  it("rejects a file over the size limit", () => {
    expect(() => assertPdfConstraints(MAX_FILE_SIZE + 1, "application/pdf")).toThrowError(
      /50MB or smaller/,
    );
  });
});

describe("assertImageConstraints", () => {
  it("accepts an image type", () => {
    expect(() => assertImageConstraints("image/png")).not.toThrow();
  });

  it("rejects a non-image type", () => {
    expect(() => assertImageConstraints("application/pdf")).toThrowError(
      /must be an image/,
    );
  });
});

describe("truncateText", () => {
  it("returns short, normalized text unchanged", () => {
    expect(truncateText("  hello   world  ")).toBe("hello world");
  });

  it("truncates long text and appends an ellipsis", () => {
    const result = truncateText("a".repeat(200), 10);

    expect(result).toBe("aaaaaaaaaa...");
  });
});

describe("buildSegmentsFromPages", () => {
  it("keeps a short page in a single segment", () => {
    const segments = buildSegmentsFromPages([{ pageNumber: 1, text: words(50) }]);

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({
      segmentIndex: 0,
      pageNumber: 1,
      wordCount: 50,
    });
  });

  it("splits a 181-word page into overlapping segments", () => {
    const segments = buildSegmentsFromPages([{ pageNumber: 1, text: words(181) }]);

    expect(segments).toHaveLength(2);
    expect(segments[0]?.wordCount).toBe(180);
    expect(segments[1]?.wordCount).toBe(31);

    const first = segments[0]?.content.split(" ") ?? [];
    const second = segments[1]?.content.split(" ") ?? [];

    // 30-word overlap: the first segment ends where the second begins.
    expect(first.slice(-30)).toEqual(second.slice(0, 30));
  });

  it("keeps indices monotonic across pages and skips empty pages", () => {
    const segments = buildSegmentsFromPages([
      { pageNumber: 1, text: words(10) },
      { pageNumber: 2, text: "   " },
      { pageNumber: 3, text: words(10) },
    ]);

    expect(segments.map((segment) => segment.segmentIndex)).toEqual([0, 1]);
    expect(segments.map((segment) => segment.pageNumber)).toEqual([1, 3]);
  });
});

describe("formatFileSize", () => {
  it("formats kilobytes", () => {
    expect(formatFileSize(1536)).toBe("2 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });
});

describe("getVoiceName", () => {
  it("returns the display name for a known voice", () => {
    expect(getVoiceName("rachel")).toBe("Rachel");
  });

  it("returns Unknown for an unknown voice", () => {
    expect(getVoiceName("nope")).toBe("Unknown");
  });
});

describe("isImageTooLarge", () => {
  it("is false at the limit and true above it", () => {
    expect(isImageTooLarge(MAX_IMAGE_SIZE)).toBe(false);
    expect(isImageTooLarge(MAX_IMAGE_SIZE + 1)).toBe(true);
  });
});

import "server-only";

import { buildSegmentsFromPages } from "@/lib/documents/utils";

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

async function streamToUint8Array(stream: ReadableStream<Uint8Array>) {
  const arrayBuffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export async function extractPdfPages(stream: ReadableStream<Uint8Array>) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = await streamToUint8Array(stream);
  const loadingTask = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const pages: ExtractedPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text) {
      pages.push({ pageNumber, text });
    }
  }

  return {
    pages,
    segments: buildSegmentsFromPages(pages),
    pageCount: pdf.numPages,
  };
}

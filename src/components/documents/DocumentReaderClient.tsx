"use client";

import dynamic from "next/dynamic";

import type { DocumentReaderData } from "@/lib/documents/types";

const DocumentReader = dynamic(() => import("@/components/documents/DocumentReader"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[calc(100vh-140px)] rounded-[24px] border border-(--border-subtle) bg-(--bg-secondary) shadow-soft-lg" />
  ),
});

export default function DocumentReaderClient({
  document,
}: {
  document: DocumentReaderData;
}) {
  return <DocumentReader document={document} />;
}

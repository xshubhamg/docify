"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import BookCard from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import type { DocumentCardItem } from "@/lib/documents/types";

export default function DocumentsGrid({ documents }: { documents: DocumentCardItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = documents.filter(
    (document) =>
      document.title.toLowerCase().includes(query.toLowerCase()) ||
      document.author.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="mt-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="font-serif text-2xl font-bold text-(--text-primary) md:text-3xl">
          All Documents
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--text-muted)" />
          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-7 lg:grid-cols-5">
          {filtered.map((document) => (
            <BookCard key={document.slug} {...document} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-medium) px-6 py-16 text-center">
          <p className="text-lg font-semibold text-(--text-primary)">No documents yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--text-muted)">
            Upload a PDF to get a reader with page navigation and a voice conversation
            grounded in its text.
          </p>
          <Link
            href="/documents/new"
            className="btn-primary font-mona-sans mt-6 inline-flex items-center gap-2"
          >
            Upload your first PDF
          </Link>
        </div>
      ) : (
        <p className="py-16 text-center text-(--text-muted)">
          No documents match &ldquo;{query}&rdquo;. Try a different title or author.
        </p>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { BookCardProps } from "@/../types";
import { Input } from "@/components/ui/input";
import BookCard from "@/components/BookCard";

interface DocumentsGridProps {
  books: BookCardProps[];
}

export default function DocumentsGrid({ books }: DocumentsGridProps) {
  const [query, setQuery] = useState("");

  const filtered = books.filter(
    (book) =>
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase()),
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
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-7 lg:grid-cols-5">
          {filtered.map((book) => (
            <BookCard key={book.slug} {...book} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-(--text-muted)">
          No documents match &ldquo;{query}&rdquo;
        </p>
      )}
    </section>
  );
}

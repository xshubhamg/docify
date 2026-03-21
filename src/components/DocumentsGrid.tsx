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
      book.author.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-(--text-primary) font-serif">
          All Documents
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-(--text-muted)" />
          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-7">
          {filtered.map((book) => (
            <BookCard key={book.slug} {...book} />
          ))}
        </div>
      ) : (
        <p className="text-(--text-muted) text-center py-16">
          No documents match &ldquo;{query}&rdquo;
        </p>
      )}
    </section>
  );
}

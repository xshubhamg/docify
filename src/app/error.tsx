"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with the error reporter once observability lands.
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center bg-(--bg-primary) px-5 py-16"
    >
      <div className="w-full max-w-lg rounded-3xl border border-(--border-subtle) bg-(--bg-card) p-8 shadow-(--shadow-soft-lg) md:p-10">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand)/10">
          <AlertTriangle className="size-6 text-(--color-brand)" />
        </div>

        <h1 className="mt-6 font-serif text-2xl font-semibold text-(--text-primary)">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
          The page hit an unexpected error. You can retry, or head back to the dashboard.
          {error.digest ? (
            <span className="mt-2 block font-mono text-xs text-(--text-muted)">
              Reference: {error.digest}
            </span>
          ) : null}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            className="bg-(--color-brand) text-white hover:bg-(--color-brand-hover)"
          >
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

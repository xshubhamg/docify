import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center bg-(--bg-primary) px-5 py-16"
    >
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-(--color-brand)/10">
          <FileQuestion className="size-7 text-(--color-brand)" />
        </div>
        <p className="mt-6 text-xs font-semibold tracking-[0.24em] text-(--text-muted) uppercase">
          404
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-(--text-primary)">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
          The page you are looking for does not exist, or the document belongs to another
          account.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-(--color-brand) px-6 py-3 font-bold text-white transition-colors hover:bg-(--color-brand-hover) dark:text-[#1e1e2e]"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

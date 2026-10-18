import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-(--bg-primary) pt-[calc(var(--navbar-height)+48px)] pb-24">
      <div className="mx-auto w-full max-w-3xl px-5">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-(--text-muted) transition-colors hover:text-(--color-brand)"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-(--color-brand) uppercase">
          Legal
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-(--text-primary) md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-(--text-muted)">Last updated: {updated}</p>

        <div className="mt-10 space-y-8 rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-6 text-(--text-secondary) md:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-semibold text-(--text-primary)">{title}</h2>
      <div className="space-y-3 text-sm leading-7">{children}</div>
    </section>
  );
}

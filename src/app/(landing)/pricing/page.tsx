import type { Metadata } from "next";
import Link from "next/link";
import { Check, Mic, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Docify",
  description: "Docify is free while it is in beta. No credit card required.",
};

const included = [
  "PDF uploads up to 50 MB",
  "Five ElevenLabs voice personas",
  "Private storage with authenticated streaming",
  "Live transcripts and voice-session history",
  "Page navigation and segment previews",
];

const coming = [
  {
    title: "Usage-based plans",
    description: "Metered voice minutes for heavy users, with a free monthly allowance.",
  },
  {
    title: "Shared workspaces",
    description: "Invite teammates to a document and keep a shared conversation history.",
  },
  {
    title: "Read-only share links",
    description:
      "Send a revocable link to a grounded conversation without sharing the file.",
  },
];

export default function PricingPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-(--bg-primary) pt-[calc(var(--navbar-height)+64px)] pb-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-(--color-brand)/20 bg-(--color-brand)/5 px-4 py-2 text-sm font-medium text-(--color-brand)">
            Pricing
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.02em] text-(--text-primary) md:text-6xl">
            Free while Docify is in beta
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-(--text-secondary)">
            No credit card, no seats, no trial clock. Bring a PDF and start talking.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-3xl border border-(--color-brand)/30 bg-(--bg-card) p-8 shadow-(--shadow-soft-lg) md:p-10">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-widest text-(--color-brand) uppercase">
              <Sparkles className="size-4" aria-hidden="true" />
              Beta
            </div>
            <div className="mt-5 flex items-end gap-2">
              <span className="font-serif text-6xl font-semibold text-(--text-primary)">
                $0
              </span>
              <span className="pb-1 text-(--text-muted)">/ month</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-(--text-secondary)">
              Everything you need to upload a document and hold a grounded voice
              conversation. Fair use applies while the product is in beta.
            </p>

            <ul className="mt-8 space-y-3">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-(--text-primary)"
                >
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-(--success)"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-(--color-brand) px-6 py-3.5 font-bold text-white transition-colors hover:bg-(--color-brand-hover) dark:text-[#1e1e2e]"
            >
              Get started free
            </Link>
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-(--border-subtle) bg-(--bg-secondary) p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
                <ShieldCheck className="size-4 text-(--color-brand)" aria-hidden="true" />
                Built for privacy
              </div>
              <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                Your files are stored with private access and streamed through an
                authenticated proxy. Raw blob URLs are never exposed to the browser.
              </p>
            </section>

            <section className="rounded-3xl border border-(--border-subtle) bg-(--bg-secondary) p-8">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
                <Mic className="size-4 text-(--color-brand)" aria-hidden="true" />
                Voice minutes
              </div>
              <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                Voice is powered by VAPI and ElevenLabs. Beta accounts share a fair-use
                pool; if you need a higher limit, reach out.
              </p>
            </section>
          </div>
        </div>

        <section className="mx-auto mt-20 max-w-5xl">
          <h2 className="font-serif text-2xl font-semibold text-(--text-primary) md:text-3xl">
            What&apos;s coming
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {coming.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-6"
              >
                <h3 className="font-serif text-lg font-semibold text-(--text-primary)">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

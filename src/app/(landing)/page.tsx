import Link from "next/link";
import {
  FileUp,
  Sparkles,
  MessageCircleQuestion,
  ArrowRight,
  ChevronDown,
  Upload,
  BrainCircuit,
  MessagesSquare,
} from "lucide-react";

const features = [
  {
    icon: FileUp,
    title: "Upload Any Document",
    description:
      "PDF, Word, text files — drop them in and Docify handles the rest. Your documents are securely stored and instantly ready for analysis.",
    color: "text-[#209fb5] dark:text-[#74c7ec]",
    bgColor: "bg-[#209fb5]/10 dark:bg-[#74c7ec]/10",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description:
      "Our AI reads, understands, and extracts the key information from your documents — summaries, themes, entities, and more.",
    color: "text-[#fe640b] dark:text-[#fab387]",
    bgColor: "bg-[#fe640b]/10 dark:bg-[#fab387]/10",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask Questions",
    description:
      "Have a conversation with your documents. Ask anything and get precise, context-aware answers backed by your actual content.",
    color: "text-[#179299] dark:text-[#94e2d5]",
    bgColor: "bg-[#179299]/10 dark:bg-[#94e2d5]/10",
  },
];

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your document",
    description: "Drag and drop or browse to upload any supported document format.",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "AI analyzes it",
    description:
      "Our AI processes your document, building a deep understanding of its content.",
  },
  {
    number: "03",
    icon: MessagesSquare,
    title: "Ask & get answers",
    description:
      "Start a conversation. Ask questions and receive accurate, cited answers.",
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* ========== HERO ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--bg-primary)">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat dark:block"
          style={{ backgroundImage: "url('/dark-waves.jpg')" }}
        />
        <div className="absolute inset-0 hidden bg-linear-to-b from-black/40 via-black/20 to-[#1e1e2e] dark:block" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 px-5 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--color-brand)/20 bg-(--color-brand)/5 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-(--success)" />
            <span className="text-sm font-medium text-(--color-brand)">
              AI-powered document intelligence
            </span>
          </div>

          <h1 className="font-serif text-5xl leading-[1.1] font-bold tracking-[-0.03em] text-(--text-primary) md:text-7xl">
            Your documents,
            <br />
            <span className="text-(--color-brand)">supercharged</span> with AI
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-(--text-secondary) md:text-xl">
            Upload any document and unlock instant insights. Ask questions, get summaries,
            and discover what&apos;s hidden in your files — all powered by AI.
          </p>

          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-(--color-brand) px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-(--color-brand-hover) hover:shadow-[0_0_30px_rgba(203,166,247,0.3)] dark:text-[#1e1e2e]"
            >
              Get started free
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-(--color-brand)/25 px-8 py-4 text-lg font-medium text-(--color-brand) backdrop-blur-sm transition-all duration-200 hover:bg-(--color-brand)/10"
            >
              Learn more
            </a>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-(--text-muted) transition-colors hover:text-(--color-brand)"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Explore</span>
          <ChevronDown className="size-5 animate-bounce" />
        </a>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="relative bg-(--bg-primary) py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-16 text-center md:mb-20">
            <span className="mb-4 inline-block text-sm font-semibold tracking-widest text-(--color-brand) uppercase">
              Features
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-[-0.02em] text-(--text-primary) md:text-5xl">
              Everything you need to
              <br className="hidden md:block" />
              <span className="text-(--color-brand)"> understand your documents</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-(--border-subtle) bg-(--bg-card) p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-soft-lg) md:p-10"
              >
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.bgColor} mb-6`}
                >
                  <feature.icon className={`size-7 ${feature.color}`} />
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-(--text-primary)">
                  {feature.title}
                </h3>
                <p className="leading-7 text-(--text-secondary)">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative bg-(--bg-secondary) py-28 md:py-36">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mb-16 text-center md:mb-20">
            <span className="mb-4 inline-block text-sm font-semibold tracking-widest text-(--color-brand) uppercase">
              How it works
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-[-0.02em] text-(--text-primary) md:text-5xl">
              Three steps to <span className="text-(--color-brand)">clarity</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {i < steps.length - 1 && (
                  <div className="absolute top-10 left-[calc(50%+3rem)] hidden h-px w-[calc(100%-6rem)] border-t-2 border-dashed border-(--border-medium) md:block" />
                )}

                <div className="relative mb-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-(--color-brand)/10">
                    <step.icon className="size-9 text-(--color-brand)" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand) text-sm font-bold text-white dark:text-[#1e1e2e]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mb-3 font-serif text-xl font-bold text-(--text-primary)">
                  {step.title}
                </h3>
                <p className="max-w-xs leading-7 text-(--text-secondary)">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative overflow-hidden bg-(--bg-primary)">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat dark:block"
          style={{ backgroundImage: "url('/dark-waves.jpg')" }}
        />
        <div className="absolute inset-0 hidden bg-[#1e1e2e]/80 backdrop-blur-sm dark:block" />

        <div className="relative z-10 mx-auto max-w-3xl px-5 py-28 text-center md:py-36">
          <h2 className="mb-6 font-serif text-3xl font-bold tracking-[-0.02em] text-(--text-primary) md:text-5xl">
            Ready to unlock your
            <br />
            <span className="text-(--color-brand)">document&apos;s potential</span>?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-(--text-secondary)">
            Join Docify and start getting AI-powered answers from your documents in
            seconds. Free to start, no credit card required.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-(--color-brand) px-10 py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-(--color-brand-hover) hover:shadow-[0_0_30px_rgba(203,166,247,0.3)] dark:text-[#1e1e2e]"
          >
            Get started for free
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-(--border-subtle) bg-(--bg-tertiary)">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 md:flex-row">
          <span className="text-lg font-semibold text-(--text-primary)">Docify</span>
          <p className="text-sm text-(--text-muted)">
            &copy; {new Date().getFullYear()} Docify. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

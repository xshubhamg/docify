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
    description:
      "Drag and drop or browse to upload any supported document format.",
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-(--bg-primary)">
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat dark:block"
          style={{ backgroundImage: "url('/dark-waves.jpg')" }}
        />
        <div className="absolute inset-0 hidden bg-linear-to-b from-black/40 via-black/20 to-[#1e1e2e] dark:block" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center flex flex-col items-center gap-8 pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-(--color-brand)/20 bg-(--color-brand)/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-(--success) animate-pulse" />
            <span className="text-sm font-medium text-(--color-brand)">
              AI-powered document intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.1] text-(--text-primary) font-serif">
            Your documents,
            <br />
            <span className="text-(--color-brand)">supercharged</span> with AI
          </h1>

          <p className="text-lg md:text-xl text-(--text-secondary) max-w-2xl leading-relaxed">
            Upload any document and unlock instant insights. Ask questions, get
            summaries, and discover what&apos;s hidden in your files — all
            powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-(--color-brand) hover:bg-(--color-brand-hover) text-white dark:text-[#1e1e2e] font-bold text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(203,166,247,0.3)]"
            >
              Get started free
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-(--color-brand)/25 text-(--color-brand) font-medium text-lg hover:bg-(--color-brand)/10 transition-all duration-200 backdrop-blur-sm"
            >
              Learn more
            </a>
          </div>
        </div>

        <a
          href="#features"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-(--text-muted) hover:text-(--color-brand) transition-colors"
        >
          <span className="text-xs font-medium tracking-widest uppercase">
            Explore
          </span>
          <ChevronDown className="size-5 animate-bounce" />
        </a>
      </section>

      {/* ========== FEATURES ========== */}
      <section
        id="features"
        className="relative bg-(--bg-primary) py-28 md:py-36"
      >
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-(--color-brand) mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-(--text-primary) tracking-[-0.02em] font-serif">
              Everything you need to
              <br className="hidden md:block" />
              <span className="text-(--color-brand)">
                {" "}
                understand your documents
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-(--bg-card) border border-(--border-subtle) rounded-2xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-soft-lg)"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.bgColor} mb-6`}
                >
                  <feature.icon className={`size-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-(--text-primary) mb-3 font-serif">
                  {feature.title}
                </h3>
                <p className="text-(--text-secondary) leading-7">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative bg-(--bg-secondary) py-28 md:py-36">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-(--color-brand) mb-4">
              How it works
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-(--text-primary) tracking-[-0.02em] font-serif">
              Three steps to{" "}
              <span className="text-(--color-brand)">clarity</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px border-t-2 border-dashed border-(--border-medium)" />
                )}

                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-(--color-brand)/10 flex items-center justify-center">
                    <step.icon className="size-9 text-(--color-brand)" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-(--color-brand) text-white dark:text-[#1e1e2e] text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-(--text-primary) mb-3 font-serif">
                  {step.title}
                </h3>
                <p className="text-(--text-secondary) leading-7 max-w-xs">
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

        <div className="relative z-10 max-w-3xl mx-auto px-5 py-28 md:py-36 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-(--text-primary) tracking-[-0.02em] mb-6 font-serif">
            Ready to unlock your
            <br />
            <span className="text-(--color-brand)">
              document&apos;s potential
            </span>
            ?
          </h2>
          <p className="text-lg text-(--text-secondary) mb-10 max-w-xl mx-auto leading-relaxed">
            Join Docify and start getting AI-powered answers from your documents
            in seconds. Free to start, no credit card required.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-(--color-brand) hover:bg-(--color-brand-hover) text-white dark:text-[#1e1e2e] font-bold text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(203,166,247,0.3)]"
          >
            Get started for free
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-(--bg-tertiary) border-t border-(--border-subtle)">
        <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-lg text-(--text-primary)">
            Docify
          </span>
          <p className="text-sm text-(--text-muted)">
            &copy; {new Date().getFullYear()} Docify. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

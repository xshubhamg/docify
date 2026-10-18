"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpenText,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Waves,
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import { Document, Page, pdfjs } from "react-pdf";

import { ASSISTANT_ID, VOICE_SETTINGS, voiceOptions } from "@/lib/constants";
import type { DocumentContextResult, DocumentReaderData } from "@/lib/documents/types";
import { formatFileSize, getVoiceName } from "@/lib/documents/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type VoiceStatus =
  "ready" | "connecting" | "listening" | "thinking" | "speaking" | "error";

type TranscriptMessage = {
  role: "assistant" | "user";
  transcript: string;
};

type PastVoiceSession = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
};

function formatSessionDuration(totalSeconds: number) {
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

const statusClassMap: Record<VoiceStatus, string> = {
  ready: "vapi-status-dot-ready",
  connecting: "vapi-status-dot-connecting",
  listening: "vapi-status-dot-listening",
  thinking: "vapi-status-dot-thinking",
  speaking: "vapi-status-dot-speaking",
  error: "vapi-status-dot-thinking",
};

const statusLabelMap: Record<VoiceStatus, string> = {
  ready: "Ready",
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Needs attention",
};

function DocumentReader({ document }: { document: DocumentReaderData }) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(720);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("ready");
  const [callActive, setCallActive] = useState(false);
  const [isPreparingCall, setIsPreparingCall] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [partialTranscript, setPartialTranscript] = useState<TranscriptMessage | null>(
    null,
  );
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [pastSessions, setPastSessions] = useState<PastVoiceSession[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const viewerShellRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const vapiRef = useRef<Vapi | null>(null);
  const activeVoiceSessionIdRef = useRef<string | null>(null);
  const finalizingVoiceSessionRef = useRef(false);

  const voice = voiceOptions[document.voiceId as keyof typeof voiceOptions];
  const canStartVoice = Boolean(publicKey && ASSISTANT_ID);

  useEffect(() => {
    let cancelled = false;

    async function loadPastSessions() {
      try {
        const response = await fetch(`/api/documents/${document.slug}/voice-sessions`);

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          voiceSessions?: PastVoiceSession[];
        };

        if (!cancelled && Array.isArray(payload.voiceSessions)) {
          setPastSessions(payload.voiceSessions);
        }
      } catch {
        // History is supplementary; the reader works fine without it.
      }
    }

    void loadPastSessions();

    return () => {
      cancelled = true;
    };
  }, [document.slug]);

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${document.title}"? This removes the file, segments, and voice history.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/documents/${document.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete the document.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete the document.";
      setErrorMessage(message);
      setIsDeleting(false);
    }
  }

  const finalizeVoiceSession = useCallback(async () => {
    const sessionId = activeVoiceSessionIdRef.current;

    if (!sessionId || finalizingVoiceSessionRef.current) {
      return;
    }

    finalizingVoiceSessionRef.current = true;

    try {
      await fetch(`/api/documents/${document.slug}/voice-sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endedAt: new Date().toISOString(),
        }),
      });
    } finally {
      activeVoiceSessionIdRef.current = null;
      finalizingVoiceSessionRef.current = false;
    }
  }, [document.slug]);

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    const handleCallStart = () => {
      setCallActive(true);
      setVoiceStatus("listening");
      setErrorMessage(null);
    };

    const handleCallEnd = async () => {
      setCallActive(false);
      setVoiceStatus("ready");
      setPartialTranscript(null);
      setVolumeLevel(0);
      await finalizeVoiceSession();
    };

    const handleSpeechStart = () => {
      setVoiceStatus("speaking");
    };

    const handleSpeechEnd = () => {
      setVoiceStatus("thinking");
    };

    const handleVolume = (level: number) => {
      setVolumeLevel(level);
    };

    const handleMessage = (message: {
      type?: string;
      role?: "assistant" | "user";
      transcript?: string;
      transcriptType?: "final" | "partial";
    }) => {
      if (message.type !== "transcript" || !message.transcript || !message.role) {
        return;
      }

      if (message.role === "user") {
        setVoiceStatus("thinking");
      }

      const transcriptMessage: TranscriptMessage = {
        role: message.role,
        transcript: message.transcript,
      };

      if (message.transcriptType === "final") {
        setTranscript((current) => [...current, transcriptMessage]);
        setPartialTranscript(null);
        return;
      }

      setPartialTranscript(transcriptMessage);
    };

    const handleError = (error: { message?: string } | Error | string) => {
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : (error.message ?? "Voice call failed.");

      setVoiceStatus("error");
      setCallActive(false);
      setErrorMessage(message);
      void finalizeVoiceSession();
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("volume-level", handleVolume);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.removeListener("call-start", handleCallStart);
      vapi.removeListener("call-end", handleCallEnd);
      vapi.removeListener("speech-start", handleSpeechStart);
      vapi.removeListener("speech-end", handleSpeechEnd);
      vapi.removeListener("volume-level", handleVolume);
      vapi.removeListener("message", handleMessage);
      vapi.removeListener("error", handleError);
      void vapi.stop().catch(() => undefined);
      vapiRef.current = null;
    };
  }, [finalizeVoiceSession, publicKey]);

  useEffect(() => {
    const shell = viewerShellRef.current;

    if (!shell) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      setPageWidth(Math.max(280, Math.floor(entry.contentRect.width) - 48));
    });

    observer.observe(shell);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;

    if (!root || !numPages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const mostVisible = visibleEntries[0];

        if (!mostVisible) {
          return;
        }

        const pageNumber = Number(mostVisible.target.getAttribute("data-page-number"));

        if (Number.isFinite(pageNumber)) {
          setCurrentPage(pageNumber);
        }
      },
      {
        root,
        threshold: [0.35, 0.6, 0.8],
      },
    );

    pageRefs.current.forEach((pageRef) => {
      if (pageRef) {
        observer.observe(pageRef);
      }
    });

    return () => observer.disconnect();
  }, [numPages]);

  const jumpToPage = useCallback((pageNumber: number) => {
    const pageRef = pageRefs.current[pageNumber - 1];

    if (!pageRef) {
      return;
    }

    pageRef.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setCurrentPage(pageNumber);
  }, []);

  const navigationPages = useMemo(
    () => Array.from({ length: numPages }, (_, index) => index + 1),
    [numPages],
  );

  const allTranscript = partialTranscript
    ? [...transcript, partialTranscript]
    : transcript;

  async function handleVoiceToggle() {
    if (!vapiRef.current || !canStartVoice || isPreparingCall) {
      return;
    }

    if (callActive) {
      await vapiRef.current.stop();
      await finalizeVoiceSession();
      setCallActive(false);
      setVoiceStatus("ready");
      return;
    }

    setIsPreparingCall(true);
    setVoiceStatus("connecting");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/documents/${document.slug}/voice-sessions`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        error?: string;
        voiceSession?: { id: string };
      };

      if (!response.ok || !payload.voiceSession) {
        throw new Error(payload.error ?? "Could not start a voice session.");
      }

      activeVoiceSessionIdRef.current = payload.voiceSession.id;
      setTranscript([]);
      setPartialTranscript(null);

      // Ground the call with an overview of the document. Best-effort:
      // a context failure must never block the voice call.
      // Contract: the VAPI dashboard system prompt should reference
      // {{documentTitle}} / {{documentContext}}.
      let documentContext = "";

      try {
        const contextResponse = await fetch(
          `/api/documents/${document.slug}/context?limit=5`,
        );

        if (contextResponse.ok) {
          const contextPayload = (await contextResponse.json()) as DocumentContextResult;
          documentContext = contextPayload.segments
            .map(
              (segment) =>
                `[p${segment.pageNumber ?? "?"} #${segment.segmentIndex}] ${segment.content}`,
            )
            .join("\n\n");
        }
      } catch {
        console.warn(
          "Document context unavailable, starting voice call without grounding.",
        );
      }

      const elevenLabsVoiceId =
        voiceOptions[document.voiceId as keyof typeof voiceOptions]?.id;

      await vapiRef.current.start(ASSISTANT_ID, {
        variableValues: {
          documentTitle: document.title,
          documentAuthor: document.author,
          documentContext,
        },
        metadata: {
          documentId: document.id,
          slug: document.slug,
          voiceId: document.voiceId,
        },
        ...(elevenLabsVoiceId
          ? {
              voice: {
                provider: "11labs" as const,
                voiceId: elevenLabsVoiceId,
                stability: VOICE_SETTINGS.stability,
                similarityBoost: VOICE_SETTINGS.similarityBoost,
              },
            }
          : {}),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not start the voice call.";
      setVoiceStatus("error");
      setErrorMessage(message);
      await finalizeVoiceSession();
    } finally {
      setIsPreparingCall(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="shadow-soft-lg flex min-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-[24px] border border-(--border-subtle) bg-(--bg-secondary)">
        <div className="border-b border-(--border-subtle) px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-(--text-muted) uppercase">
                Document Reader
              </p>
              <h1 className="font-serif text-3xl font-semibold text-(--text-primary)">
                {document.title}
              </h1>
              <p className="text-sm text-(--text-secondary)">
                {document.author} · {formatFileSize(document.fileSize)} ·{" "}
                {document.totalSegments} segments
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-(--bg-card) px-3 py-2 text-xs font-medium text-(--text-secondary)">
                Page {currentPage}
                {numPages ? ` / ${numPages}` : ""}
              </span>
              <span className="rounded-full bg-(--bg-card) px-3 py-2 text-xs font-medium text-(--text-secondary)">
                Voice: {getVoiceName(document.voiceId)}
              </span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || callActive}
                title="Delete document"
                className="cursor-pointer rounded-full bg-(--bg-card) px-3 py-2 text-xs font-medium text-(--red-700) transition-colors hover:bg-(--red-50) disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div ref={viewerShellRef} className="flex-1 p-4 md:p-6">
          <div
            ref={scrollContainerRef}
            className="h-[calc(100vh-250px)] overflow-y-auto rounded-[20px] bg-(--bg-primary) p-3 md:p-6"
          >
            <Document
              file={document.fileUrl}
              loading={
                <div className="flex h-full min-h-120 items-center justify-center text-(--text-secondary)">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              }
              onLoadError={(error) => setErrorMessage(error.message)}
              onLoadSuccess={({ numPages: totalPages }) => {
                setNumPages(totalPages);
              }}
            >
              <div className="mx-auto flex max-w-[900px] flex-col gap-5">
                {navigationPages.map((pageNumber) => (
                  <div
                    key={pageNumber}
                    ref={(node) => {
                      pageRefs.current[pageNumber - 1] = node;
                    }}
                    data-page-number={pageNumber}
                    className="shadow-soft-sm rounded-[20px] border border-(--border-subtle) bg-white p-3"
                  >
                    <div className="mb-3 flex items-center justify-between px-2">
                      <span className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        Page {pageNumber}
                      </span>
                    </div>
                    <Page
                      pageNumber={pageNumber}
                      width={pageWidth}
                      renderAnnotationLayer
                      renderTextLayer
                    />
                  </div>
                ))}
              </div>
            </Document>
          </div>
        </div>
      </section>

      <aside className="shadow-soft-lg rounded-[24px] border border-(--border-subtle) bg-(--bg-secondary) p-4 md:p-5">
        <Tabs defaultValue="navigate" className="h-full">
          <TabsList className="w-full">
            <TabsTrigger value="navigate">Navigate</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>

          <TabsContent value="navigate" className="mt-4 space-y-4">
            <div className="rounded-[20px] bg-(--bg-card) p-4">
              <div className="flex items-start gap-3">
                <BookOpenText className="mt-0.5 size-5 text-(--color-brand)" />
                <div className="space-y-1">
                  <p className="font-serif text-lg font-semibold text-(--text-primary)">
                    Page Navigator
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    Jump anywhere in the PDF. The active page stays highlighted as you
                    scroll.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto pr-1">
              {navigationPages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => jumpToPage(pageNumber)}
                  className={cn(
                    "cursor-pointer rounded-[18px] border p-4 text-left transition-all",
                    currentPage === pageNumber
                      ? "shadow-soft-sm border-(--color-brand) bg-(--color-brand)/10"
                      : "border-(--border-subtle) bg-(--bg-card) hover:bg-(--bg-tertiary)",
                  )}
                >
                  <span className="block text-xs font-semibold tracking-[0.16em] text-(--text-muted) uppercase">
                    Page
                  </span>
                  <span className="mt-2 block font-serif text-2xl font-semibold text-(--text-primary)">
                    {pageNumber}
                  </span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="segments" className="mt-4 space-y-4">
            <div className="rounded-[20px] bg-(--bg-card) p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-5 text-(--color-brand)" />
                <div className="space-y-1">
                  <p className="font-serif text-lg font-semibold text-(--text-primary)">
                    Semantic Segments
                  </p>
                  <p className="text-sm text-(--text-secondary)">
                    These chunks come from your ingestion pipeline and are ready for
                    retrieval and voice grounding.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
              {document.segments.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => segment.pageNumber && jumpToPage(segment.pageNumber)}
                  className="w-full cursor-pointer rounded-[18px] border border-(--border-subtle) bg-(--bg-card) p-4 text-left transition-colors hover:bg-(--bg-tertiary)"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold tracking-[0.14em] text-(--text-muted) uppercase">
                      Segment {segment.segmentIndex + 1}
                    </span>
                    <span className="rounded-full bg-(--bg-secondary) px-2.5 py-1 text-xs text-(--text-secondary)">
                      {segment.pageNumber ? `Page ${segment.pageNumber}` : "No page"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-(--text-primary)">
                    {segment.preview}
                  </p>
                  <p className="mt-3 text-xs text-(--text-muted)">
                    {segment.wordCount} words
                  </p>
                </button>
              ))}

              {!document.segments.length && (
                <div className="rounded-[18px] border border-dashed border-(--border-subtle) p-5 text-sm text-(--text-secondary)">
                  No extractable segments were found in this PDF yet.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="voice" className="mt-4 space-y-4">
            <div className="vapi-header-card">
              <div className="vapi-cover-wrapper">
                <div className="relative">
                  <Image
                    src={document.coverUrl}
                    alt={document.title}
                    width={162}
                    height={240}
                    className="vapi-cover-image"
                  />
                  <div className="vapi-mic-wrapper">
                    {callActive && <span className="vapi-pulse-ring" />}
                    <button
                      type="button"
                      className={cn(
                        "vapi-mic-btn",
                        callActive ? "vapi-mic-btn-active" : "vapi-mic-btn-inactive",
                      )}
                      onClick={handleVoiceToggle}
                      disabled={!canStartVoice || isPreparingCall}
                    >
                      {callActive ? (
                        <MicOff className="size-5 text-(--text-primary)" />
                      ) : (
                        <Mic className="size-5 text-(--text-primary)" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="vapi-badge-ai">
                  <span className="vapi-badge-ai-text">{voice?.name ?? "Voice"}</span>
                </span>

                <div className="vapi-status-indicator">
                  <span className={cn("vapi-status-dot", statusClassMap[voiceStatus])} />
                  <span className="vapi-status-text">{statusLabelMap[voiceStatus]}</span>
                </div>

                <p className="text-sm leading-6 text-(--text-secondary)">
                  Talk to this document with the selected assistant voice. Voice sessions
                  are recorded in your database as they start and finish.
                </p>

                {!canStartVoice && (
                  <p className="text-sm text-(--text-muted)">
                    Add `NEXT_PUBLIC_VAPI_PUBLIC_KEY` and `NEXT_PUBLIC_ASSISTANT_ID` to
                    enable live voice calls.
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleVoiceToggle}
                    disabled={!canStartVoice || isPreparingCall}
                    className="bg-(--color-brand) text-white hover:bg-(--color-brand-hover)"
                  >
                    {isPreparingCall ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Connecting
                      </>
                    ) : callActive ? (
                      <>
                        <MicOff className="size-4" />
                        End conversation
                      </>
                    ) : (
                      <>
                        <Mic className="size-4" />
                        Start conversation
                      </>
                    )}
                  </Button>

                  <div className="vapi-stat-box-sm min-w-0 flex-1 px-4 py-3 text-left">
                    <p className="vapi-stat-label mb-1 text-sm">Live level</p>
                    <div className="flex items-center gap-2">
                      <Waves className="size-4 text-(--color-brand)" />
                      <div className="h-2 flex-1 rounded-full bg-(--bg-secondary)">
                        <div
                          className="h-2 rounded-full bg-(--color-brand) transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(4, volumeLevel * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-(--bg-card) p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-(--text-primary)">
                  Past Conversations
                </h2>
                <span className="text-xs tracking-[0.18em] text-(--text-muted) uppercase">
                  {pastSessions.length}
                </span>
              </div>

              {pastSessions.length ? (
                <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {pastSessions.slice(0, 5).map((pastSession) => (
                    <li
                      key={pastSession.id}
                      className="flex items-center justify-between gap-2 rounded-[14px] bg-(--bg-secondary) px-3.5 py-2.5 text-sm"
                    >
                      <span className="text-(--text-secondary)">
                        {new Date(pastSession.startedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-medium text-(--text-primary)">
                        {formatSessionDuration(pastSession.durationSeconds)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-(--text-secondary)">
                  No voice conversations yet. Your history will appear here.
                </p>
              )}
            </div>

            <div className="vapi-transcript-wrapper rounded-[20px] bg-(--bg-card) p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-(--text-primary)">
                  Live Transcript
                </h2>
                <span className="text-xs tracking-[0.18em] text-(--text-muted) uppercase">
                  {allTranscript.length} lines
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {allTranscript.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn(
                      "rounded-[16px] px-4 py-3",
                      message.role === "assistant"
                        ? "bg-(--bg-secondary)"
                        : "bg-(--color-brand)/10",
                    )}
                  >
                    <p className="text-xs font-semibold tracking-[0.16em] text-(--text-muted) uppercase">
                      {message.role === "assistant" ? "Assistant" : "You"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-(--text-primary)">
                      {message.transcript}
                    </p>
                  </div>
                ))}

                {!allTranscript.length && (
                  <div className="rounded-[18px] border border-dashed border-(--border-subtle) px-4 py-6 text-sm leading-6 text-(--text-secondary)">
                    Start a conversation and the transcript will appear here in real time.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {errorMessage && (
          <div className="mt-4 rounded-[18px] border border-(--red-200) bg-(--red-50) px-4 py-3 text-sm text-(--red-700)">
            {errorMessage}
          </div>
        )}
      </aside>
    </div>
  );
}

export default DocumentReader;

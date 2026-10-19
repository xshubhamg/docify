import { ImageResponse } from "next/og";

export const alt = "Docify — voice-first document intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background: "linear-gradient(135deg, #1e1e2e 0%, #302d41 100%)",
        color: "#cdd6f4",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#cba6f7",
            color: "#1e1e2e",
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          D
        </div>
        Docify
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Talk to your documents
        </div>
        <div style={{ fontSize: 30, color: "#a6adc8", maxWidth: 900 }}>
          Upload a PDF and hold a live voice conversation grounded in its text, with the
          source and transcript side by side.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          fontSize: 24,
          color: "#cba6f7",
        }}
      >
        <span>PDF-only</span>
        <span>·</span>
        <span>Full-text grounding</span>
        <span>·</span>
        <span>Private storage</span>
      </div>
    </div>,
    { ...size },
  );
}

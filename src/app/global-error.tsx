"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#1e1e2e",
          color: "#cdd6f4",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ letterSpacing: "0.24em", fontSize: 12, color: "#cba6f7" }}>
            DOCIFY
          </p>
          <h1 style={{ fontSize: 28, margin: "16px 0 12px" }}>The app failed to load</h1>
          <p style={{ color: "#bac2de", lineHeight: 1.7, fontSize: 14 }}>
            A fatal error occurred before the page could render. Reload to try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 28,
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              background: "#cba6f7",
              color: "#1e1e2e",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

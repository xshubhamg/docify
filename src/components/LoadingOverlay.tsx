"use client";

import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="loading-wrapper">
      <div className="loading-shadow-wrapper bg-(--bg-card)">
        <div className="loading-shadow">
          <Loader2 className="loading-animation w-12 h-12 text-(--color-brand)" />
          <h3 className="loading-title">Synthesizing your book…</h3>
          <div className="loading-progress">
            <div className="loading-progress-item">
              <span className="loading-progress-status" />
              <span className="text-(--text-secondary)">Processing document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

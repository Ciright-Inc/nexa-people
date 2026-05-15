"use client";

import { useEffect, useState } from "react";

const TOAST_DURATION_MS = 2000;

type SiteAddedToastProps = {
  host: string | null;
  onDismiss?: () => void;
};

export function SiteAddedToast({ host, onDismiss }: SiteAddedToastProps) {
  const [visible, setVisible] = useState(Boolean(host));

  useEffect(() => {
    if (!host) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const id = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(id);
  }, [host, onDismiss]);

  if (!visible || !host) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="nexa-login-success-toast pointer-events-none fixed right-3 top-3 z-[1100] max-w-[min(100vw-1.5rem,22rem)] sm:right-5 sm:top-4"
    >
      <div className="flex items-center gap-2.5 rounded-xl border border-[#0e8a5d]/45 bg-[#0e8a5d] px-3.5 py-2.5 text-sm leading-tight text-white shadow-none">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4ADE80] text-white"
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="min-w-0 flex-1 text-white">
          <strong className="font-bold">Website added successfully.</strong>
          <br />
          <span className="font-semibold">
            <span className="font-mono">{host}</span> is ready for analytics.
          </span>
        </p>
      </div>
    </div>
  );
}

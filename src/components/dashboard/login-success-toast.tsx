"use client";

import { useEffect, useRef, useState } from "react";

export const LOGIN_SUCCESS_TOAST_STORAGE_KEY = "nexa_login_success_toast";

/** Toast stays visible this long, then unmounts (notification-style). */
const LOGIN_SUCCESS_TOAST_DURATION_MS = 2000;

export function LoginSuccessToast() {
  const [visible, setVisible] = useState(false);
  /** Survives React Strict Mode's effect setup→cleanup→setup on the same instance (session flag is only read once). */
  const pendingDismissRef = useRef(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LOGIN_SUCCESS_TOAST_STORAGE_KEY) === "1") {
        sessionStorage.removeItem(LOGIN_SUCCESS_TOAST_STORAGE_KEY);
        pendingDismissRef.current = true;
        setVisible(true);
      }
    } catch {
      return;
    }

    if (!pendingDismissRef.current) return;

    const id = window.setTimeout(() => {
      pendingDismissRef.current = false;
      setVisible(false);
    }, LOGIN_SUCCESS_TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="nexa-login-success-toast pointer-events-none fixed right-3 top-3 z-[1100] max-w-[min(100vw-1.5rem,20rem)] sm:right-5 sm:top-4"
    >
      <div
        className="flex items-center gap-2.5 rounded-xl border border-[#0e8a5d]/45 bg-[#0e8a5d] px-3.5 py-2.5 text-sm leading-tight text-white shadow-none"
      >
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
          <strong className="font-bold">Signed in successfully.</strong>
          <br />
          <span className="font-semibold">Your analytics workspace is ready.</span>
        </p>
      </div>
    </div>
  );
}

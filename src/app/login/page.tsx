"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppLogo } from "@/components/brand/app-logo";
import { LOGIN_SUCCESS_TOAST_STORAGE_KEY } from "@/components/dashboard/login-success-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authErrorBannerKey, setAuthErrorBannerKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [resetServerError, setResetServerError] = useState<string | null>(null);
  const [resetErrorBannerKey, setResetErrorBannerKey] = useState(0);

  function validate(): boolean {
    const e = email.trim();
    const p = password;

    const nextEmailError = e.length === 0 ? "Email is required." : null;
    const nextPasswordError = p.length === 0 ? "Password is required." : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    return !nextEmailError && !nextPasswordError;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Sign-in failed.");
        setAuthErrorBannerKey((k) => k + 1);
        return;
      }
      try {
        sessionStorage.setItem(LOGIN_SUCCESS_TOAST_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      router.push("/dashboard/sites");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setAuthErrorBannerKey((k) => k + 1);
    } finally {
      setPending(false);
    }
  }

  async function sendResetLink() {
    const e = resetEmail.trim();
    const nextErr = e.length === 0 ? "Email is required." : null;
    setResetEmailError(nextErr);
    if (nextErr) return;

    setResetPending(true);
    setResetServerError(null);
    setResetSent(false);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setResetServerError(
          typeof data.error === "string" ? data.error : "Failed to send reset link."
        );
        setResetErrorBannerKey((k) => k + 1);
        return;
      }
      setResetSent(true);
    } catch {
      setResetServerError("Network error. Try again.");
      setResetErrorBannerKey((k) => k + 1);
    } finally {
      setResetPending(false);
    }
  }

  return (
    <div className="nexa-login-canvas flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-md p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 items-center justify-center">
            <AppLogo className="h-10 w-auto" title="Ciright" priority />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Nexa People
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Enter your company credentials to access the{" "}
            <span className="font-semibold text-primary">analytics dashboard</span>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900" htmlFor="email">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                  if (error) setError(null);
                }}
                onBlur={() => {
                  if (!email.trim()) setEmailError("Email is required.");
                }}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                className={`relative z-0 w-full rounded-xl border bg-white/95 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-nexa ease-nexa-out placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  emailError
                    ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200"
                    : "border-slate-900/10 focus:border-primary/30 focus:ring-primary/15"
                }`}
                placeholder="name@company.com"
              />
              <div className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-primary/65">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                  <path
                    d="M4 6.5C4 5.12 5.12 4 6.5 4h11C19.88 4 21 5.12 21 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M6.5 7.5 12 11.5l5.5-4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            {emailError ? (
              <p id="email-error" className="mt-2 text-xs font-medium text-rose-700">
                {emailError}
              </p>
            ) : null}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-slate-900" htmlFor="password">
                Password <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                onClick={() => {
                  setResetSent(false);
                  setResetEmailError(null);
                  setResetServerError(null);
                  setResetEmail(email.trim());
                  setResetOpen(true);
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (error) setError(null);
                }}
                onBlur={() => {
                  if (!password) setPasswordError("Password is required.");
                }}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? "password-error" : undefined}
                className={`relative z-0 w-full rounded-xl border bg-white/95 py-3 pl-11 pr-12 text-sm text-slate-900 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-nexa ease-nexa-out placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  passwordError
                    ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200"
                    : "border-slate-900/10 focus:border-primary/30 focus:ring-primary/15"
                }`}
                placeholder="Enter password"
              />
              <div className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-primary/65">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
                  <path
                    d="M7.5 10.2V8.7a4.5 4.5 0 1 1 9 0v1.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 10h10a2 2 0 0 1 2 2v6.5A2.5 2.5 0 0 1 16.5 21h-9A2.5 2.5 0 0 1 5 18.5V12a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 z-20 flex items-center rounded-lg px-1 text-slate-600 hover:bg-slate-900/[0.04] hover:text-slate-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 4l16 16"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.7 10.7a3.2 3.2 0 0 0 4.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6.4 6.6C4.2 8.3 3 10.5 3 12c0 0 3.5 7 9 7 1.6 0 3-.3 4.2-.9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.3 5.4A9.5 9.5 0 0 1 12 5c5.5 0 9 7 9 7 0 1.4-1 3.5-3 5.2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            {passwordError ? (
              <p id="password-error" className="mt-2 text-xs font-medium text-rose-700">
                {passwordError}
              </p>
            ) : null}
          </div>

          {error ? (
            <div
              key={authErrorBannerKey}
              role="alert"
              className="nexa-login-error-banner flex items-center gap-2.5 rounded-lg border border-red-800/40 bg-red-600 px-3 py-1.5 text-sm font-semibold leading-tight text-white shadow-[0_8px_24px_rgba(185,28,28,0.38),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/20"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35"
                aria-hidden
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  <path
                    d="M12 8v5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
                </svg>
              </span>
              <p className="min-w-0 flex-1 tracking-tight text-white">{error}</p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="hover-lift mt-2 w-full rounded-md bg-primary p-2 text-sm font-semibold text-primary-foreground shadow-card transition-all duration-nexa ease-nexa-out hover:bg-primary-muted active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ©{new Date().getFullYear()} Ciright. All Rights Reserved.
        </p>
      </div>

      {resetOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-slate-950/20 backdrop-blur-[3px] transition-opacity duration-nexa"
            aria-label="Close reset password modal"
            onClick={() => setResetOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-900/[0.08] bg-white/82 shadow-glass backdrop-blur-xl transition-shadow duration-nexa ease-nexa-out">
              <div className="px-6 pb-6 pt-5">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Reset Your Password
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-900" htmlFor="reset-email">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (resetEmailError) setResetEmailError(null);
                      if (resetSent) setResetSent(false);
                    }}
                    onBlur={() => {
                      if (!resetEmail.trim()) setResetEmailError("Email is required.");
                    }}
                    aria-invalid={!!resetEmailError}
                    aria-describedby={resetEmailError ? "reset-email-error" : undefined}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 ${
                      resetEmailError
                        ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200"
                        : "border-slate-900/10 focus:border-primary/30 focus:ring-primary/15"
                    }`}
                    placeholder="name@ciright.com"
                  />
                  {resetEmailError ? (
                    <p id="reset-email-error" className="mt-2 text-xs font-medium text-rose-700">
                      {resetEmailError}
                    </p>
                  ) : null}
                  {resetSent ? (
                    <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                      If an account exists for this email, a reset link has been sent.
                    </p>
                  ) : null}
                  {resetServerError ? (
                    <div
                      key={resetErrorBannerKey}
                      role="alert"
                      className="nexa-login-error-banner mt-3 flex items-center gap-2.5 rounded-lg border border-red-800/40 bg-red-600 px-3 py-1.5 text-sm font-semibold leading-tight text-white shadow-[0_8px_24px_rgba(185,28,28,0.38),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/20"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/35"
                        aria-hidden
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                          <path
                            d="M12 8v5"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                          <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
                        </svg>
                      </span>
                      <p className="min-w-0 flex-1 tracking-tight text-white">
                        {resetServerError}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setResetOpen(false)}
                    className="rounded-xl border border-slate-900/10 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-900/15 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={sendResetLink}
                    disabled={resetPending}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetPending ? "Sending…" : "Send Reset Link"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

"use client";

import { useCallback, useId, useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

import { TimezoneCombobox } from "./timezone-combobox";
import { isValidAnalyticsHost, normalizeSiteHostInput } from "@/lib/normalize-site-host";
import { addPersonalSiteApi } from "@/lib/personal-sites-fetch";
import { buildPersonalSiteInstallSnippet } from "@/lib/site-snippet";
import { DEFAULT_TIMEZONE_ID, getTimezoneOptions } from "@/lib/timezones";
import { SiteAddedToast } from "./site-added-toast";

const STEPS = [
  { id: 1, label: "Add site info" },
  { id: 2, label: "Install snippet" },
  { id: 3, label: "Verify installation" },
] as const;

const STEP_DONE_FILL =
  "linear-gradient(165deg,var(--green) 0%,var(--green) 42%,#22c55e 100%)";

export function AddSiteWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [domain, setDomain] = useState("");
  /** Host locked in when leaving step 1 (drives snippet + API + step 3 copy). */
  const [confirmedHost, setConfirmedHost] = useState("");
  const [timezoneId, setTimezoneId] = useState(DEFAULT_TIMEZONE_ID);
  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  const [copied, setCopied] = useState(false);
  const [savingSite, setSavingSite] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successToastHost, setSuccessToastHost] = useState<string | null>(null);
  const dismissSuccessToast = useCallback(() => setSuccessToastHost(null), []);
  const tzFieldId = useId();
  const tzLabelId = `${tzFieldId}-label`;

  const normalizedInput = useMemo(() => normalizeSiteHostInput(domain), [domain]);
  const canContinueStep1 = isValidAnalyticsHost(normalizedInput);

  const activeHost = step === 1 ? normalizedInput : confirmedHost;

  const snippet = useMemo(
    () => buildPersonalSiteInstallSnippet(activeHost || "example.com"),
    [activeHost]
  );

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <SiteAddedToast host={successToastHost} onDismiss={dismissSuccessToast} />
    <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          prefetch
          className="text-sm font-medium text-primary underline-offset-2 transition hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      <nav aria-label="Progress" className="mb-6">
        <ol className="flex flex-wrap items-center justify-center gap-2 sm:justify-between sm:gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex min-w-0 flex-1 items-center sm:min-w-[unset] sm:flex-none">
                {i > 0 ? (
                  <span
                    className="mx-1 hidden h-px min-w-[1rem] flex-1 bg-slate-200 sm:mx-2 sm:block sm:min-w-[2rem]"
                    aria-hidden
                  />
                ) : null}
                <div
                  className={clsx(
                    "flex min-w-0 items-center gap-2 rounded-full px-1 py-1 sm:gap-2.5 sm:px-2",
                    active && "bg-primary/8"
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums sm:h-9 sm:w-9 sm:text-sm",
                      done &&
                        "border-[rgba(34,197,94,0.42)] text-white shadow-sm",
                      active && !done && "border-primary bg-primary text-white shadow-sm",
                      !active && !done && "border-slate-200 bg-white text-slate-500"
                    )}
                    style={done ? { background: STEP_DONE_FILL } : undefined}
                  >
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                        <path
                          d="M5 10.5 8.5 14 15 6"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      s.id
                    )}
                  </span>
                  <span
                    className={clsx(
                      "hidden truncate text-xs font-semibold sm:inline sm:max-w-[8rem] sm:text-[13px]",
                      active && "text-slate-900",
                      done && "text-slate-600",
                      !active && !done && "text-slate-400"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 flex justify-center gap-6 text-center text-[11px] font-semibold text-slate-500 sm:hidden">
          {STEPS.map((s) => (
            <span key={s.id} className={clsx(step === s.id && "text-primary")}>
              {s.label}
            </span>
          ))}
        </div>
      </nav>

      <div className="dash-card-lg p-5 sm:p-7">
        {step === 1 ? (
          <div className="space-y-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              Add website info
            </h2>
            <div className="space-y-2">
              <label htmlFor="site-domain" className="text-sm font-semibold text-slate-900">
                Domain
              </label>
              <p className="text-xs leading-relaxed text-slate-500">
                Use the naked domain or subdomain — omit{" "}
                <span className="font-mono text-slate-600">www</span>,{" "}
                <span className="font-mono text-slate-600">https://</span>, etc.
              </p>
              <input
                id="site-domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="space-y-2">
              <label id={tzLabelId} htmlFor={tzFieldId} className="text-sm font-semibold text-slate-900">
                Reporting timezone
              </label>
              <p className="text-xs text-slate-500">So daily rollups align with your team.</p>
              <TimezoneCombobox
                id={tzFieldId}
                labelId={tzLabelId}
                options={timezoneOptions}
                value={timezoneId}
                onChange={setTimezoneId}
              />
            </div>
            <button
              type="button"
              disabled={!canContinueStep1}
              onClick={() => {
                if (!canContinueStep1) return;
                setConfirmedHost(normalizedInput);
                setSaveError(null);
                setStep(2);
              }}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              Install snippet
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Paste this tag into the <span className="font-semibold text-slate-800">&lt;head&gt;</span>{" "}
              of your site. See internal docs for framework-specific notes.
            </p>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/80 p-4 font-mono text-[11px] leading-relaxed text-slate-800 sm:text-xs">
              <pre className="overflow-x-auto whitespace-pre-wrap break-all pr-16">{snippet}</pre>
              <button
                type="button"
                onClick={copySnippet}
                className="absolute bottom-3 right-3 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.06]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {saveError ? (
              <p className="text-sm font-medium text-rose-700" role="alert">
                {saveError}
              </p>
            ) : null}
            <button
              type="button"
              disabled={savingSite}
              onClick={() => {
                if (!confirmedHost || savingSite) return;
                setSaveError(null);
                setSavingSite(true);
                void addPersonalSiteApi(confirmedHost, timezoneId)
                  .then(() => {
                    setSuccessToastHost(confirmedHost);
                    setStep(3);
                  })
                  .catch((e: unknown) => {
                    setSaveError(e instanceof Error ? e.message : "Could not save site");
                  })
                  .finally(() => {
                    setSavingSite(false);
                  });
              }}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingSite ? "Saving…" : "Start collecting data"}
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center sm:gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-visible rounded-full bg-transparent sm:h-24 sm:w-24">
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
                aria-hidden
              >
                <span className="box-border h-4 w-4 shrink-0 rounded-full border-2 border-[rgba(34,197,94,0.5)] bg-transparent animate-nexa-ripple-ring sm:h-5 sm:w-5" />
              </span>
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
                aria-hidden
              >
                <span className="box-border h-4 w-4 shrink-0 rounded-full border-2 border-[rgba(74,222,128,0.48)] bg-transparent animate-nexa-ripple-ring [animation-delay:0.925s] sm:h-5 sm:w-5" />
              </span>
              <span
                className="relative z-[1] h-4 w-4 shrink-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-1px_1px_rgba(21,128,61,0.32)] sm:h-5 sm:w-5"
                style={{
                  background: STEP_DONE_FILL,
                }}
                aria-hidden
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Awaiting your first signal
            </h2>
            <p className="w-full text-base leading-relaxed text-slate-600 sm:text-lg">
              When traffic hits <span className="font-semibold text-slate-900">{confirmedHost}</span>,{" "}
              ingestion will show up in Nexa People within a few minutes.
            </p>
            <Link
              href="/dashboard/sites"
              prefetch
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:py-4"
            >
              Return to My Personal Sites
            </Link>
          </div>
        ) : null}
      </div>
    </main>
    </>
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";

import { getActivePersonalSitesSorted, PERSONAL_SITES_LIST_CHANGED_EVENT } from "@/lib/personal-sites-storage";
import type { SelectedSitePayload } from "@/lib/selected-site";
import { persistSelectedSiteForDashboard, readSelectedSiteFromSession, SELECTED_SITE_CHANGED_EVENT } from "@/lib/selected-site";

export function PersonalSiteSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  /** null until after mount — avoids hydration mismatch (sessionStorage missing on server). */
  const [sessionSite, setSessionSite] = useState<SelectedSitePayload | null>(null);

  const bump = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setSessionSite(readSelectedSiteFromSession());
  }, [tick]);

  useEffect(() => {
    const bumpTick = () => bump();
    window.addEventListener("storage", bumpTick);
    window.addEventListener(SELECTED_SITE_CHANGED_EVENT, bumpTick);
    window.addEventListener(PERSONAL_SITES_LIST_CHANGED_EVENT, bumpTick);
    window.addEventListener("focus", bumpTick);
    return () => {
      window.removeEventListener("storage", bumpTick);
      window.removeEventListener(SELECTED_SITE_CHANGED_EVENT, bumpTick);
      window.removeEventListener(PERSONAL_SITES_LIST_CHANGED_EVENT, bumpTick);
      window.removeEventListener("focus", bumpTick);
    };
  }, [bump]);

  const sortedSites = useMemo(() => {
    void tick;
    return getActivePersonalSitesSorted();
  }, [tick]);

  const current = useMemo(() => {
    if (!sessionSite) return null;
    return sortedSites.find((s) => s.id === sessionSite.id) ?? null;
  }, [sessionSite, sortedSites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedSites;
    return sortedSites.filter((s) => s.host.toLowerCase().includes(q));
  }, [query, sortedSites]);

  const label = useMemo(() => {
    if (current) return current.host;
    if (sessionSite) return sessionSite.host;
    if (sortedSites.length === 0) return "No sites";
    return "Select site";
  }, [current, sessionSite, sortedSites.length]);

  const ariaLabel = useMemo(() => `Site: ${label}`, [label]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          bump();
          setOpen((v) => !v);
        }}
        className={clsx(
          "flex min-w-[240px] items-center justify-between gap-3 rounded-xl border border-slate-900/10 bg-white/90 px-3 py-2 text-left text-sm text-slate-800 shadow-sm backdrop-blur-sm transition-all duration-nexa ease-nexa-out hover:border-primary/25 hover:shadow-md",
          open && "border-primary/40 ring-2 ring-primary/25"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="min-w-0 truncate font-mono font-semibold text-slate-900">{label}</span>
        <span className="text-slate-500" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5 10 12.5l5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            aria-label="Close site menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-2 flex w-max min-w-[240px] max-w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-900/10 bg-white shadow-glass">
            <div className="relative border-b border-slate-900/10 p-3">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sites…"
                className="w-full min-w-[240px] rounded-xl border border-slate-900/10 bg-white px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M21 21l-4.3-4.3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <ul role="listbox" className="max-h-72 w-full min-w-0 overflow-auto p-2" tabIndex={-1}>
              {filtered.map((s) => {
                const selected = sessionSite?.id === s.id;
                return (
                  <li key={s.id} className="w-full">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={clsx(
                        "flex w-full min-w-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-900/[0.04]",
                        selected && "bg-primary text-white hover:bg-primary-muted"
                      )}
                      onClick={() => {
                        const selectionChanged = sessionSite?.id !== s.id;
                        persistSelectedSiteForDashboard({ id: s.id, host: s.host });
                        setOpen(false);
                        setQuery("");
                        bump();

                        const onMainDashboard = pathname === "/dashboard";
                        if (onMainDashboard && selectionChanged) {
                          // Same-route client navigation is a no-op; reload so analytics clearly re-mount.
                          window.location.assign("/dashboard");
                          return;
                        }
                        if (!onMainDashboard) {
                          router.push("/dashboard");
                        }
                      }}
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-semibold">{s.host}</span>
                      {selected ? (
                        <span className="shrink-0 text-white/90" aria-hidden>
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path
                              d="M4 10.5 8.2 14.5 16 6.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
              {!filtered.length ? (
                <li className="px-3 py-2 text-sm text-slate-500">No sites match. Add sites under My Personal Sites.</li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}

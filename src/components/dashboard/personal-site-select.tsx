"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";

import { usePersonalSites } from "@/hooks/use-personal-sites";
import type { SelectedSitePayload } from "@/lib/selected-site";
import {
  persistSelectedSiteForDashboard,
  readSelectedSiteFromSession,
  SELECTED_SITE_CHANGED_EVENT,
} from "@/lib/selected-site";

export function PersonalSiteSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const { sites } = usePersonalSites();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  /** null until after mount — avoids hydration mismatch (sessionStorage missing on server). */
  const [sessionSite, setSessionSite] = useState<SelectedSitePayload | null>(null);

  const syncSession = useCallback(() => {
    setSessionSite(readSelectedSiteFromSession());
  }, []);

  useEffect(() => {
    syncSession();
    window.addEventListener(SELECTED_SITE_CHANGED_EVENT, syncSession);
    return () => window.removeEventListener(SELECTED_SITE_CHANGED_EVENT, syncSession);
  }, [syncSession]);

  useEffect(() => {
    syncSession();
  }, [sites, syncSession]);

  const current = useMemo(() => {
    if (!sessionSite) return null;
    return sites.find((s) => s.id === sessionSite.id) ?? null;
  }, [sessionSite, sites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((s) => s.host.toLowerCase().includes(q));
  }, [query, sites]);

  const label = useMemo(() => {
    if (current) return current.host;
    if (sites.length === 0) return "No sites";
    return "Select site";
  }, [current, sites.length]);

  const ariaLabel = useMemo(() => `Site: ${label}`, [label]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
                const selected = current?.id === s.id;
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
                        persistSelectedSiteForDashboard({ id: s.id, host: s.host });
                        setOpen(false);
                        setQuery("");
                        syncSession();

                        if (pathname !== "/dashboard") {
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
                <li className="px-3 py-2 text-sm text-slate-500">
                  {sites.length === 0
                    ? "No sites yet. Add sites under My Personal Sites."
                    : "No sites match your search."}
                </li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}

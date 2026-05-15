"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";

import { DashboardHeader } from "@/components/dashboard/header";
import type { PersonalSite } from "@/lib/types";
import { buildSparkFromDelta } from "@/lib/personal-site-spark";
import { buildPersonalSiteInstallSnippet } from "@/lib/site-snippet";
import { usePersonalSites } from "@/hooks/use-personal-sites";
import { persistSelectedSiteForDashboard } from "@/lib/selected-site";
import { deletePersonalSiteApi, setPinnedSitesApi } from "@/lib/personal-sites-fetch";
function MiniSpark({ values, flat }: { values: number[]; flat?: boolean }) {
  const gid = useId().replace(/:/g, "");
  const w = 220;
  const h = 40;
  const padY = 2;
  const baseline = h - padY;

  const safe = values.length > 0 ? values : [0];
  const rawMin = Math.min(...safe);
  const rawMax = Math.max(...safe);
  const isConstant = rawMax - rawMin < 1e-9;

  let coords: { x: number; y: number }[];

  if (flat) {
    const y = baseline;
    coords = [
      { x: 0, y },
      { x: w, y },
    ];
  } else if (isConstant) {
    const yMid = padY + (h - padY * 2) / 2;
    coords = [
      { x: 0, y: yMid },
      { x: w, y: yMid },
    ];
  } else {
    const min = rawMin;
    const max = rawMax;
    const denom = Math.max(max - min, 1e-9);
    coords = safe.map((v, i) => {
      const x = (i / Math.max(safe.length - 1, 1)) * w;
      const t = (v - min) / denom;
      const y = padY + (1 - t) * (h - padY * 2);
      return { x, y };
    });
  }

  const linePts = coords.map((c) => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ");
  const areaPath = [
    `M 0 ${baseline}`,
    ...coords.map((c) => `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`),
    `L ${w} ${baseline}`,
    "Z",
  ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-9 w-full text-primary"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`sparkFill-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003087" stopOpacity="0.16" />
          <stop offset="70%" stopColor="#003087" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#003087" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkFill-${gid})`} />
      <polyline
        fill="none"
        stroke="#003087"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePts}
      />
    </svg>
  );
}

function SiteCard({
  site,
  pinned,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onPinToggle,
  onCopyScript,
  copyFlash,
  onRequestDelete,
  onOpenDashboard,
}: {
  site: PersonalSite;
  pinned: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onPinToggle: () => void;
  onCopyScript: () => void;
  copyFlash: boolean;
  onRequestDelete: () => void;
  onOpenDashboard?: (site: PersonalSite) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      onCloseMenu();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen, onCloseMenu]);

  const delta = site.deltaPct;
  const deltaPositive = delta > 0;
  const deltaNeutral = delta === 0;
  const sparkValues = buildSparkFromDelta(site.deltaPct, site.visitors24h);

  return (
    <article
      onClick={() => onOpenDashboard?.(site)}
      aria-label={onOpenDashboard ? `Open analytics dashboard for ${site.host}` : undefined}
      className={`relative flex flex-col rounded-xl border border-slate-200/80 bg-white/85 p-4 shadow-premium ring-1 ring-slate-900/[0.03] backdrop-blur-sm transition-all duration-nexa-slow ease-nexa-out hover:-translate-y-px hover:border-slate-200 hover:shadow-nexaFloat ${
        onOpenDashboard ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <span className="text-sm font-bold leading-none text-primary">
            {site.host.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="min-w-0 truncate font-mono text-sm font-semibold text-slate-900">
              {site.host}
            </p>
            {pinned ? (
              <span
                className="inline-flex shrink-0 text-primary"
                title="Pinned"
                role="status"
                aria-label="Pinned site"
              >
                <FontAwesomeIcon icon={faThumbtack} className="block h-4 w-4 -rotate-[28deg]" />
              </span>
            ) : null}
          </div>
        </div>
        <div
          className="relative shrink-0"
          data-site-card-actions
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={btnRef}
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`Site actions for ${site.host}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-900/[0.05] hover:text-slate-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="6" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="18" r="1.6" />
            </svg>
          </button>
          {menuOpen ? (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 min-w-[12.5rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-glass"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onPinToggle();
                  onCloseMenu();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                <span className="text-slate-600" aria-hidden>
                  <FontAwesomeIcon icon={faThumbtack} className="block h-[18px] w-[18px] -rotate-[24deg]" />
                </span>
                {pinned ? "Unpin site" : "Pin site"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onCopyScript();
                  onCloseMenu();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              >
                <span className="text-slate-600" aria-hidden>
                  <FontAwesomeIcon icon={faCopy} className="block h-[18px] w-[18px]" />
                </span>
                Copy install script
              </button>
              <div className="my-0.5 h-px bg-slate-100" aria-hidden />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onRequestDelete();
                  onCloseMenu();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50"
              >
                <span className="text-rose-600" aria-hidden>
                  <FontAwesomeIcon icon={faTrashCan} className="block h-[18px] w-[18px]" />
                </span>
                Delete site
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative -mx-4 mt-3 w-[calc(100%+2rem)]">
        <MiniSpark values={sparkValues} flat={site.visitors24h === 0} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2 text-xs">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">{site.visitors24h.toLocaleString()}</span>{" "}
          visitors in last 24h
        </p>
        <span
          className={
            deltaNeutral
              ? "font-semibold tabular-nums text-slate-500"
              : deltaPositive
                ? "font-semibold tabular-nums text-emerald-700"
                : "font-semibold tabular-nums text-rose-600"
          }
        >
          {deltaNeutral ? "~ 0%" : deltaPositive ? `↗ ${delta}%` : `↘ ${Math.abs(delta)}%`}
        </span>
      </div>

      {copyFlash ? (
        <p className="mt-2 text-center text-[11px] font-medium text-emerald-700">Copied to clipboard</p>
      ) : null}
    </article>
  );
}

export function PersonalSitesClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const {
    sites: activeSites,
    pinnedIds: pinned,
    loading: listLoading,
    error: listError,
    refresh: refreshList,
    setFromMutation,
  } = usePersonalSites();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copyFlashId, setCopyFlashId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PersonalSite | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const displayError = actionError ?? listError;

  const togglePinned = useCallback(
    async (id: string) => {
      if (actionBusy) return;
      const next = pinned.includes(id) ? pinned.filter((x) => x !== id) : [...pinned, id];
      setActionBusy(true);
      try {
        const data = await setPinnedSitesApi(next);
        setFromMutation(data);
        setActionError(null);
      } catch (e) {
        setActionError(e instanceof Error ? e.message : "Could not update pin");
      } finally {
        setActionBusy(false);
      }
    },
    [pinned, actionBusy, setFromMutation]
  );

  const copyScript = useCallback(async (site: PersonalSite) => {
    const text = buildPersonalSiteInstallSnippet(site.host);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFlashId(site.id);
      setTimeout(() => setCopyFlashId((cur) => (cur === site.id ? null : cur)), 2000);
    } catch {
      setCopyFlashId(null);
    }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? activeSites.filter((s) => s.host.toLowerCase().includes(q)) : [...activeSites];
    return list;
  }, [query, activeSites]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || actionBusy) return;
    const id = deleteTarget.id;
    setActionBusy(true);
    try {
      const data = await deletePersonalSiteApi(id);
      setFromMutation(data);
      setActionError(null);
      setCopyFlashId((cur) => (cur === id ? null : cur));
      setOpenMenuId(null);
      setDeleteTarget(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not delete site");
    } finally {
      setActionBusy(false);
    }
  }, [deleteTarget, actionBusy, setFromMutation]);

  const openAnalyticsForSite = useCallback(
    (site: PersonalSite) => {
      persistSelectedSiteForDashboard({ id: site.id, host: site.host });
      setOpenMenuId(null);
      router.push("/dashboard");
    },
    [router]
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-[1000] bg-[var(--canvas-0)]">
        <DashboardHeader />
      </div>

      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-6 px-4 py-6 sm:px-5 lg:px-8 lg:py-8">
        <div>
          <Link
            href="/dashboard"
            prefetch
            className="text-sm font-medium text-primary underline-offset-2 transition hover:underline"
          >
            ← Back to analytics dashboard
          </Link>
          <div className="mt-4 border-b border-slate-200 pb-6">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Sites
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  My Personal Sites
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                  Manage tracked domains, pin favorites, and copy the install snippet for each site.
                </p>
              </div>
              <Link
                href="/dashboard/sites/add"
                prefetch
                className="inline-flex w-full shrink-0 items-center justify-center rounded-md bg-primary p-2 text-sm font-semibold text-white shadow-sm transition-all duration-nexa ease-nexa-out hover:bg-primary-muted active:scale-[0.98] sm:w-auto sm:self-start"
              >
                + Add website
              </Link>
            </div>
          </div>
        </div>

        {displayError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {displayError}
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                void refreshList(false);
              }}
              className="ml-3 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : null}

        {listLoading ? (
          <p className="py-6 text-center text-sm text-slate-500">Loading sites…</p>
        ) : null}
        <div className="relative max-w-xl">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
              <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sites…"
            disabled={listLoading}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary/35 focus:ring-2 disabled:opacity-60"
            aria-label="Search sites"
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
          {!listLoading
            ? filtered.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  pinned={pinned.includes(site.id)}
                  menuOpen={openMenuId === site.id}
                  onToggleMenu={() =>
                    setOpenMenuId((id) => (id === site.id ? null : site.id))
                  }
                  onCloseMenu={() => setOpenMenuId(null)}
                  onPinToggle={() => void togglePinned(site.id)}
                  onCopyScript={() => void copyScript(site)}
                  copyFlash={copyFlashId === site.id}
                  onRequestDelete={() => setDeleteTarget(site)}
                  onOpenDashboard={openAnalyticsForSite}
                />
              ))
            : null}
        </div>

        {!listLoading && filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {activeSites.length === 0 && !query.trim()
              ? "No sites in your list. Use + Add website above to track a domain."
              : "No sites match your search."}
          </p>
        ) : null}
      </main>

      {deleteTarget ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[1100] cursor-default bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-nexa"
            aria-label="Close delete confirmation"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="fixed inset-0 z-[1110] flex items-center justify-center px-4">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-site-title"
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-900/[0.08] bg-white/95 p-6 shadow-glass backdrop-blur-xl"
            >
              <h2 id="delete-site-title" className="text-lg font-semibold tracking-tight text-slate-900">
                Delete this site?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-mono font-semibold text-slate-900">{deleteTarget.host}</span>?
                It will disappear from your personal sites list. You can add it again
                anytime.
              </p>
              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete site
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <footer className="nexa-footer-slab mt-auto px-4 py-3 text-xs leading-tight text-slate-500 sm:px-5 lg:px-8">
        <p className="text-center">
          ©{new Date().getFullYear()} Ciright. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

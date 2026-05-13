"use client";

import { clsx } from "clsx";
import { useState } from "react";
import type { PlatformFilter, SegmentFilter } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { DateRangeControl } from "./date-range-control";
import { downloadCsv } from "@/lib/export";
import { getSegments } from "@/lib/analytics";

export function GlobalControls() {
  const { filters, setPlatform, setSegment } = useDashboardFilters();
  const [copied, setCopied] = useState(false);

  const platforms: { id: PlatformFilter; label: string }[] = [
    { id: "all", label: "All platforms" },
    { id: "web", label: "Web" },
    { id: "ios", label: "iOS" },
    { id: "android", label: "Android" },
  ];

  const segments: { id: SegmentFilter; label: string }[] = [
    { id: "all", label: "All segments" },
    { id: "enterprise", label: "Enterprise" },
    { id: "pro", label: "Pro" },
    { id: "free", label: "Free" },
  ];

  async function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportSegmentsCsv() {
    const rows = getSegments(filters).map((r) => ({
      segment: r.label,
      share: r.share,
      sessions: r.sessions,
    }));
    downloadCsv("nexapeople-segments.csv", rows);
  }

  return (
    <div className="glass-panel space-y-4 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Date range
          </p>
          <DateRangeControl />
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-xl">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Platform
            </p>
            <select
              value={filters.platform}
              onChange={(e) => setPlatform(e.target.value as PlatformFilter)}
              className="w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id} className="bg-white">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Customer segment
            </p>
            <select
              value={filters.segment}
              onChange={(e) => setSegment(e.target.value as SegmentFilter)}
              className="w-full rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {segments.map((s) => (
                <option key={s.id} value={s.id} className="bg-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-900/10 pt-4">
        <button
          type="button"
          onClick={copyLink}
          className={clsx(
            "rounded-lg border px-3 py-2 text-xs font-semibold transition hover-lift",
            copied
              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-700"
              : "border-slate-900/10 bg-white/80 text-slate-800 shadow-sm hover:border-primary/25"
          )}
        >
          {copied ? "Link copied" : "Copy deep link"}
        </button>
        <button
          type="button"
          onClick={exportSegmentsCsv}
          className="rounded-lg border border-slate-900/10 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover-lift hover:border-primary/25"
        >
          Export segments (CSV)
        </button>
      </div>
    </div>
  );
}

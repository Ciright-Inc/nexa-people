"use client";

import { clsx } from "clsx";
import { useState } from "react";
import type { PlatformKey, SegmentFilter } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { DateRangeControl } from "./date-range-control";
import { downloadCsv } from "@/lib/export";
import { getSegments } from "@/lib/analytics";

const ALL: PlatformKey[] = ["web", "ios", "android"];

function isAllPlatforms(p: PlatformKey[]) {
  return new Set(p).size === ALL.length;
}

function formatPlatformChip(p: PlatformKey[]) {
  if (isAllPlatforms(p)) return "";
  return [...new Set(p)]
    .sort((a, b) => ALL.indexOf(a) - ALL.indexOf(b))
    .map((x) => (x === "ios" ? "iOS" : x.charAt(0).toUpperCase() + x.slice(1)))
    .join(" · ");
}

export function GlobalControls() {
  const {
    filters,
    setPlatforms,
    setSegment,
    setGeography,
    resetAnalyticsFilters,
  } = useDashboardFilters();
  const [minUsers, setMinUsers] = useState(250);
  const [copied, setCopied] = useState(false);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.geographyLabel && filters.geographyId) {
    chips.push({
      key: "geo",
      label: filters.geographyLabel,
      onRemove: () => setGeography(null, null),
    });
  }
  if (!isAllPlatforms(filters.platforms)) {
    chips.push({
      key: "platform",
      label: formatPlatformChip(filters.platforms),
      onRemove: () => setPlatforms([...ALL]),
    });
  }
  if (filters.segment !== "all") {
    chips.push({
      key: "segment",
      label: filters.segment,
      onRemove: () => setSegment("all"),
    });
  }

  const analyticsDirty =
    chips.length > 0 ||
    filters.datePreset !== "30d" ||
    (filters.datePreset === "custom" &&
      Boolean(filters.customFrom || filters.customTo)) ||
    !isAllPlatforms(filters.platforms) ||
    filters.segment !== "all";

  const hasActiveFilters = analyticsDirty || minUsers !== 250;

  function handlePlatformChange(id: PlatformKey, checked: boolean) {
    const cur = new Set(filters.platforms);
    if (checked) cur.add(id);
    else cur.delete(id);
    let next = [...cur] as PlatformKey[];
    if (next.length === 0) next = [...ALL];
    setPlatforms(next);
  }

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

  function clearAnalyticsFilters() {
    resetAnalyticsFilters();
    setMinUsers(250);
  }

  const segments: { id: SegmentFilter; label: string }[] = [
    { id: "all", label: "All segments" },
    { id: "enterprise", label: "Enterprise" },
    { id: "pro", label: "Pro" },
    { id: "free", label: "Free" },
  ];

  return (
    <div className="dash-card-lg space-y-6 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          {chips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {c.label}
                  <span className="text-slate-400">×</span>
                </button>
              ))}
            </div>
          ) : null}
          <DateRangeControl />
        </div>
        <button
          type="button"
          onClick={clearAnalyticsFilters}
          disabled={!hasActiveFilters}
          className={clsx(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
            hasActiveFilters
              ? "border-primary bg-primary text-white shadow-sm hover:bg-primary-muted"
              : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          )}
        >
          Clear analytics filters
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="min-users"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Minimum active users
          </label>
          <span className="font-mono text-xs font-semibold text-slate-700">
            {minUsers.toLocaleString()}
          </span>
        </div>
        <input
          id="min-users"
          type="range"
          min={0}
          max={5000}
          step={50}
          value={minUsers}
          onChange={(e) => setMinUsers(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
        />
        <p className="text-[11px] text-slate-500">
          Threshold preview — connect to warehouse rollups when the API is wired.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Platform
          </p>
          <div className="flex flex-wrap gap-4">
            {(
              [
                { id: "web" as const, label: "Web" },
                { id: "ios" as const, label: "iOS" },
                { id: "android" as const, label: "Android" },
              ] as const
            ).map(({ id, label }) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  checked={filters.platforms.includes(id)}
                  onChange={(e) => handlePlatformChange(id, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:w-56">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Segment
          </p>
          <select
            value={filters.segment}
            onChange={(e) => setSegment(e.target.value as SegmentFilter)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
          >
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={copyLink}
          className={clsx(
            "rounded-full border px-4 py-2 text-xs font-semibold transition",
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300"
          )}
        >
          {copied ? "Link copied" : "Copy view link"}
        </button>
        <button
          type="button"
          onClick={exportSegmentsCsv}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Export segments (CSV)
        </button>
      </div>
    </div>
  );
}

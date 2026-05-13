"use client";

import type { DashboardFiltersState, PlatformKey } from "@/lib/types";
import { DASHBOARD_DEFAULT_MIN_ACTIVE_USERS } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { DATE_RANGE_PRESETS } from "./date-range-control";

const ALL: PlatformKey[] = ["web", "ios", "android"];

function isAllPlatforms(p: PlatformKey[]) {
  return new Set(p).size === ALL.length;
}

function formatPlatforms(p: PlatformKey[]) {
  return [...new Set(p)]
    .sort((a, b) => ALL.indexOf(a) - ALL.indexOf(b))
    .map((x) => (x === "ios" ? "iOS" : x.charAt(0).toUpperCase() + x.slice(1)))
    .join(", ");
}

function segmentLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dateChipValue(filters: DashboardFiltersState) {
  const preset = DATE_RANGE_PRESETS.find((p) => p.id === filters.datePreset)?.label;
  const base = preset ?? filters.datePreset;
  if (
    filters.datePreset === "custom" &&
    filters.customFrom &&
    filters.customTo
  ) {
    try {
      const a = new Date(`${filters.customFrom}T12:00:00`).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
      const b = new Date(`${filters.customTo}T12:00:00`).toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
      return `Custom (${a} – ${b})`;
    } catch {
      return base;
    }
  }
  return base;
}

export function DashboardActiveFiltersBar() {
  const {
    filters,
    setDatePreset,
    setGeography,
    setPlatforms,
    setSegment,
    setMinActiveUsers,
    resetAnalyticsFilters,
  } = useDashboardFilters();

  const chips: { key: string; label: string; removeLabel: string; onRemove: () => void }[] =
    [];

  if (filters.datePreset !== "30d") {
    chips.push({
      key: "dates",
      label: `Dates: ${dateChipValue(filters)}`,
      removeLabel: "Remove date range filter",
      onRemove: () => setDatePreset("30d"),
    });
  }

  if (!isAllPlatforms(filters.platforms)) {
    chips.push({
      key: "platforms",
      label: `Platforms: ${formatPlatforms(filters.platforms)}`,
      removeLabel: "Remove platform filter",
      onRemove: () => setPlatforms([...ALL]),
    });
  }

  if (filters.segment !== "all") {
    chips.push({
      key: "segment",
      label: `Segment: ${segmentLabel(filters.segment)}`,
      removeLabel: "Remove segment filter",
      onRemove: () => setSegment("all"),
    });
  }

  if (filters.geographyLabel && filters.geographyId) {
    chips.push({
      key: "geo",
      label: `Geography: ${filters.geographyLabel}`,
      removeLabel: "Remove geography filter",
      onRemove: () => setGeography(null, null),
    });
  }

  if (filters.minActiveUsers !== DASHBOARD_DEFAULT_MIN_ACTIVE_USERS) {
    chips.push({
      key: "minUsers",
      label: `Min active users ≥ ${filters.minActiveUsers.toLocaleString()}`,
      removeLabel: "Remove minimum users filter",
      onRemove: () => setMinActiveUsers(DASHBOARD_DEFAULT_MIN_ACTIVE_USERS),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="border-b border-slate-200/80 bg-gradient-to-b from-slate-100/95 to-slate-100/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3 lg:px-10">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {chips.map((c) => (
            <div
              key={c.key}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200/90 bg-white pl-3 pr-1 py-1 text-[13px] font-medium text-slate-800 shadow-sm"
            >
              <span className="min-w-0 truncate">{c.label}</span>
              <button
                type="button"
                aria-label={c.removeLabel}
                onClick={c.onRemove}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  aria-hidden
                  className="block shrink-0"
                >
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    strokeWidth="2.35"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={resetAnalyticsFilters}
          className="shrink-0 self-start rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-primary sm:self-auto"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}

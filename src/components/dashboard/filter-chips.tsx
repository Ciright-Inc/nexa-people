"use client";

import type { PlatformFilter } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";

const ALL: PlatformFilter = ["web", "ios", "android"];

function isAllPlatforms(p: string[]) {
  return new Set(p).size === ALL.length;
}

export function FilterChips() {
  const { filters, setGeography, setPlatforms, setSegment, clearAll } =
    useDashboardFilters();

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
      label: `Platform: ${filters.platforms.join(", ")}`,
      onRemove: () => setPlatforms([...ALL]),
    });
  }
  if (filters.segment !== "all") {
    chips.push({
      key: "segment",
      label: `Segment: ${filters.segment}`,
      onRemove: () => setSegment("all"),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          {c.label}
          <span className="text-slate-400">×</span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

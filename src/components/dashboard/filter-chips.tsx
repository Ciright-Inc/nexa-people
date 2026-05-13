"use client";

import { clsx } from "clsx";
import { useDashboardFilters } from "@/context/dashboard-filters";

export function FilterChips() {
  const { filters, setGeography, setPlatform, setSegment, clearAll } =
    useDashboardFilters();

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.geographyLabel && filters.geographyId) {
    chips.push({
      key: "geo",
      label: `Region: ${filters.geographyLabel}`,
      onRemove: () => setGeography(null, null),
    });
  }
  if (filters.platform !== "all") {
    chips.push({
      key: "platform",
      label: `Platform: ${filters.platform}`,
      onRemove: () => setPlatform("all"),
    });
  }
  if (filters.segment !== "all") {
    chips.push({
      key: "segment",
      label: `Segment: ${filters.segment}`,
      onRemove: () => setSegment("all"),
    });
  }

  const hasFilters = chips.length > 0 || filters.datePreset !== "30d";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-900/10 bg-white/70 px-4 py-2.5 backdrop-blur-md sm:px-6 lg:px-8">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        Active filters
      </span>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={c.onRemove}
            className="glass-chip hover-lift flex items-center gap-1.5 text-slate-800"
          >
            {c.label}
            <span className="text-slate-500">×</span>
          </button>
        ))}
        {!chips.length ? (
          <span className="text-xs text-slate-500">
            Defaults — last 30 days, global
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={clearAll}
        disabled={!hasFilters}
        className={clsx(
          "ml-auto text-xs font-medium underline-offset-4 hover:underline",
          hasFilters ? "text-primary" : "cursor-not-allowed text-slate-400"
        )}
      >
        Clear all
      </button>
    </div>
  );
}

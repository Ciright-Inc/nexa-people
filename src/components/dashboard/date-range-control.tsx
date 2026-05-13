"use client";

import { clsx } from "clsx";
import type { DateRangePreset } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "qtd", label: "QTD" },
  { id: "custom", label: "Custom" },
];

export function DateRangeControl() {
  const { filters, setDatePreset, setCustomRange } = useDashboardFilters();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setDatePreset(p.id)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium transition hover-lift",
              filters.datePreset === p.id
                ? "border-primary/30 bg-primary/10 text-slate-900 shadow-sm"
                : "border-slate-900/10 bg-white/80 text-slate-700 shadow-sm hover:border-primary/20"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {filters.datePreset === "custom" ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={filters.customFrom ?? ""}
            onChange={(e) =>
              setCustomRange(e.target.value || null, filters.customTo)
            }
            className="rounded-lg border border-slate-900/10 bg-white/80 px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={filters.customTo ?? ""}
            onChange={(e) =>
              setCustomRange(filters.customFrom, e.target.value || null)
            }
            className="rounded-lg border border-slate-900/10 bg-white/80 px-2 py-1 text-xs text-slate-900 shadow-sm focus:border-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      ) : null}
    </div>
  );
}

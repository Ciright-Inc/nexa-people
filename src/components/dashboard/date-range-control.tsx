"use client";

import { clsx } from "clsx";
import type { DateRangePreset } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "qtd", label: "Quarter to date" },
  { id: "custom", label: "Custom" },
];

export function DateRangeControl() {
  const { filters, setDatePreset, setCustomRange } = useDashboardFilters();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setDatePreset(p.id)}
            className={clsx(
              "rounded-full border px-4 py-2 text-xs font-semibold transition",
              filters.datePreset === p.id
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={filters.customTo ?? ""}
            onChange={(e) =>
              setCustomRange(filters.customFrom, e.target.value || null)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      ) : null}
    </div>
  );
}

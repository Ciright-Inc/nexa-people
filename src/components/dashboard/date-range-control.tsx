"use client";

import { clsx } from "clsx";
import type { DateRangePreset } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";

export const DATE_RANGE_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "qtd", label: "Quarter to date" },
  { id: "custom", label: "Custom" },
];

type DateRangeControlProps = {
  /** `stacked`: presets then custom dates in a column (filters panel). */
  layout?: "inline" | "stacked";
};

export function DateRangeControl({ layout = "inline" }: DateRangeControlProps) {
  const { filters, setDatePreset, setCustomRange } = useDashboardFilters();
  const stacked = layout === "stacked";

  return (
    <div
      className={clsx(
        "flex flex-col gap-4",
        !stacked && "sm:flex-row sm:items-start sm:gap-4"
      )}
    >
      <div className={clsx("flex min-w-0 flex-col gap-3", !stacked && "sm:flex-1")}>
        <div className="flex flex-wrap gap-2">
          {DATE_RANGE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setDatePreset(p.id)}
              className={clsx(
                "rounded-full border px-4 py-2 text-xs font-semibold transition",
                filters.datePreset === p.id
                  ? "border-primary bg-primary text-white shadow-sm hover:bg-primary-muted"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="max-w-2xl text-xs leading-relaxed text-slate-500">
          Preset windows scale KPIs proportionally until live warehouse wiring is in place.
        </p>
      </div>
      {filters.datePreset === "custom" ? (
        <div
          className={clsx(
            "flex flex-wrap gap-3",
            stacked && "grid w-full gap-4 sm:grid-cols-2"
          )}
        >
          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor="dash-date-from"
              className="block text-xs font-semibold text-slate-600"
            >
              From
            </label>
            <input
              id="dash-date-from"
              type="date"
              value={filters.customFrom ?? ""}
              onChange={(e) =>
                setCustomRange(e.target.value || null, filters.customTo)
              }
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label
              htmlFor="dash-date-to"
              className="block text-xs font-semibold text-slate-600"
            >
              To
            </label>
            <input
              id="dash-date-to"
              type="date"
              value={filters.customTo ?? ""}
              onChange={(e) =>
                setCustomRange(filters.customFrom, e.target.value || null)
              }
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

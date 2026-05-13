"use client";

import dynamic from "next/dynamic";
import { MAP_POINTS } from "@/lib/mock-data";
import type { DashboardFiltersState } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";

function focusedWindowLabel(f: DashboardFiltersState): string {
  switch (f.datePreset) {
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "90d":
      return "Last 90 days";
    case "qtd":
      return "Quarter to date";
    case "custom":
      if (f.customFrom && f.customTo) {
        return `${f.customFrom} – ${f.customTo}`;
      }
      return "Custom range";
    default:
      return "Last 30 days";
  }
}

const WorldMapInteractive = dynamic(
  () =>
    import("./world-map-interactive").then((m) => m.WorldMapInteractive),
  {
    ssr: false,
    loading: () => (
      <div className="dash-card-lg flex aspect-[16/9] min-h-[300px] items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading map…
      </div>
    ),
  }
);

export function WorldMapScatter() {
  const { filters, setGeography } = useDashboardFilters();

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-8 rounded-2xl border border-slate-200/60 bg-gradient-to-b from-slate-50/95 to-white px-4 py-6 shadow-sm sm:px-6 sm:py-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1 space-y-3 lg:max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            User geography
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">
            Global connectivity network
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Scatter markers represent anonymized density by location. Larger points reflect
            higher populations in that bucket within the last 30 days window you selected
            below.
          </p>
          <p className="text-sm leading-snug text-slate-600">
            <span className="font-bold text-slate-800">Focused window:</span>{" "}
            <span className="font-normal">{focusedWindowLabel(filters)}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-6 text-right">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Active markets
            </span>
            <span className="text-lg font-bold leading-none tracking-tight text-primary sm:text-xl">
              {MAP_POINTS.length} regions
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Uptime coverage
            </span>
            <span className="text-lg font-bold leading-none tracking-tight text-primary sm:text-xl">
              99.98%
            </span>
          </div>
        </div>
      </div>

      <WorldMapInteractive filters={filters} setGeography={setGeography} />
    </section>
  );
}

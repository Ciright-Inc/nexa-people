"use client";

import dynamic from "next/dynamic";
import type { DashboardFiltersState } from "@/lib/types";
import { MAP_POINTS } from "@/lib/mock-data";
import { dashboardDateFilterLabel } from "@/lib/date-range-display";
import { useDashboardFilters } from "@/context/dashboard-filters";

function customRangeIncomplete(f: DashboardFiltersState) {
  return f.datePreset === "custom" && (!f.customFrom?.trim() || !f.customTo?.trim());
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
      <div className="flex flex-col gap-8 pb-2 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-16">
        <div className="min-w-0 flex-1 space-y-3 lg:max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            User geography
          </p>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Global connectivity network
          </h2>
          {customRangeIncomplete(filters) ? (
            <p className="text-sm leading-relaxed text-slate-600">
              Scatter markers represent anonymized density by location. Larger points reflect
              higher populations in that bucket. Choose a start and end date in{" "}
              <span className="font-medium text-slate-800">Filters & controls</span> to apply a
              custom window to this map.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-slate-600">
              Scatter markers represent anonymized density by location. Larger points reflect higher
              populations in that bucket within the{" "}
              <span className="font-medium text-slate-800">
                {dashboardDateFilterLabel(filters)}
              </span>{" "}
              window you selected below.
            </p>
          )}
          <p className="text-sm leading-snug text-slate-600">
            <span className="font-bold text-slate-900">Focused window:</span>{" "}
            <span className="font-normal">{dashboardDateFilterLabel(filters)}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-6 text-right">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Active markets
            </span>
            <span className="text-lg font-bold leading-none tracking-[-0.02em] text-slate-900 sm:text-xl">
              {MAP_POINTS.length} regions
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Uptime coverage
            </span>
            <span className="text-lg font-bold leading-none tracking-[-0.02em] text-slate-900 sm:text-xl">
              99.98%
            </span>
          </div>
        </div>
      </div>

      <WorldMapInteractive filters={filters} setGeography={setGeography} />
    </section>
  );
}

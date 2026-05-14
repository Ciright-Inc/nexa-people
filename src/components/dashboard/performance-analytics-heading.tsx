"use client";

import { useMemo } from "react";
import { useDashboardFilters } from "@/context/dashboard-filters";
import { PRODUCTS } from "@/lib/mock-data";
import { dashboardDateFilterLabel } from "@/lib/date-range-display";

function lastIngestUtcLine(d: Date): string {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
  return `${weekday}, ${month} ${day} • ${time} UTC`;
}

export function PerformanceAnalyticsHeading() {
  const { filters } = useDashboardFilters();

  const productName = useMemo(
    () => PRODUCTS.find((p) => p.id === filters.productId)?.name ?? PRODUCTS[0]?.name ?? "Product",
    [filters.productId]
  );

  const windowLabel = useMemo(() => dashboardDateFilterLabel(filters), [filters]);
  const ingestLine = useMemo(() => lastIngestUtcLine(new Date()), []);

  return (
    <div className="border-b border-slate-200 pb-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        Performance analytics
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
        People analytics reacts to{" "}
        <strong className="font-semibold text-slate-950">Product: {productName}</strong>, the date
        window below, numeric thresholds for activity, platforms, and any geography you select on
        the map.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Data window: <strong className="font-semibold text-slate-950">{windowLabel}</strong>
        {" \u2022 "}
        Last ingest: <strong className="font-semibold text-slate-950">{ingestLine}</strong>
      </p>
    </div>
  );
}

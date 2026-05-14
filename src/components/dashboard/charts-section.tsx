"use client";

import { useMemo, useRef } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { clsx } from "clsx";
import { useDashboardFilters } from "@/context/dashboard-filters";
import {
  getDemandNormalizedSeries,
  getRegionalNetworkRows,
  type RegionalNetworkRow,
} from "@/lib/analytics";
import { downloadCsv, downloadElementPng } from "@/lib/export";

function StatusPill({ status }: { status: RegionalNetworkRow["status"] }) {
  const base =
    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]";
  if (status === "optimal") {
    return <span className={clsx(base, "bg-primary text-white shadow-sm")}>Optimal</span>;
  }
  if (status === "high load") {
    return (
      <span
        className={clsx(
          base,
          "border border-slate-300/90 bg-white text-slate-800 shadow-sm"
        )}
      >
        High load
      </span>
    );
  }
  return (
    <span
      className={clsx(
        base,
        "border border-slate-200/90 bg-slate-50 text-slate-500"
      )}
    >
      Maintenance
    </span>
  );
}

export function ChartsSection() {
  const { filters } = useDashboardFilters();
  const demand = useMemo(() => getDemandNormalizedSeries(filters), [filters]);
  const regional = useMemo(() => getRegionalNetworkRows(filters), [filters]);
  const chartCardRef = useRef<HTMLDivElement>(null);

  function exportDemandCsv() {
    downloadCsv(
      "nexapeople-demand-cycle.csv",
      demand.map((r) => ({ hour: r.t, normalized: r.v }))
    );
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <div ref={chartCardRef} className="dash-card-lg p-3.5 sm:p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                  Demand cycle (normalized)
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">
                  A grayscale load curve for visualization only; aligns to the filtered product and
                  window.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={exportDemandCsv}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-primary/25 hover:bg-slate-50 hover:text-slate-900"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadElementPng(
                      chartCardRef.current,
                      "nexapeople-demand-cycle.png"
                    )
                  }
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-primary/25 hover:bg-slate-50 hover:text-slate-900"
                >
                  PNG
                </button>
              </div>
            </div>
            <div className="h-[300px] w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demand}>
                  <defs>
                    <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(15,23,42,0.1)" }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    tick={{ fill: "rgba(15,23,42,0.45)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.98)",
                      border: "1px solid rgba(15,23,42,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "0 12px 40px rgba(15,23,42,0.08)",
                    }}
                    labelStyle={{ color: "rgba(15,23,42,0.55)" }}
                    formatter={(value: number) => [
                      `${(value * 100).toFixed(1)}%`,
                      "Load",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#64748b"
                    strokeWidth={2}
                    fill="url(#demandFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="dash-card-lg flex flex-col overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">Regional status</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Synthetic health checks per market bucket.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-4 py-3 font-semibold">Market</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Ping</th>
                  </tr>
                </thead>
                <tbody>
                  {regional.map((row) => (
                    <tr
                      key={row.market}
                      className="border-t border-slate-100 transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{row.market}</td>
                      <td className="px-3 py-3">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <span className="font-mono font-semibold tabular-nums text-slate-900">
                          {row.ping}
                        </span>
                        <span className="text-xs font-medium text-slate-400"> ms</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 p-3.5 sm:px-4 sm:py-3.5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_14px_rgba(0,48,135,0.28)] transition hover:bg-primary-muted hover:shadow-[0_2px_4px_rgba(15,23,42,0.08),0_6px_20px_rgba(0,48,135,0.32)]"
              >
                View full network report
                <span aria-hidden className="text-base leading-none">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

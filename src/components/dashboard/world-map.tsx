"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleSqrt } from "d3-scale";
import { MAP_POINTS } from "@/lib/mock-data";
import type { EngagementBand } from "@/lib/types";
import { useDashboardFilters } from "@/context/dashboard-filters";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function engagementColor(b: EngagementBand, selected: boolean) {
  if (selected) return "#60a5fa";
  if (b === "high") return "#34d399";
  if (b === "med") return "#38bdf8";
  return "#94a3b8";
}

export function WorldMapScatter() {
  const { filters, setGeography } = useDashboardFilters();
  const [zoom, setZoom] = useState(1);

  const size = useMemo(
    () =>
      scaleSqrt()
        .domain([0, Math.max(...MAP_POINTS.map((p) => p.activeUsers))])
        .range([4, 22]),
    []
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Global presence</h2>
          <p className="max-w-prose text-xs text-slate-600">
            Aggregated location buckets (privacy-safe). Marker size reflects active
            users; color reflects engagement band. Click a point to filter analytics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="glass-chip">
            Active markets:{" "}
            <span className="font-semibold text-slate-900">{MAP_POINTS.length}</span>
          </span>
          <span className="glass-chip border-emerald-500/25 text-emerald-700">
            Uptime: 99.98%
          </span>
        </div>
      </div>

      <div className="glass-panel relative overflow-hidden p-2 sm:p-3">
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[220px] rounded-xl border border-slate-900/10 bg-white/70 p-3 text-xs text-slate-700 shadow-glass backdrop-blur-md">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Node snapshot
          </p>
          <p className="mt-2 font-mono text-lg text-slate-900">128 hubs</p>
          <p className="text-slate-600">Peak traffic · 42.8 Tbps</p>
        </div>

        <div className="pointer-events-none absolute right-4 top-4 z-10 hidden max-w-[260px] rounded-xl border border-slate-900/10 bg-white/70 p-3 text-xs text-slate-700 shadow-glass backdrop-blur-md md:block">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Recent signals
          </p>
          <ul className="mt-2 space-y-2">
            <li className="flex gap-2">
              <span>⚡</span>
              <span>Shard rebalance completed · EU-West</span>
            </li>
            <li className="flex gap-2">
              <span>📡</span>
              <span>Ingest lag nominal · US-East</span>
            </li>
          </ul>
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gradient-to-b from-[#f8fafc] to-[#eef2ff]">
          <ComposableMap
            projectionConfig={{ scale: 168 }}
            className="h-full w-full [&_svg]:block"
          >
            <ZoomableGroup zoom={zoom} center={[0, 18]}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e2e8f0"
                      stroke="rgba(15,23,42,0.12)"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#d8e2f3", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              {MAP_POINTS.map((pt) => {
                const selected = filters.geographyId === pt.id;
                const r = size(pt.activeUsers);
                return (
                  <Marker key={pt.id} coordinates={[pt.lng, pt.lat]}>
                    <g
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer outline-none"
                      onClick={() =>
                        selected
                          ? setGeography(null, null)
                          : setGeography(pt.id, pt.name)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selected
                            ? setGeography(null, null)
                            : setGeography(pt.id, pt.name);
                        }
                      }}
                    >
                      <circle
                        r={r}
                        fill={engagementColor(pt.engagement, selected)}
                        opacity={0.88}
                        stroke="rgba(15,23,42,0.20)"
                        strokeWidth={selected ? 2 : 1}
                        className="transition hover:opacity-100"
                      />
                      <title>
                        {`${pt.name} · ${pt.activeUsers} active · ${pt.engagement} engagement · top ${pt.topPlatform}`}
                      </title>
                    </g>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Med engagement
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> High engagement
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> Low engagement
            </span>
            <span className="text-slate-500">
              · Size ∝ active users (clustered &gt;50)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-primary/25"
              onClick={() => {
                setZoom((z) => Math.min(8, z * 1.2));
              }}
            >
              Zoom in
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-primary/25"
              onClick={() => {
                setZoom((z) => Math.max(0.8, z / 1.2));
              }}
            >
              Zoom out
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-primary/25"
              onClick={() => setZoom(1)}
            >
              Reset view
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

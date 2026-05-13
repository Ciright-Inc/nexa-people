"use client";

/**
 * Leaflet is driven imperatively (L.map + map.remove) instead of react-leaflet’s MapContainer.
 * Root cause of “Map container is already initialized”: React 18 Strict Mode / concurrent
 * rendering can commit MapContainer twice before Leaflet finishes tearing down the prior
 * map on the same DOM node. Imperative lifecycle guarantees one map instance per mount.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { scaleSqrt } from "d3-scale";
import "leaflet/dist/leaflet.css";

import { MAP_POINTS, PRODUCTS } from "@/lib/mock-data";
import type { DashboardFiltersState, EngagementBand } from "@/lib/types";

const PRIMARY = "#003087";
const PRIMARY_MUTED = "#1e4a9e";
const PRIMARY_LIGHT = "#94b4e8";

/** Esri World Light Gray (base + reference): English-centric labels on raster tiles. Carto/OSM raster tiles bake in multilingual names with no client-side override. */
const ESRI_LIGHT_GRAY_BASE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ESRI_LIGHT_GRAY_REFERENCE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}";

function engagementFill(b: EngagementBand, selected: boolean) {
  if (selected) return PRIMARY;
  if (b === "high") return PRIMARY_MUTED;
  if (b === "med") return "#5b7ab8";
  return PRIMARY_LIGHT;
}

const GROWTH_TARGET_IDS = new Set<string>(["syd", "sgp"]);

type Props = {
  filters: DashboardFiltersState;
  setGeography: (id: string | null, label: string | null) => void;
};

export function WorldMapInteractive({ filters, setGeography }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const filtersRef = useRef(filters);
  const setGeographyRef = useRef(setGeography);

  filtersRef.current = filters;
  setGeographyRef.current = setGeography;

  const size = useMemo(
    () =>
      scaleSqrt()
        .domain([0, Math.max(...MAP_POINTS.map((p) => p.activeUsers), 1)])
        .range([10, 34]),
    []
  );


  const footprint = MAP_POINTS.length;

  const productName = useMemo(
    () =>
      PRODUCTS.find((p) => p.id === filters.productId)?.name ??
      PRODUCTS[0]?.name ??
      "Delta Cloud",
    [filters.productId]
  );

  const signalLines = useMemo(
    () => [
      "New York: steady throughput (70.0%).",
      "Mumbai: steady throughput (78.0%).",
      `${productName}: routing healthy (all regions).`,
    ],
    [productName]
  );

  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const resetView = useCallback(() => {
    mapRef.current?.setView([16, 0], 2, { animate: true });
  }, []);

  const syncMarkerSelection = useCallback((geoId: string | null) => {
    for (const pt of MAP_POINTS) {
      const m = markersRef.current[pt.id];
      if (!m) continue;
      const selected = geoId === pt.id;
      const growth = GROWTH_TARGET_IDS.has(pt.id);
      const fill = engagementFill(pt.engagement, selected);
      m.setStyle({
        fillColor: fill,
        fillOpacity: growth ? 0.14 : selected ? 0.55 : 0.42,
        color: PRIMARY,
        weight: growth ? 2 : selected ? 3 : 1.5,
        opacity: growth ? 0.95 : 0.9,
        dashArray: growth ? "5 4" : undefined,
      });
    }
  }, []);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [16, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      maxBounds: [
        [-85, -200],
        [85, 200],
      ],
      maxBoundsViscosity: 0.8,
      scrollWheelZoom: true,
      worldCopyJump: true,
      attributionControl: false,
      zoomControl: false,
      fadeAnimation: false,
    });

    mapRef.current = map;

    const tileOpts: L.TileLayerOptions = {
      maxZoom: 20,
      maxNativeZoom: 19,
      keepBuffer: 4,
      updateWhenIdle: false,
      updateInterval: 75,
      attribution: "",
      crossOrigin: true,
      className: "world-map-tiles",
    };
    L.tileLayer(ESRI_LIGHT_GRAY_BASE, tileOpts).addTo(map);
    L.tileLayer(ESRI_LIGHT_GRAY_REFERENCE, tileOpts).addTo(map);

    const markers: Record<string, L.CircleMarker> = {};
    const geoId = filtersRef.current.geographyId;

    for (const pt of MAP_POINTS) {
      const selected = geoId === pt.id;
      const r = size(pt.activeUsers);
      const growth = GROWTH_TARGET_IDS.has(pt.id);
      const fill = engagementFill(pt.engagement, selected);

      const cm = L.circleMarker([pt.lat, pt.lng], {
        radius: r,
        fillColor: fill,
        fillOpacity: growth ? 0.14 : selected ? 0.55 : 0.42,
        color: PRIMARY,
        weight: growth ? 2 : selected ? 3 : 1.5,
        opacity: growth ? 0.95 : 0.9,
        dashArray: growth ? "5 4" : undefined,
      });

      cm.bindTooltip(
        `${pt.name} · ${pt.activeUsers.toLocaleString()} active · ${pt.engagement} · ${growth ? "growth target" : "node"}`,
        {
          direction: "top",
          offset: [0, -8],
          opacity: 0.92,
          className:
            "!rounded-lg !border !border-slate-200 !bg-white !px-2 !py-1 !text-[11px] !text-slate-800 !shadow-md",
        }
      );

      cm.on("click", () => {
        const f = filtersRef.current;
        const isSel = f.geographyId === pt.id;
        if (isSel) setGeographyRef.current(null, null);
        else setGeographyRef.current(pt.id, pt.name);
      });

      cm.addTo(map);
      markers[pt.id] = cm;
    }

    markersRef.current = markers;

    const bump = () => {
      map.invalidateSize({ animate: false });
    };

    let bumpRaf = 0;
    const scheduleBump = () => {
      if (bumpRaf) cancelAnimationFrame(bumpRaf);
      bumpRaf = requestAnimationFrame(() => {
        bumpRaf = 0;
        bump();
      });
    };

    map.whenReady(() => {
      bump();
      requestAnimationFrame(bump);
    });

    const timeouts = [0, 150, 400].map((ms) => window.setTimeout(bump, ms));

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onWinResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(bump, 120);
    };
    window.addEventListener("resize", onWinResize);

    const onVisibility = () => {
      if (document.visibilityState === "visible") bump();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const parent = el.parentElement;
    const roParent = parent ? new ResizeObserver(() => scheduleBump()) : null;
    if (parent && roParent) roParent.observe(parent);

    const roEl = new ResizeObserver(() => scheduleBump());
    roEl.observe(el);

    bump();

    return () => {
      if (bumpRaf) cancelAnimationFrame(bumpRaf);
      for (const id of timeouts) window.clearTimeout(id);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onWinResize);
      document.removeEventListener("visibilitychange", onVisibility);
      roParent?.disconnect();
      roEl.disconnect();
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
    // Map + markers: single mount; `size` is stable (derived from static MAP_POINTS).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-once
  }, []);

  useEffect(() => {
    syncMarkerSelection(filters.geographyId);
  }, [filters.geographyId, syncMarkerSelection]);

  return (
    <div className="dash-card-lg relative overflow-hidden">
      <div className="pointer-events-auto absolute left-3 top-3 z-[20] flex min-h-0 w-[min(100%-1.5rem,220px)] max-w-full flex-col gap-2.5 sm:left-4 sm:top-4">
        <div className="shrink-0 rounded-lg border border-slate-200/90 bg-white p-2.5 text-xs shadow-premium backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Node status
          </p>
          <div className="mt-2.5 space-y-2.5">
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-700">
                  Estimated footprint
                </span>
                <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-800">
                  {footprint}
                </span>
              </div>
              <p className="mt-1.5 text-left text-[10px] font-normal leading-snug text-slate-500">
                Scales with the {footprint} locations passing your filters — not literal data
                centers.
              </p>
            </div>
            <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2.5">
              <span className="text-[11px] font-bold text-slate-700">Peak traffic</span>
              <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-800">
                42.8 Tbps
              </span>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] leading-snug text-slate-700">
              <span className="font-normal">Integrity: </span>
              <span className="font-semibold text-slate-800">99.98%</span>
              <span className="font-normal"> baseline window.</span>
            </div>
          </div>
        </div>

        <div className="hidden min-h-0 max-w-full shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white p-2.5 text-xs shadow-premium backdrop-blur-sm md:flex">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Signals
          </p>
          <ul className="mt-2.5 h-[5.25rem] min-h-0 shrink-0 touch-pan-y space-y-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 text-[11px] leading-snug text-slate-800 [scrollbar-gutter:stable]">
            {signalLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative aspect-[16/9] min-h-[min(360px,50vh)] w-full min-w-0 overflow-hidden bg-[#f4f5f7]">
        <div
          ref={hostRef}
          className="world-map-host absolute inset-0 isolate z-0 h-full w-full [&_.leaflet-control-zoom]:hidden"
        />

        <div className="pointer-events-auto absolute bottom-4 left-3 z-[20] flex flex-col gap-0.5 rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-premium backdrop-blur-sm sm:left-4">
          <button
            type="button"
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5"
            onClick={zoomIn}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="mx-2 h-0.5 shrink-0 rounded-full bg-slate-300/90" />
          <button
            type="button"
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition hover:bg-primary/5"
            onClick={zoomOut}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 z-[20] max-w-[min(100%-1.5rem,220px)] sm:right-4">
          <div className="w-full max-w-[min(100%,200px)] rounded-lg border border-slate-200/90 bg-white/95 px-2.5 py-2 text-[9px] text-slate-600 shadow-premium backdrop-blur-sm">
            <p className="font-bold uppercase tracking-wide text-primary">Legend</p>
            <div className="mt-1.5 space-y-1.5">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c7d8f4]" /> Low engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#5b7ab8]" /> Mid engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1e4a9e]" /> High engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-primary bg-primary/10"
                  aria-hidden
                />
                Growth target (dashed outline)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-slate-100 px-3 pt-3 pb-3 sm:px-4">
        <p className="max-w-[min(100%,52rem)] text-[10px] leading-snug text-slate-500">
          Labels are English-centric (Esri World Light Gray). Zoom in for more place detail.
          Attribution:{" "}
          <a
            className="text-slate-600 underline-offset-2 hover:underline"
            href="https://www.esri.com/"
            target="_blank"
            rel="noreferrer"
          >
            © Esri
          </a>
          , Garmin, HERE,{" "}
          <a
            className="text-slate-600 underline-offset-2 hover:underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap
          </a>{" "}
          contributors, and other sources.
        </p>
        <button
          type="button"
          className="shrink-0 text-[10px] font-semibold text-primary underline-offset-2 hover:underline"
          onClick={resetView}
        >
          Reset view
        </button>
      </div>
    </div>
  );
}

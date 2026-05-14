"use client";

/**
 * Leaflet is driven imperatively (L.map + map.remove) instead of react-leaflet’s MapContainer.
 * Root cause of “Map container is already initialized”: React 18 Strict Mode / concurrent
 * rendering can commit MapContainer twice before Leaflet finishes tearing down the prior
 * map on the same DOM node. Imperative lifecycle guarantees one map instance per mount.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { MAP_POINTS, PRODUCTS } from "@/lib/mock-data";
import type { DashboardFiltersState, EngagementBand, MapPoint } from "@/lib/types";

/** Brand primary — selected nodes and high-engagement peak. */
const PRIMARY = "#003087";

/**
 * Marker fills — four clearly separate hues on a light map, still enterprise-friendly:
 * amber (low), emerald (mid), red (high), blue growth target (dashed).
 */
const MAP_LOW = "#f59e0b";
const MAP_MID = "#10b981";
const MAP_HIGH = "#dc2626";
const MAP_LOW_STROKE = "#d97706";
const MAP_MID_STROKE = "#047857";
const MAP_HIGH_STROKE = "#991b1b";
const GROWTH_FILL = "#e6eeff";
const GROWTH_STROKE = "#0000ff";

/** Carto Positron (`light_all`): light raster basemap used with Leaflet; attribution OSM + CARTO. */
const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

function engagementFill(b: EngagementBand, selected: boolean) {
  if (selected) return PRIMARY;
  if (b === "high") return MAP_HIGH;
  if (b === "med") return MAP_MID;
  return MAP_LOW;
}

function circleStyleForPoint(pt: MapPoint, geoId: string | null): L.PathOptions {
  const selected = geoId === pt.id;
  const growth = GROWTH_TARGET_IDS.has(pt.id);
  if (growth) {
    return {
      fillColor: GROWTH_FILL,
      fillOpacity: 0.62,
      color: GROWTH_STROKE,
      weight: 2,
      opacity: 0.95,
      dashArray: "5 4",
    };
  }
  const fill = engagementFill(pt.engagement, selected);
  const stroke = selected
    ? PRIMARY
    : pt.engagement === "high"
      ? MAP_HIGH_STROKE
      : pt.engagement === "med"
        ? MAP_MID_STROKE
        : MAP_LOW_STROKE;
  return {
    fillColor: fill,
    fillOpacity: selected ? 0.55 : 0.42,
    color: stroke,
    weight: selected ? 3 : 1.5,
    opacity: 0.9,
  };
}

const GROWTH_TARGET_IDS = new Set<string>(["sgp"]);

/** Leaflet circleMarker radius (px), 2× base: low → mid → high; growth matches mid tier. */
function markerRadius(engagement: EngagementBand, growth: boolean): number {
  if (growth) return 12;
  switch (engagement) {
    case "low":
      return 8;
    case "med":
      return 12;
    case "high":
      return 18;
    default:
      return 12;
  }
}

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

  const footprint = MAP_POINTS.length;

  const productName = useMemo(
    () =>
      PRODUCTS.find((p) => p.id === filters.productId)?.name ??
      PRODUCTS[0]?.name ??
      "Delta Cloud",
    [filters.productId]
  );

  const signalEntries = useMemo(
    () => [
      ...MAP_POINTS.map((p, i) => ({
        id: p.id,
        text: `${p.name}: steady throughput (${(62 + (i * 5) % 28).toFixed(1)}%).`,
      })),
      {
        id: "product-routing",
        text: `${productName}: routing healthy (all regions).`,
      },
    ],
    [productName]
  );

  const zoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);
  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    // Animated setView alone can leave GridLayers with an incomplete tile grid (gaps / partial
    // paint) when combined with worldCopyJump and stacked tile sources. Finish the move, then
    // re-measure and redraw tiles once.
    map.setView([16, 0], 2, { animate: false });
    map.invalidateSize({ animate: false });
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      map.eachLayer((layer) => {
        const tl = layer as L.TileLayer;
        if (typeof tl.redraw === "function") tl.redraw();
      });
    });
  }, []);

  const syncMarkerSelection = useCallback((geoId: string | null) => {
    for (const pt of MAP_POINTS) {
      const m = markersRef.current[pt.id];
      if (!m) continue;
      m.setStyle(circleStyleForPoint(pt, geoId));
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
      attribution: "",
      subdomains: "abcd",
      maxZoom: 20,
      maxNativeZoom: 20,
      keepBuffer: 4,
      updateWhenIdle: false,
      updateInterval: 75,
      crossOrigin: true,
      className: "world-map-tiles",
    };
    L.tileLayer(TILE_URL, tileOpts).addTo(map);

    const markers: Record<string, L.CircleMarker> = {};
    const geoId = filtersRef.current.geographyId;

    for (const pt of MAP_POINTS) {
      const growth = GROWTH_TARGET_IDS.has(pt.id);
      const r = markerRadius(pt.engagement, growth);
      const style = circleStyleForPoint(pt, geoId);

      const cm = L.circleMarker([pt.lat, pt.lng], {
        radius: r,
        ...style,
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

    let bumpRaf: number = 0;
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

    const timeouts = [0, 150, 400].map((ms) => window.setTimeout(bump, ms) as number);

    let resizeTimer: number | undefined;
    const onWinResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(bump, 120) as number;
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
    // Map + markers: single mount; radii are stable (derived from static MAP_POINTS).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-once
  }, []);

  useEffect(() => {
    syncMarkerSelection(filters.geographyId);
  }, [filters.geographyId, syncMarkerSelection]);

  return (
    <div className="dash-card-lg relative overflow-hidden">
      <div className="pointer-events-auto absolute left-3 top-3 z-[20] flex min-h-0 w-[min(100%-1.5rem,220px)] max-w-full flex-col gap-2 sm:left-4 sm:top-4">
        <div className="shrink-0 rounded-lg border border-slate-200/90 bg-white p-2 text-xs shadow-premium backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Node status
          </p>
          <div className="mt-2 space-y-2">
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
            <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
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

        <div className="hidden min-h-0 max-w-full shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white p-2 text-xs shadow-premium backdrop-blur-sm md:flex">
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Signals
          </p>
          <ul
            className="mt-2 max-h-[calc(5*1.375rem+4*0.25rem)] min-h-0 touch-pan-y space-y-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 text-[11px] leading-snug text-slate-800 [scrollbar-gutter:stable]"
            aria-label="Regional signals"
          >
            {signalEntries.map((row) => (
              <li key={row.id}>{row.text}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative aspect-video w-full min-w-0 overflow-hidden bg-[#f4f5f7] min-h-[min(280px,38svh)] max-h-[min(720px,70svh)] sm:min-h-[min(320px,44svh)] lg:min-h-[min(380px,50svh)]">
        <div
          ref={hostRef}
          className="world-map-host absolute inset-0 isolate z-0 h-full w-full [&_.leaflet-control-zoom]:hidden"
        />

        <div className="pointer-events-auto absolute bottom-3 left-3 z-[20] flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-0.5 shadow-[0_2px_16px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.85)_inset] ring-1 ring-slate-900/[0.04] backdrop-blur-md sm:bottom-4 sm:left-4">
          <button
            type="button"
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-primary/[0.08] hover:text-primary active:scale-[0.96]"
            onClick={zoomIn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="mx-1 my-px h-px shrink-0 bg-slate-200/90" />
          <button
            type="button"
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-primary/[0.08] hover:text-primary active:scale-[0.96]"
            onClick={zoomOut}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-3 right-3 z-[20] max-w-[min(100%-1.5rem,220px)] sm:right-4">
          <div className="w-full max-w-[min(100%,200px)] rounded-lg border border-slate-200/90 bg-white/95 px-2 py-1.5 text-[9px] text-slate-600 shadow-premium backdrop-blur-sm">
            <p className="font-semibold uppercase tracking-[0.12em] text-slate-500">Legend</p>
            <div className="mt-1.5 space-y-1">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: MAP_LOW }}
                  aria-hidden
                />
                Low engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: MAP_MID }}
                  aria-hidden
                />
                Mid engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: MAP_HIGH }}
                  aria-hidden
                />
                High engagement
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="box-border h-[10px] w-[10px] shrink-0 rounded-full border-2 border-dashed"
                  style={{ backgroundColor: GROWTH_FILL, borderColor: GROWTH_STROKE }}
                  aria-hidden
                />
                Growth target (dashed outline)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-slate-100 px-3 py-1 sm:px-4">
        <p className="max-w-[min(100%,52rem)] text-[10px] leading-tight text-slate-500">
          Leaflet | ©{" "}
          <a
            className="font-medium text-primary underline-offset-2 hover:underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          contributors ©{" "}
          <a
            className="font-medium text-primary underline-offset-2 hover:underline"
            href="https://carto.com/attributions/"
            target="_blank"
            rel="noreferrer"
          >
            CARTO
          </a>
          . Zoom in for country, state, city, and village labels from tiles.
        </p>
        <button
          type="button"
          className="shrink-0 border-0 bg-transparent p-0 text-sm font-medium text-primary underline-offset-2 transition hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1"
          onClick={resetView}
        >
          Reset view
        </button>
      </div>
    </div>
  );
}

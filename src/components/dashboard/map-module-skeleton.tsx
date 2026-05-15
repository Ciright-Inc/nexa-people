import type { CSSProperties } from "react";

/**
 * Map-area loading: keeps a “live atlas” feel — basemap tint, scan sweep,
 * pulsing nodes, corner metrics, animated chart trace (no full-screen gray card).
 */
const NODE_STYLE: CSSProperties[] = [
  { top: "22%", left: "18%", animationDelay: "0s" },
  { top: "38%", left: "44%", animationDelay: "0.35s" },
  { top: "28%", left: "68%", animationDelay: "0.7s" },
  { top: "58%", left: "26%", animationDelay: "0.2s" },
  { top: "52%", left: "58%", animationDelay: "0.55s" },
  { top: "68%", left: "76%", animationDelay: "0.9s" },
  { top: "72%", left: "40%", animationDelay: "0.12s" },
];

export function MapModuleSkeleton() {
  return (
    <div
      className="relative flex aspect-video min-h-[min(280px,38svh)] w-full max-w-full flex-col overflow-hidden rounded-[1.35rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/[0.04] sm:min-h-[min(320px,44svh)] lg:min-h-[min(380px,50svh)]"
      aria-busy="true"
      aria-label="Loading global connectivity map"
    >
      {/* Basemap-like field (map “visible underneath” feel) */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-100/95 via-sky-50/70 to-emerald-50/45"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="nexa-map-scan-sweep" aria-hidden />

      {/* Soft vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.55),transparent_55%)]"
        aria-hidden
      />

      {/* Glowing “activity” nodes */}
      {NODE_STYLE.map((pos, i) => (
        <span
          key={i}
          className="nexa-skel-node-pulse pointer-events-none absolute h-2.5 w-2.5 rounded-full border border-white/70 bg-primary/35 shadow-sm"
          style={pos}
          aria-hidden
        />
      ))}

      {/* Corner metric glass chips */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1] flex flex-col gap-2 sm:left-4 sm:top-4">
        <div className="nexa-skel--breathe rounded-xl border border-white/55 bg-white/55 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-md sm:px-3.5">
          <div className="nexa-skeleton nexa-skel--shimmer-slow mb-1.5 h-1.5 w-14 rounded-full" />
          <div className="nexa-skeleton nexa-skel--shimmer-fast h-3 w-20 rounded-md" />
        </div>
        <div className="hidden rounded-lg border border-white/50 bg-sky-50/40 px-2 py-1 sm:flex sm:items-center sm:gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400/90" />
          </span>
          <div className="nexa-skeleton nexa-skel--shimmer-delay-2 h-2 w-16 rounded-full" />
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-[1] flex flex-col items-end gap-2 sm:right-4 sm:top-4">
        <div className="nexa-skel--breathe flex items-center gap-2 rounded-2xl border border-white/55 bg-white/50 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-md">
          <div className="nexa-skeleton nexa-skel--shimmer-delay-3 h-2 w-10 rounded-full" />
          <div className="nexa-skeleton nexa-skel--shimmer-slow h-4 w-14 rounded-lg" />
        </div>
        <div className="nexa-skeleton nexa-skel--shimmer-fast h-6 w-24 rounded-full opacity-90" />
      </div>

      {/* Animated chart trace + axis ticks */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] px-3 pb-3 sm:px-4 sm:pb-4">
        <svg
          className="h-14 w-full overflow-visible sm:h-[4.25rem]"
          viewBox="0 0 400 56"
          preserveAspectRatio="none"
          aria-hidden
        >
          <line x1="0" y1="48" x2="400" y2="48" stroke="rgba(15,23,42,0.08)" strokeWidth="1" />
          {[64, 128, 192, 256, 320].map((x) => (
            <line
              key={x}
              x1={x}
              y1="46"
              x2={x}
              y2="50"
              stroke="rgba(15,23,42,0.06)"
              strokeWidth="1"
            />
          ))}
          <path
            className="nexa-skel-chart-path"
            d="M0,40 C40,38 72,12 120,22 S200,48 260,18 S340,8 400,28"
            fill="none"
            stroke="rgba(0,48,135,0.35)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-1 flex justify-between gap-2">
          <div className="nexa-skeleton nexa-skel--shimmer-slow h-2 w-[22%] max-w-[5.5rem] rounded-full" />
          <div className="nexa-skeleton nexa-skel--shimmer-fast h-2 w-[18%] max-w-[4.5rem] rounded-full opacity-80" />
          <div className="nexa-skeleton nexa-skel--shimmer-delay-2 hidden h-2 w-[28%] max-w-[7rem] rounded-full sm:block" />
        </div>
      </div>
    </div>
  );
}

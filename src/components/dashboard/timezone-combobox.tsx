"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clsx } from "clsx";

import type { TimezoneOption } from "@/lib/timezones";

/** One row ≈ 2.5rem tall; prefer this many rows visible before scrolling. */
const ROW_REM = 2.5;
const VISIBLE_ROWS = 5;
const VIEWPORT_PAD = 12;
const GAP = 8;
const SEARCH_BLOCK_PX = 56;

type PanelPos = {
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
  top?: number;
  bottom?: number;
};

type TimezoneComboboxProps = {
  id?: string;
  labelId?: string;
  options: TimezoneOption[];
  value: string;
  onChange: (ianaId: string) => void;
};

function remPx(): number {
  if (typeof document === "undefined") return 16;
  const n = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(n) && n > 0 ? n : 16;
}

export function TimezoneCombobox({ id, labelId, options, value, onChange }: TimezoneComboboxProps) {
  const autoId = useId();
  const listboxId = id ?? `tz-combobox-${autoId}`;
  const searchId = `${listboxId}-search`;

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.id.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [options, query]);

  const current = options.find((o) => o.id === value) ?? options[0];

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const updatePosition = useCallback(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rem = remPx();
    const rowPx = ROW_REM * rem;
    const preferredList = rowPx * VISIBLE_ROWS;
    const minList = rowPx * 2;

    const spaceBelow = vh - rect.bottom - VIEWPORT_PAD;
    const spaceAbove = rect.top - VIEWPORT_PAD;

    const needBelow = preferredList + SEARCH_BLOCK_PX + GAP;
    const openUp = spaceBelow < needBelow * 0.65 && spaceAbove > spaceBelow;

    const width = Math.min(Math.max(rect.width, 200), vw - VIEWPORT_PAD * 2);
    const left = Math.max(VIEWPORT_PAD, Math.min(rect.left, vw - width - VIEWPORT_PAD));

    const cap = openUp ? spaceAbove - GAP : spaceBelow - GAP;
    const maxTotal = Math.min(
      preferredList + SEARCH_BLOCK_PX + 8,
      Math.max(SEARCH_BLOCK_PX + minList + 8, cap)
    );

    const next: PanelPos = {
      left,
      width,
      maxHeight: maxTotal,
      openUp,
    };

    if (openUp) {
      next.bottom = vh - rect.top + GAP;
    } else {
      next.top = rect.bottom + GAP;
    }

    setPanelPos(next);
  }, [open]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const candidates = listRef.current.querySelectorAll<HTMLElement>("[data-tz-id]");
    for (const el of candidates) {
      if (el.getAttribute("data-tz-id") === value) {
        el.scrollIntoView({ block: "nearest" });
        break;
      }
    }
  }, [open, value, filtered]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const panel =
    open && mounted && panelPos && typeof document !== "undefined" ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[1040] cursor-default bg-transparent"
          aria-label="Close timezone list"
          tabIndex={-1}
          onClick={close}
        />
        <div
          id={`${listboxId}-panel`}
          role="listbox"
          aria-labelledby={labelId}
          className={clsx(
            "fixed z-[1050] flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-premiumLg",
            panelPos.openUp && "flex-col-reverse"
          )}
          style={{
            left: panelPos.left,
            width: panelPos.width,
            maxHeight: panelPos.maxHeight,
            ...(panelPos.openUp
              ? { bottom: panelPos.bottom }
              : { top: panelPos.top }),
          }}
        >
          <div className="shrink-0 border-b border-slate-200/90 p-2">
            <label htmlFor={searchId} className="sr-only">
              Search time zones
            </label>
            <input
              id={searchId}
              type="search"
              autoComplete="off"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search time zones…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div
            id={`${listboxId}-list`}
            ref={listRef}
            className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 py-1.5"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-500">No matching time zones.</p>
            ) : (
              filtered.map((tz) => {
                const selected = tz.id === value;
                return (
                  <button
                    key={tz.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-tz-id={tz.id}
                    onClick={() => {
                      onChange(tz.id);
                      close();
                    }}
                    className={clsx(
                      "flex w-full min-h-[2.5rem] items-center rounded-lg px-3 py-2 text-left text-sm leading-snug transition",
                      selected
                        ? "bg-primary font-medium text-white"
                        : "text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    <span className="min-w-0 break-all">{tz.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </>
    ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        id={listboxId}
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${listboxId}-list` : undefined}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm outline-none transition",
          "hover:border-slate-300 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15",
          open && "border-primary/40 ring-2 ring-primary/15"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{current?.label ?? value}</span>
        <span
          className={clsx("shrink-0 text-slate-500 transition-transform", open && "rotate-180")}
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5 10 12.5l5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {mounted && open && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

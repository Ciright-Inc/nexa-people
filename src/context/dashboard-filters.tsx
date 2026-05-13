"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  DashboardFiltersState,
  DateRangePreset,
  PlatformFilter,
  PlatformKey,
  SegmentFilter,
} from "@/lib/types";
import { PRODUCTS } from "@/lib/mock-data";

const ALL_PLATFORMS: PlatformKey[] = ["web", "ios", "android"];

function sortUniquePlatforms(p: PlatformKey[]): PlatformFilter {
  return Array.from(new Set(p)).sort(
    (a, b) => ALL_PLATFORMS.indexOf(a) - ALL_PLATFORMS.indexOf(b)
  );
}

function isFullPlatformSelection(p: PlatformFilter) {
  return sortUniquePlatforms(p).length === ALL_PLATFORMS.length;
}

const defaultState = (): DashboardFiltersState => ({
  productId: PRODUCTS[0]?.id ?? "",
  datePreset: "30d",
  customFrom: null,
  customTo: null,
  geographyId: null,
  geographyLabel: null,
  platforms: [...ALL_PLATFORMS],
  segment: "all",
});

function parsePreset(v: string | null): DateRangePreset {
  if (v === "7d" || v === "30d" || v === "90d" || v === "qtd" || v === "custom")
    return v;
  return "30d";
}

function parsePlatforms(v: string | null): PlatformFilter {
  if (!v) return [...ALL_PLATFORMS];
  const parts = v.split(",").map((s) => s.trim());
  const picked: PlatformKey[] = [];
  for (const p of parts) {
    if (p === "web" || p === "ios" || p === "android") picked.push(p);
  }
  const u = sortUniquePlatforms(picked);
  return u.length > 0 ? u : [...ALL_PLATFORMS];
}

function parseSegment(v: string | null): SegmentFilter {
  if (v === "enterprise" || v === "pro" || v === "free" || v === "all") return v;
  return "all";
}

type DashboardFiltersContextValue = {
  filters: DashboardFiltersState;
  setProductId: (id: string) => void;
  setDatePreset: (p: DateRangePreset) => void;
  setCustomRange: (from: string | null, to: string | null) => void;
  setGeography: (id: string | null, label: string | null) => void;
  setPlatforms: (p: PlatformFilter) => void;
  setSegment: (s: SegmentFilter) => void;
  clearAll: () => void;
  resetAnalyticsFilters: () => void;
};

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | null>(
  null
);

function stateFromSearchParams(
  searchParams: URLSearchParams,
  prev?: DashboardFiltersState
): DashboardFiltersState {
  const product =
    searchParams.get("product") ||
    prev?.productId ||
    PRODUCTS[0]?.id ||
    "";
  return {
    productId: product,
    datePreset: parsePreset(searchParams.get("range")),
    customFrom: searchParams.get("from"),
    customTo: searchParams.get("to"),
    geographyId: searchParams.get("geo"),
    geographyLabel: searchParams.get("geoLabel"),
    platforms: parsePlatforms(searchParams.get("platform")),
    segment: parseSegment(searchParams.get("segment")),
  };
}

export function DashboardFiltersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<DashboardFiltersState>(() =>
    stateFromSearchParams(new URLSearchParams(searchParams.toString()))
  );

  useEffect(() => {
    setFilters((prev) => stateFromSearchParams(searchParams, prev));
  }, [searchParams]);

  const pushParams = useCallback(
    (next: DashboardFiltersState) => {
      const p = new URLSearchParams();
      p.set("product", next.productId);
      p.set("range", next.datePreset);
      if (next.datePreset === "custom" && next.customFrom && next.customTo) {
        p.set("from", next.customFrom);
        p.set("to", next.customTo);
      }
      if (next.geographyId) {
        p.set("geo", next.geographyId);
        if (next.geographyLabel) p.set("geoLabel", next.geographyLabel);
      }
      if (!isFullPlatformSelection(next.platforms)) {
        p.set("platform", sortUniquePlatforms(next.platforms).join(","));
      }
      if (next.segment !== "all") p.set("segment", next.segment);
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
      setFilters(next);
    },
    [pathname, router]
  );

  const setProductId = useCallback(
    (id: string) => pushParams({ ...filters, productId: id }),
    [filters, pushParams]
  );

  const setDatePreset = useCallback(
    (datePreset: DateRangePreset) =>
      pushParams({
        ...filters,
        datePreset,
        customFrom: datePreset === "custom" ? filters.customFrom : null,
        customTo: datePreset === "custom" ? filters.customTo : null,
      }),
    [filters, pushParams]
  );

  const setCustomRange = useCallback(
    (from: string | null, to: string | null) =>
      pushParams({
        ...filters,
        datePreset: "custom",
        customFrom: from,
        customTo: to,
      }),
    [filters, pushParams]
  );

  const setGeography = useCallback(
    (geographyId: string | null, geographyLabel: string | null) =>
      pushParams({ ...filters, geographyId, geographyLabel }),
    [filters, pushParams]
  );

  const setPlatforms = useCallback(
    (platforms: PlatformFilter) => {
      const next = sortUniquePlatforms(platforms);
      pushParams({
        ...filters,
        platforms: next.length > 0 ? next : [...ALL_PLATFORMS],
      });
    },
    [filters, pushParams]
  );

  const setSegment = useCallback(
    (segment: SegmentFilter) => pushParams({ ...filters, segment }),
    [filters, pushParams]
  );

  const clearAll = useCallback(() => {
    pushParams(defaultState());
  }, [pushParams]);

  const resetAnalyticsFilters = useCallback(() => {
    const base = defaultState();
    pushParams({ ...base, productId: filters.productId });
  }, [filters.productId, pushParams]);

  const value = useMemo(
    () => ({
      filters,
      setProductId,
      setDatePreset,
      setCustomRange,
      setGeography,
      setPlatforms,
      setSegment,
      clearAll,
      resetAnalyticsFilters,
    }),
    [
      filters,
      setProductId,
      setDatePreset,
      setCustomRange,
      setGeography,
      setPlatforms,
      setSegment,
      clearAll,
      resetAnalyticsFilters,
    ]
  );

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error("useDashboardFilters must be used within provider");
  }
  return ctx;
}

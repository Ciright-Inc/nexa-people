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
  SegmentFilter,
} from "@/lib/types";
import { PRODUCTS } from "@/lib/mock-data";

const defaultState = (): DashboardFiltersState => ({
  productId: PRODUCTS[0]?.id ?? "",
  datePreset: "30d",
  customFrom: null,
  customTo: null,
  geographyId: null,
  geographyLabel: null,
  platform: "all",
  segment: "all",
});

function parsePreset(v: string | null): DateRangePreset {
  if (v === "7d" || v === "30d" || v === "90d" || v === "qtd" || v === "custom")
    return v;
  return "30d";
}

function parsePlatform(v: string | null): PlatformFilter {
  if (v === "web" || v === "ios" || v === "android" || v === "all") return v;
  return "all";
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
  setPlatform: (p: PlatformFilter) => void;
  setSegment: (s: SegmentFilter) => void;
  clearAll: () => void;
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
    platform: parsePlatform(searchParams.get("platform")),
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
      if (next.platform !== "all") p.set("platform", next.platform);
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

  const setPlatform = useCallback(
    (platform: PlatformFilter) => pushParams({ ...filters, platform }),
    [filters, pushParams]
  );

  const setSegment = useCallback(
    (segment: SegmentFilter) => pushParams({ ...filters, segment }),
    [filters, pushParams]
  );

  const clearAll = useCallback(() => {
    pushParams(defaultState());
  }, [pushParams]);

  const value = useMemo(
    () => ({
      filters,
      setProductId,
      setDatePreset,
      setCustomRange,
      setGeography,
      setPlatform,
      setSegment,
      clearAll,
    }),
    [
      filters,
      setProductId,
      setDatePreset,
      setCustomRange,
      setGeography,
      setPlatform,
      setSegment,
      clearAll,
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

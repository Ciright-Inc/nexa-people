"use client";

import { useCallback, useEffect, useState } from "react";

import { getCachedPersonalSites } from "@/lib/personal-sites-cache";
import {
  fetchPersonalSites,
  type PersonalSitesApiPayload,
} from "@/lib/personal-sites-fetch";
import { PERSONAL_SITES_LIST_CHANGED_EVENT } from "@/lib/personal-sites-storage";
import {
  clearSelectedSiteFromDashboard,
  clearSelectedSiteIfNotInList,
} from "@/lib/selected-site";

const EMPTY: PersonalSitesApiPayload = { sites: [], pinnedIds: [] };

export function usePersonalSites(options?: { preferCacheOnMount?: boolean }) {
  const preferCacheOnMount = options?.preferCacheOnMount !== false;
  const initial = getCachedPersonalSites();

  const [data, setData] = useState<PersonalSitesApiPayload>(() => initial ?? EMPTY);
  const [loading, setLoading] = useState(() => !initial);
  const [error, setError] = useState<string | null>(null);

  const applyPayload = useCallback((payload: PersonalSitesApiPayload) => {
    clearSelectedSiteIfNotInList(payload.sites);
    setData(payload);
    setError(null);
  }, []);

  const refresh = useCallback(async (preferCache = false) => {
    try {
      const payload = await fetchPersonalSites({ preferCache });
      applyPayload(payload);
    } catch (e) {
      clearSelectedSiteFromDashboard();
      setData(EMPTY);
      setError(e instanceof Error ? e.message : "Failed to load sites");
    } finally {
      setLoading(false);
    }
  }, [applyPayload]);

  useEffect(() => {
    void refresh(preferCacheOnMount);
  }, [refresh, preferCacheOnMount]);

  useEffect(() => {
    const onListChanged = () => {
      void refresh(false);
    };
    window.addEventListener(PERSONAL_SITES_LIST_CHANGED_EVENT, onListChanged);
    return () => window.removeEventListener(PERSONAL_SITES_LIST_CHANGED_EVENT, onListChanged);
  }, [refresh]);

  return {
    sites: data.sites,
    pinnedIds: data.pinnedIds,
    loading,
    error,
    refresh,
    setFromMutation: applyPayload,
  };
}

import type { PersonalSite } from "@/lib/types";
import {
  getCachedPersonalSites,
  getPersonalSitesInflight,
  setCachedPersonalSites,
  setPersonalSitesInflight,
} from "@/lib/personal-sites-cache";
import { notifyPersonalSitesListChanged } from "@/lib/personal-sites-storage";

export type PersonalSitesApiPayload = {
  sites: PersonalSite[];
  pinnedIds: string[];
};

async function parseJson(res: Response): Promise<PersonalSitesApiPayload> {
  const data = (await res.json()) as unknown;
  if (!data || typeof data !== "object") throw new Error("Bad response");
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.sites) || !Array.isArray(o.pinnedIds)) throw new Error("Bad response shape");
  return { sites: o.sites as PersonalSite[], pinnedIds: o.pinnedIds.filter((x): x is string => typeof x === "string") };
}

type ApiErrorBody = { error?: string; hint?: string };

async function throwApiError(res: Response, fallback: string): Promise<never> {
  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
  const detail = body?.error?.trim();
  const hint = body?.hint?.trim();
  const parts = [detail || fallback];
  if (hint) parts.push(hint);
  throw new Error(parts.join(" "));
}

async function fetchPersonalSitesNetwork(): Promise<PersonalSitesApiPayload> {
  const res = await fetch("/api/personal-sites", { cache: "no-store" });
  if (!res.ok) await throwApiError(res, `Failed to load sites (${res.status})`);
  const payload = await parseJson(res);
  setCachedPersonalSites(payload);
  notifyPersonalSitesListChanged();
  return payload;
}

export async function fetchPersonalSites(options?: { preferCache?: boolean }): Promise<PersonalSitesApiPayload> {
  const preferCache = options?.preferCache !== false;
  if (preferCache) {
    const hit = getCachedPersonalSites();
    if (hit) return hit;
  }

  const existing = getPersonalSitesInflight();
  if (existing) return existing;

  const request = fetchPersonalSitesNetwork().finally(() => setPersonalSitesInflight(null));
  setPersonalSitesInflight(request);
  return request;
}

export function prefetchPersonalSites() {
  void fetchPersonalSites({ preferCache: true }).catch(() => null);
}

export async function addPersonalSiteApi(host: string, timezoneId: string): Promise<PersonalSitesApiPayload> {
  const res = await fetch("/api/personal-sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", host, timezoneId }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Add failed (${res.status})`);
  }
  const payload = await parseJson(res);
  setCachedPersonalSites(payload);
  notifyPersonalSitesListChanged();
  return payload;
}

export async function deletePersonalSiteApi(id: string): Promise<PersonalSitesApiPayload> {
  const res = await fetch("/api/personal-sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Delete failed (${res.status})`);
  }
  const payload = await parseJson(res);
  setCachedPersonalSites(payload);
  notifyPersonalSitesListChanged();
  return payload;
}

export async function setPinnedSitesApi(pinnedIds: string[]): Promise<PersonalSitesApiPayload> {
  const res = await fetch("/api/personal-sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "setPinned", pinnedIds }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Pin update failed (${res.status})`);
  }
  const payload = await parseJson(res);
  setCachedPersonalSites(payload);
  notifyPersonalSitesListChanged();
  return payload;
}

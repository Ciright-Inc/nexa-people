import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { randomUUID } from "crypto";

import { normalizeSiteHostInput } from "@/lib/normalize-site-host";
import { sortPersonalSitesPinnedFirst } from "@/lib/personal-sites-storage";
import type { PersonalSite } from "@/lib/types";

type CustomSiteRow = PersonalSite & {
  timezoneId: string;
  snippetSavedAt?: string;
};

type PersistedState = {
  customSites: CustomSiteRow[];
  pinnedIds: string[];
};

function dataFilePath(): string {
  return process.env.PERSONAL_SITES_DATA_PATH ?? join(process.cwd(), "data", "personal-sites.json");
}

function emptyState(): PersistedState {
  return { customSites: [], pinnedIds: [] };
}

function readState(): PersistedState {
  const path = dataFilePath();
  try {
    if (!existsSync(path)) return emptyState();
    const raw = readFileSync(path, "utf8");
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return emptyState();
    const o = data as Record<string, unknown>;
    return {
      pinnedIds: Array.isArray(o.pinnedIds)
        ? o.pinnedIds.filter((x): x is string => typeof x === "string")
        : [],
      customSites: Array.isArray(o.customSites)
        ? o.customSites
            .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
            .map((row) => ({
              id: String(row.id ?? ""),
              host: String(row.host ?? ""),
              timezoneId: typeof row.timezoneId === "string" ? row.timezoneId : "UTC",
              visitors24h:
                typeof row.visitors24h === "number" && Number.isFinite(row.visitors24h)
                  ? row.visitors24h
                  : 0,
              deltaPct:
                typeof row.deltaPct === "number" && Number.isFinite(row.deltaPct) ? row.deltaPct : 0,
              snippetSavedAt: typeof row.snippetSavedAt === "string" ? row.snippetSavedAt : undefined,
            }))
            .filter((row) => row.id && row.host)
        : [],
    };
  } catch {
    return emptyState();
  }
}

function writeState(state: PersistedState): void {
  const path = dataFilePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function toPersonalSites(state: PersistedState): PersonalSite[] {
  return state.customSites.map((s) => ({
    id: s.id,
    host: s.host,
    visitors24h: s.visitors24h,
    deltaPct: s.deltaPct,
  }));
}

export type PersonalSitesResponse = {
  sites: PersonalSite[];
  pinnedIds: string[];
};

export function listPersonalSitesFromDb(): PersonalSitesResponse {
  const state = readState();
  const sites = sortPersonalSitesPinnedFirst(toPersonalSites(state), state.pinnedIds);
  return { sites, pinnedIds: state.pinnedIds };
}

export function addSiteToDb(host: string, timezoneId: string): void {
  const state = readState();
  const normalized = normalizeSiteHostInput(host);
  const now = new Date().toISOString();

  const existingIdx = state.customSites.findIndex(
    (s) => normalizeSiteHostInput(s.host) === normalized
  );

  if (existingIdx !== -1) {
    state.customSites[existingIdx] = {
      ...state.customSites[existingIdx],
      timezoneId,
      snippetSavedAt: now,
    };
    writeState(state);
    return;
  }

  state.customSites.push({
    id: `cs_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    host: normalized,
    timezoneId,
    visitors24h: 0,
    deltaPct: 0,
    snippetSavedAt: now,
  });
  writeState(state);
}

export function deleteSiteFromDb(siteId: string): boolean {
  const state = readState();
  const before = state.customSites.length;
  state.customSites = state.customSites.filter((s) => s.id !== siteId);
  if (state.customSites.length === before) return false;

  state.pinnedIds = state.pinnedIds.filter((id) => id !== siteId);
  writeState(state);
  return true;
}

export function setPinnedSiteIdsInDb(siteIds: string[]): void {
  const state = readState();
  const visibleIds = new Set(toPersonalSites(state).map((s) => s.id));
  state.pinnedIds = siteIds.filter((id) => visibleIds.has(id));
  writeState(state);
}

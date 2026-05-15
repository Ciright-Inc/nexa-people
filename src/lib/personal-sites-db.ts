import { randomUUID } from "crypto";

import { warnIfUsingLocalFileStorage } from "@/lib/personal-sites-backend";
import { normalizeSiteHostInput } from "@/lib/normalize-site-host";
import {
  readStateFromFile,
  writeStateToFile,
  type PersistedState,
} from "@/lib/personal-sites-file-store";
import { readStateFromPg, writeStateToPg } from "@/lib/personal-sites-pg-store";
import { sortPersonalSitesPinnedFirst } from "@/lib/personal-sites-storage";
import type { PersonalSite } from "@/lib/types";

export type PersonalSitesResponse = {
  sites: PersonalSite[];
  pinnedIds: string[];
};

/** True when DATABASE_URL is set — local and production must use the same URL to share data. */
export function usesSharedPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function readState(): Promise<PersistedState> {
  if (usesSharedPostgres()) return readStateFromPg();
  return readStateFromFile();
}

async function writeState(state: PersistedState): Promise<void> {
  if (usesSharedPostgres()) {
    await writeStateToPg(state);
    return;
  }
  writeStateToFile(state);
}

function toPersonalSites(state: PersistedState): PersonalSite[] {
  return state.customSites.map((s) => ({
    id: s.id,
    host: s.host,
    visitors24h: s.visitors24h,
    deltaPct: s.deltaPct,
  }));
}

export async function listPersonalSitesFromDb(): Promise<PersonalSitesResponse> {
  warnIfUsingLocalFileStorage();
  const state = await readState();
  const sites = sortPersonalSitesPinnedFirst(toPersonalSites(state), state.pinnedIds);
  return { sites, pinnedIds: state.pinnedIds };
}

export async function addSiteToDb(host: string, timezoneId: string): Promise<void> {
  const state = await readState();
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
    await writeState(state);
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
  await writeState(state);
}

export async function deleteSiteFromDb(siteId: string): Promise<boolean> {
  const state = await readState();
  const before = state.customSites.length;
  state.customSites = state.customSites.filter((s) => s.id !== siteId);
  if (state.customSites.length === before) return false;

  state.pinnedIds = state.pinnedIds.filter((id) => id !== siteId);
  await writeState(state);
  return true;
}

export async function setPinnedSiteIdsInDb(siteIds: string[]): Promise<void> {
  const state = await readState();
  const visibleIds = new Set(toPersonalSites(state).map((s) => s.id));
  state.pinnedIds = siteIds.filter((id) => visibleIds.has(id));
  await writeState(state);
}

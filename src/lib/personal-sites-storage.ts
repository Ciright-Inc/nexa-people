import type { PersonalSite } from "@/lib/types";
import { MOCK_PERSONAL_SITES } from "@/lib/mock-data";

export const PINNED_STORAGE_KEY = "nexa-personal-sites-pinned";
export const DELETED_STORAGE_KEY = "nexa-personal-sites-deleted";

export function loadDeletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function loadPinnedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PINNED_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Pinned sites first, then alphabetical by host (same order as My Personal Sites). */
export function sortPersonalSitesPinnedFirst(sites: PersonalSite[], pinnedIds: string[]): PersonalSite[] {
  const list = [...sites];
  list.sort((a, b) => {
    const ap = pinnedIds.includes(a.id) ? 1 : 0;
    const bp = pinnedIds.includes(b.id) ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return a.host.localeCompare(b.host);
  });
  return list;
}

/** Fires when pinned/deleted lists change (same tab). */
export const PERSONAL_SITES_LIST_CHANGED_EVENT = "nexa-personal-sites-updated";

export function notifyPersonalSitesListChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PERSONAL_SITES_LIST_CHANGED_EVENT));
}

export function getActivePersonalSitesSorted(): PersonalSite[] {
  const deleted = loadDeletedIds();
  const pinned = loadPinnedIds();
  const active = MOCK_PERSONAL_SITES.filter((s) => !deleted.includes(s.id));
  return sortPersonalSitesPinnedFirst(active, pinned);
}

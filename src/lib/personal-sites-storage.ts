import type { PersonalSite } from "@/lib/types";

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

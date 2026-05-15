/** Session-only: last site opened from My Personal Sites → analytics dashboard. */
export const SELECTED_SITE_STORAGE_KEY = "nexa_selected_site";

/** Dispatched on `window` after session storage is updated so header combobox stays in sync. */
export const SELECTED_SITE_CHANGED_EVENT = "nexa-selected-site";

export type SelectedSitePayload = {
  id: string;
  host: string;
};

export function persistSelectedSiteForDashboard(site: SelectedSitePayload) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SELECTED_SITE_STORAGE_KEY, JSON.stringify(site));
    window.dispatchEvent(new Event(SELECTED_SITE_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function readSelectedSiteFromSession(): SelectedSitePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SELECTED_SITE_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "id" in data &&
      "host" in data &&
      typeof (data as { id: unknown }).id === "string" &&
      typeof (data as { host: unknown }).host === "string"
    ) {
      return { id: (data as SelectedSitePayload).id, host: (data as SelectedSitePayload).host };
    }
  } catch {
    /* ignore */
  }
  return null;
}

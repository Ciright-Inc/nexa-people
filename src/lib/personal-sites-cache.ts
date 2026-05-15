import type { PersonalSitesApiPayload } from "@/lib/personal-sites-fetch";

let cache: PersonalSitesApiPayload | null = null;
let cacheAt = 0;
let inflight: Promise<PersonalSitesApiPayload> | null = null;

const CACHE_MS = 30_000;

export function getCachedPersonalSites(): PersonalSitesApiPayload | null {
  if (!cache) return null;
  if (Date.now() - cacheAt > CACHE_MS) return null;
  return cache;
}

export function setCachedPersonalSites(payload: PersonalSitesApiPayload) {
  cache = payload;
  cacheAt = Date.now();
}

export function getPersonalSitesInflight() {
  return inflight;
}

export function setPersonalSitesInflight(p: Promise<PersonalSitesApiPayload> | null) {
  inflight = p;
}

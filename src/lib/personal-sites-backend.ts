/** How personal sites are persisted (see personal-sites-db.ts). */
export type PersonalSitesStorage = "postgresql" | "json-file";

export function getPersonalSitesStorage(): PersonalSitesStorage {
  return process.env.DATABASE_URL?.trim() ? "postgresql" : "json-file";
}

export function warnIfUsingLocalFileStorage() {
  if (process.env.NODE_ENV !== "development") return;
  if (getPersonalSitesStorage() === "postgresql") return;
  console.warn(
    "[personal-sites] DATABASE_URL is not set — using local JSON at data/personal-sites.json. " +
      "Local changes will NOT appear on Railway. Add DATABASE_URL to .env.local (see .env.example)."
  );
}

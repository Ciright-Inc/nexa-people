import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

import type { PersonalSite } from "@/lib/types";

export type CustomSiteRow = PersonalSite & {
  timezoneId: string;
  snippetSavedAt?: string;
};

export type PersistedState = {
  customSites: CustomSiteRow[];
  pinnedIds: string[];
};

export function fileDataPath(): string {
  return process.env.PERSONAL_SITES_DATA_PATH ?? join(process.cwd(), "data", "personal-sites.json");
}

export function emptyState(): PersistedState {
  return { customSites: [], pinnedIds: [] };
}

export function readStateFromFile(): PersistedState {
  const path = fileDataPath();
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

export function writeStateToFile(state: PersistedState): void {
  const path = fileDataPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

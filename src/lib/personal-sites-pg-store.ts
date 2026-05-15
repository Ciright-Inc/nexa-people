import { Pool } from "pg";

import {
  emptyState,
  readStateFromFile,
  type PersistedState,
} from "@/lib/personal-sites-file-store";

const STATE_ROW_ID = 1;

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function connectionString(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not set");
  return url;
}

function useSsl(): boolean | { rejectUnauthorized: boolean } {
  const url = connectionString();
  if (/localhost|127\.0\.0\.1/i.test(url)) return false;
  if (process.env.PGSSLMODE === "disable") return false;
  return { rejectUnauthorized: false };
}

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: connectionString(),
      ssl: useSsl(),
      max: 5,
    });
  }
  return pool;
}

async function initSchema(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS personal_sites_state (
        id SMALLINT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(
      `INSERT INTO personal_sites_state (id, payload)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [STATE_ROW_ID, JSON.stringify(emptyState())]
    );
  } finally {
    client.release();
  }
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) schemaReady = initSchema();
  await schemaReady;
}

function parsePayload(raw: unknown): PersistedState {
  if (!raw || typeof raw !== "object") return emptyState();
  const o = raw as Record<string, unknown>;
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
}

function isEmpty(state: PersistedState): boolean {
  return state.customSites.length === 0 && state.pinnedIds.length === 0;
}

/** One-time: copy local JSON file into Postgres when the remote row is still empty. */
async function migrateFromFileIfEmpty(state: PersistedState): Promise<PersistedState> {
  if (!isEmpty(state)) return state;
  const fileState = readStateFromFile();
  if (isEmpty(fileState)) return state;
  await writeStateToPg(fileState);
  console.info("[personal-sites] Migrated local JSON file into PostgreSQL.");
  return fileState;
}

export async function readStateFromPg(): Promise<PersistedState> {
  await ensureSchema();
  const { rows } = await getPool().query<{ payload: unknown }>(
    `SELECT payload FROM personal_sites_state WHERE id = $1`,
    [STATE_ROW_ID]
  );
  const state = parsePayload(rows[0]?.payload);
  return migrateFromFileIfEmpty(state);
}

export async function writeStateToPg(state: PersistedState): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO personal_sites_state (id, payload, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
    [STATE_ROW_ID, JSON.stringify(state)]
  );
}

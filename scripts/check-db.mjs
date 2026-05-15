/**
 * Verify DATABASE_URL connects to Railway Postgres and read personal_sites_state.
 * Usage: node scripts/check-db.mjs
 * Loads .env.local then .env from project root (no extra dependencies).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const root = process.cwd();

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.local.example → .env.local and paste your Railway URL.");
  process.exit(1);
}

const ssl = /localhost|127\.0\.0\.1/i.test(url)
  ? false
  : process.env.PGSSLMODE === "disable"
    ? false
    : { rejectUnauthorized: false };

const pool = new pg.Pool({ connectionString: url, ssl, max: 1 });

try {
  const { rows } = await pool.query(
    `SELECT id, updated_at, payload FROM personal_sites_state WHERE id = 1`
  );
  const row = rows[0];
  const sites = row?.payload?.customSites ?? [];
  console.log("OK — connected to PostgreSQL");
  console.log("Updated:", row?.updated_at ?? "(no row yet)");
  console.log("Sites in DB:", Array.isArray(sites) ? sites.length : 0);
  if (Array.isArray(sites) && sites.length) {
    for (const s of sites) console.log(" -", s.host);
  }
} catch (e) {
  console.error("Connection failed:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}

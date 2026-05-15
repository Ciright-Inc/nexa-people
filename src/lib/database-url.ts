/** Placeholder substrings that must not appear in a real Railway connection string. */
const PLACEHOLDER_PATTERN =
  /YOUR_PASSWORD|YOUR_PASS|REPLACE_ME|CHANGEME|<password>|xxx@|password@host/i;

export function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url || null;
}

export function isDatabaseUrlPlaceholder(url: string): boolean {
  return PLACEHOLDER_PATTERN.test(url);
}

/**
 * Returns a trimmed DATABASE_URL or throws with a fix hint for .env.local / Railway.
 */
export function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (copy from Railway → PostgreSQL → Connect)."
    );
  }
  if (isDatabaseUrlPlaceholder(url)) {
    throw new Error(
      "DATABASE_URL still contains a placeholder (e.g. YOUR_PASSWORD). Paste the full connection string from Railway → PostgreSQL → Connect into .env.local, then restart npm run dev."
    );
  }
  return url;
}

/** Map pg / connection errors to actionable messages (never include secrets). */
export function formatDatabaseError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (/password authentication failed/i.test(message)) {
    return "PostgreSQL password rejected. Update DATABASE_URL in .env.local with the current value from Railway → PostgreSQL → Connect, then run npm run db:check.";
  }
  if (/ENOTFOUND|getaddrinfo/i.test(message)) {
    return "Cannot reach the database host. Check DATABASE_URL host/port and your network connection.";
  }
  if (/ECONNREFUSED/i.test(message)) {
    return "Database refused the connection. Verify Railway Postgres is running and DATABASE_URL is correct.";
  }
  if (/SSL|certificate/i.test(message)) {
    return "Database SSL error. For Railway, use the default URL from Connect (SSL is enabled automatically).";
  }

  return message || "Database error";
}

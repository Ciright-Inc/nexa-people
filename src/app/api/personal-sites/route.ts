import { NextResponse } from "next/server";

import { getPersonalSitesStorage } from "@/lib/personal-sites-backend";
import { isValidAnalyticsHost, normalizeSiteHostInput } from "@/lib/normalize-site-host";
import {
  addSiteToDb,
  deleteSiteFromDb,
  listPersonalSitesFromDb,
  setPinnedSiteIdsInDb,
} from "@/lib/personal-sites-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listPersonalSitesFromDb());
  } catch (err) {
    console.error("[personal-sites] GET failed:", err);
    const message = err instanceof Error ? err.message : "Failed to load sites";
    const hint =
      process.env.NODE_ENV === "development" && getPersonalSitesStorage() === "postgresql"
        ? "Check DATABASE_URL in .env.local matches Railway Postgres (run npm run db:check)."
        : undefined;
    return NextResponse.json({ error: message, hint }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const action = (body as { action?: unknown }).action;
  if (action !== "add" && action !== "delete" && action !== "setPinned") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  try {
    if (action === "add") {
      const hostRaw = (body as { host?: unknown }).host;
      const tzRaw = (body as { timezoneId?: unknown }).timezoneId;
      if (typeof hostRaw !== "string" || typeof tzRaw !== "string") {
        return NextResponse.json({ error: "host and timezoneId are required" }, { status: 400 });
      }
      const normalized = normalizeSiteHostInput(hostRaw);
      if (!isValidAnalyticsHost(normalized)) {
        return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
      }
      await addSiteToDb(normalized, tzRaw);
      return NextResponse.json(await listPersonalSitesFromDb());
    }

    if (action === "delete") {
      const idRaw = (body as { id?: unknown }).id;
      if (typeof idRaw !== "string" || !idRaw.trim()) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
      const id = idRaw.trim();
      const deleted = await deleteSiteFromDb(id);
      if (!deleted) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 });
      }
      return NextResponse.json(await listPersonalSitesFromDb());
    }

    const pinnedRaw = (body as { pinnedIds?: unknown }).pinnedIds;
    if (!Array.isArray(pinnedRaw) || !pinnedRaw.every((x): x is string => typeof x === "string")) {
      return NextResponse.json({ error: "pinnedIds must be an array of strings" }, { status: 400 });
    }

    await setPinnedSiteIdsInDb(pinnedRaw);
    return NextResponse.json(await listPersonalSitesFromDb());
  } catch (err) {
    console.error("[personal-sites] POST failed:", err);
    return NextResponse.json({ error: "Site operation failed" }, { status: 500 });
  }
}

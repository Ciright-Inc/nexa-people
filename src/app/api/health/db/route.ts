import { NextResponse } from "next/server";

import { getPersonalSitesStorage } from "@/lib/personal-sites-backend";
import { listPersonalSitesFromDb } from "@/lib/personal-sites-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Dev/ops check: which storage backend is active and whether Postgres responds. */
export async function GET() {
  const storage = getPersonalSitesStorage();

  if (storage === "json-file") {
    return NextResponse.json({
      ok: true,
      storage,
      sharedWithProduction: false,
      hint: "Set DATABASE_URL in .env.local to the same value as Railway production.",
    });
  }

  try {
    const { sites, pinnedIds } = await listPersonalSitesFromDb();
    return NextResponse.json({
      ok: true,
      storage,
      sharedWithProduction: true,
      siteCount: sites.length,
      pinnedCount: pinnedIds.length,
    });
  } catch (err) {
    console.error("[health/db]", err);
    return NextResponse.json(
      {
        ok: false,
        storage,
        sharedWithProduction: true,
        error: err instanceof Error ? err.message : "Database unreachable",
      },
      { status: 503 }
    );
  }
}

import { NextResponse } from "next/server";

import { APP_NAME, APP_VERSION } from "@/lib/constants";
import { getSqlite } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    getSqlite().prepare("select 1 as ok").get();
    return NextResponse.json(
      {
        status: "ok",
        app: APP_NAME,
        version: APP_VERSION,
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "error", database: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

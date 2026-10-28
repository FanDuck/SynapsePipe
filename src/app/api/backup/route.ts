import { NextResponse } from "next/server";

import { getBackupPayload } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = getBackupPayload();
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="synapsepipe-backup-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

import fs from "node:fs/promises";

import { NextResponse } from "next/server";

import { readUpload, getUploadMimeType } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const file = await readUpload(name);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = await fs.readFile(file.path);
  const mimeType = getUploadMimeType(name);
  const range = request.headers.get("range");
  const baseHeaders = {
    "Content-Type": mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), buffer.length - 1) : buffer.length - 1;
      if (Number.isFinite(start) && start <= end && start < buffer.length) {
        const chunk = buffer.subarray(start, end + 1);
        return new Response(new Uint8Array(chunk), {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
            "Content-Length": String(chunk.length),
          },
        });
      }
    }
  }

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Length": String(buffer.length),
    },
  });
}

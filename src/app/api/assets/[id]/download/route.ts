import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { getAssetById } from "@/lib/db/queries";
import { getUploadMimeType, readUpload } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function safeDownloadName(title: string, extension: string) {
  const clean = title
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
  return `${clean || "synapsepipe-asset"}.${extension}`;
}

function contentDisposition(name: string) {
  const ascii = name.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const asset = getAssetById(id);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  let extension = MIME_EXTENSIONS[asset.mimeType ?? ""] ?? "";
  let buffer: Buffer | null = null;

  if (asset.source === "upload" && asset.storageKey) {
    const local = await readUpload(asset.storageKey);
    if (local) {
      buffer = await fs.readFile(local.path);
      extension = extension || path.extname(local.path).slice(1);
    }
  } else if (asset.url.startsWith("/")) {
    const publicRoot = path.join(process.cwd(), "public");
    const target = path.resolve(publicRoot, `.${asset.url}`);
    if (target.startsWith(publicRoot)) {
      try {
        buffer = await fs.readFile(target);
      } catch {
        buffer = null;
      }
    }
    extension = extension || path.extname(asset.url).slice(1);
  }

  if (buffer) {
    const mimeType =
      asset.mimeType ||
      (extension === "svg" ? "image/svg+xml" : getUploadMimeType(`file.${extension}`));
    const filename = safeDownloadName(asset.title, extension || "bin");
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": contentDisposition(filename),
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  }

  if (!/^https?:\/\//i.test(asset.url)) {
    return NextResponse.json({ error: "Asset file unavailable" }, { status: 404 });
  }

  try {
    const upstream = await fetch(asset.url, {
      signal: AbortSignal.timeout(30_000),
      cache: "no-store",
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Upstream responded with ${upstream.status}` },
        { status: 502 },
      );
    }
    if (!extension) {
      const urlPath = new URL(asset.url).pathname;
      extension = path.extname(urlPath).slice(1) || "bin";
    }
    const filename = safeDownloadName(asset.title, extension);
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": contentDisposition(filename),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch remote asset" }, { status: 502 });
  }
}

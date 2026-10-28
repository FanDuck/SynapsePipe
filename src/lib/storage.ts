import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

import {
  ALLOWED_UPLOAD_TYPES,
  DATA_DIR,
  MAX_UPLOAD_BYTES,
  UPLOAD_DIR,
} from "@/lib/config";

export type SavedUpload = {
  storageKey: string;
  url: string;
  mimeType: string;
  type: "image" | "video";
  width: number | null;
  height: number | null;
};

export function ensureDataDirectories() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function saveUpload(file: File): Promise<SavedUpload> {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("请选择要上传的文件。");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("文件超过 30MB 限制，请压缩后重试。");
  }

  const allowed = ALLOWED_UPLOAD_TYPES[file.type];
  if (!allowed) {
    throw new Error("暂不支持该格式，请上传 PNG / JPG / WebP / GIF / AVIF / MP4 / WebM。");
  }

  ensureDataDirectories();
  const storageKey = `${crypto.randomUUID()}.${allowed.extension}`;
  const target = path.join(UPLOAD_DIR, storageKey);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fsp.writeFile(target, buffer);

  return {
    storageKey,
    url: `/api/uploads/${storageKey}`,
    mimeType: file.type,
    type: allowed.kind,
    width: null,
    height: null,
  };
}

export async function removeUpload(storageKey: string | null | undefined) {
  if (!storageKey) return;
  const safeName = path.basename(storageKey);
  const target = path.join(UPLOAD_DIR, safeName);
  if (!target.startsWith(UPLOAD_DIR)) return;
  try {
    await fsp.unlink(target);
  } catch {
    // File may already be gone; that is fine for deletion flows.
  }
}

export async function readUpload(storageKey: string) {
  const safeName = path.basename(storageKey);
  if (!safeName || safeName !== storageKey) return null;
  const target = path.join(UPLOAD_DIR, safeName);
  if (!target.startsWith(UPLOAD_DIR)) return null;
  try {
    const stat = await fsp.stat(target);
    if (!stat.isFile()) return null;
    return { path: target, size: stat.size, mtime: stat.mtime };
  } catch {
    return null;
  }
}

export function getLocalUploadPath(storageKey: string) {
  const safeName = path.basename(storageKey);
  if (!safeName || safeName !== storageKey) return null;
  const target = path.join(UPLOAD_DIR, safeName);
  if (!target.startsWith(UPLOAD_DIR)) return null;
  return target;
}

export function getUploadMimeType(filename: string) {
  const extension = path.extname(filename).slice(1).toLowerCase();
  const entry = Object.entries(ALLOWED_UPLOAD_TYPES).find(
    ([, value]) => value.extension === extension,
  );
  return entry?.[0] ?? "application/octet-stream";
}

export function getStorageBytesSync() {
  try {
    let total = 0;
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile()) total += fs.statSync(full).size;
      }
    };
    walk(DATA_DIR);
    return total;
  } catch {
    return 0;
  }
}

import "server-only";

import path from "node:path";

export const DATA_DIR = path.resolve(
  process.env.SYNAPSE_DATA_DIR?.trim() || path.join(process.cwd(), "data"),
);
export const DATABASE_PATH = path.join(DATA_DIR, "synapsepipe.db");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const SECRET_PATH = path.join(DATA_DIR, ".secret");

export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES: Record<string, { extension: string; kind: "image" | "video" }> =
  {
    "image/png": { extension: "png", kind: "image" },
    "image/jpeg": { extension: "jpg", kind: "image" },
    "image/webp": { extension: "webp", kind: "image" },
    "image/gif": { extension: "gif", kind: "image" },
    "image/avif": { extension: "avif", kind: "image" },
    "video/mp4": { extension: "mp4", kind: "video" },
    "video/webm": { extension: "webm", kind: "video" },
    "video/quicktime": { extension: "mov", kind: "video" },
  };

import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { DATA_DIR, SECRET_PATH } from "@/lib/config";

const PREFIX = "enc:v1:";
let cachedSecret: string | null = null;

function ensureSecret(): string {
  if (process.env.SYNAPSE_SECRET?.trim()) {
    return process.env.SYNAPSE_SECRET.trim();
  }

  if (cachedSecret) return cachedSecret;

  try {
    if (fs.existsSync(SECRET_PATH)) {
      cachedSecret = fs.readFileSync(SECRET_PATH, "utf8").trim();
      if (cachedSecret) return cachedSecret;
    }
  } catch {
    // Fall through and regenerate below.
  }

  const secret = crypto.randomBytes(32).toString("hex");
  try {
    fs.mkdirSync(path.dirname(SECRET_PATH), { recursive: true });
    fs.writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
  } catch {
    // A read-only container may prevent persistence; keep the process-local secret.
  }
  cachedSecret = secret;
  return secret;
}

function deriveKey() {
  const secret = ensureSecret();
  return crypto.scryptSync(secret, "synapsepipe:v1", 32);
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return "";
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSecret(ciphertext: string): string {
  if (!ciphertext || !ciphertext.startsWith(PREFIX)) return "";
  try {
    const [ivPart, tagPart, dataPart] = ciphertext.slice(PREFIX.length).split(":");
    if (!ivPart || !tagPart || !dataPart) return "";
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      deriveKey(),
      Buffer.from(ivPart, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64url")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return "";
  }
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createSeed() {
  return crypto.randomBytes(4).toString("hex");
}

export function getDataDirectory() {
  return DATA_DIR;
}

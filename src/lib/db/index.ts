import "server-only";

import fs from "node:fs";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { DATABASE_PATH, UPLOAD_DIR } from "@/lib/config";
import { ensureDataDirectories } from "@/lib/storage";

import * as schema from "./schema";
import { seedDatabase } from "./seed";

type SynapseDb = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as {
  __synapseSqlite?: Database.Database;
  __synapseDb?: SynapseDb;
  __synapseInitialized?: boolean;
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS prompts (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  prompt_zh text NOT NULL DEFAULT '',
  prompt_en text NOT NULL DEFAULT '',
  negative_prompt text NOT NULL DEFAULT '',
  style text NOT NULL DEFAULT 'cinematic',
  camera text NOT NULL DEFAULT 'wide-angle',
  model text NOT NULL DEFAULT 'midjourney',
  aspect_ratio text NOT NULL DEFAULT '16:9',
  stage text NOT NULL DEFAULT 'idea',
  tags text NOT NULL DEFAULT '[]',
  variables text NOT NULL DEFAULT '[]',
  shot_params text NOT NULL DEFAULT '{}',
  is_favorite integer NOT NULL DEFAULT 0,
  usage_count integer NOT NULL DEFAULT 0,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
CREATE INDEX IF NOT EXISTS prompts_style_idx ON prompts (style);
CREATE INDEX IF NOT EXISTS prompts_stage_idx ON prompts (stage);
CREATE INDEX IF NOT EXISTS prompts_updated_at_idx ON prompts (updated_at);
CREATE INDEX IF NOT EXISTS prompts_favorite_idx ON prompts (is_favorite);

CREATE TABLE IF NOT EXISTS assets (
  id text PRIMARY KEY NOT NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'image',
  source text NOT NULL DEFAULT 'url',
  url text NOT NULL,
  storage_key text,
  mime_type text,
  prompt_id text REFERENCES prompts(id) ON DELETE SET NULL,
  prompt_snapshot text NOT NULL DEFAULT '',
  seed text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'midjourney',
  category text NOT NULL DEFAULT 'abstract',
  tags text NOT NULL DEFAULT '[]',
  params text NOT NULL DEFAULT '{}',
  width integer,
  height integer,
  is_favorite integer NOT NULL DEFAULT 0,
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
CREATE INDEX IF NOT EXISTS assets_prompt_id_idx ON assets (prompt_id);
CREATE INDEX IF NOT EXISTS assets_created_at_idx ON assets (created_at);
CREATE INDEX IF NOT EXISTS assets_category_idx ON assets (category);
CREATE INDEX IF NOT EXISTS assets_favorite_idx ON assets (is_favorite);

CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY NOT NULL,
  llm_base_url text NOT NULL DEFAULT 'https://api.deepseek.com/v1',
  llm_api_key_cipher text NOT NULL DEFAULT '',
  llm_model text NOT NULL DEFAULT 'deepseek-chat',
  default_negative_prompt text NOT NULL DEFAULT '',
  default_language text NOT NULL DEFAULT 'bilingual',
  created_at integer NOT NULL,
  updated_at integer NOT NULL
);
`;

function initialize() {
  ensureDataDirectories();
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const sqlite = new Database(DATABASE_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.exec(SCHEMA_SQL);

  const db = drizzle(sqlite, { schema });
  seedDatabase(db);
  return { sqlite, db };
}

export function getDb(): SynapseDb {
  if (globalForDb.__synapseInitialized && globalForDb.__synapseDb) {
    return globalForDb.__synapseDb;
  }

  const { sqlite, db } = initialize();
  globalForDb.__synapseSqlite = sqlite;
  globalForDb.__synapseDb = db;
  globalForDb.__synapseInitialized = true;
  return db;
}

export function getSqlite() {
  getDb();
  return globalForDb.__synapseSqlite!;
}

export { schema };

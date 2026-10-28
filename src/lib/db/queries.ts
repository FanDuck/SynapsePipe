import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

import { APP_VERSION } from "@/lib/constants";
import { DATABASE_PATH } from "@/lib/config";
import { decryptSecret } from "@/lib/crypto";
import { getStorageBytesSync } from "@/lib/storage";
import type {
  Asset,
  DashboardStats,
  Prompt,
  Settings,
  SettingsView,
} from "@/lib/types";

import { getDb } from "./index";
import { assets, prompts, settings } from "./schema";

const DAY = 24 * 60 * 60 * 1000;

export function getPrompts(): Prompt[] {
  return getDb()
    .select()
    .from(prompts)
    .orderBy(desc(prompts.isFavorite), desc(prompts.updatedAt))
    .all();
}

export function getPromptById(id: string): Prompt | undefined {
  return getDb().select().from(prompts).where(eq(prompts.id, id)).get();
}

export function getAssets(): Asset[] {
  return getDb().select().from(assets).orderBy(desc(assets.createdAt)).all();
}

export function getAssetById(id: string): Asset | undefined {
  return getDb().select().from(assets).where(eq(assets.id, id)).get();
}

export function getSettingsRow(): Settings {
  const db = getDb();
  const existing = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (existing) return existing;

  const now = new Date();
  const inserted = {
    id: 1,
    llmBaseUrl: "https://api.deepseek.com/v1",
    llmApiKeyCipher: "",
    llmModel: "deepseek-chat",
    defaultNegativePrompt: "",
    defaultLanguage: "bilingual",
    createdAt: now,
    updatedAt: now,
  };
  db.insert(settings).values(inserted).run();
  return inserted;
}

export function getSettingsView(): SettingsView {
  const row = getSettingsRow();
  const db = getDb();
  const apiKey = decryptSecret(row.llmApiKeyCipher);
  const promptCount = db.select({ value: count() }).from(prompts).get()?.value ?? 0;
  const assetCount = db.select({ value: count() }).from(assets).get()?.value ?? 0;

  return {
    llmBaseUrl: row.llmBaseUrl,
    llmModel: row.llmModel,
    hasApiKey: Boolean(apiKey),
    maskedApiKey: apiKey ? `••••••••${apiKey.slice(-4)}` : "",
    defaultNegativePrompt: row.defaultNegativePrompt,
    defaultLanguage: row.defaultLanguage as SettingsView["defaultLanguage"],
    dataDir: DATABASE_PATH,
    databasePath: DATABASE_PATH,
    storageBytes: getStorageBytesSync(),
    promptCount,
    assetCount,
  };
}

export function getPromptCatalog() {
  return getDb()
    .select({
      id: prompts.id,
      title: prompts.title,
      promptZh: prompts.promptZh,
      promptEn: prompts.promptEn,
      negativePrompt: prompts.negativePrompt,
      model: prompts.model,
      style: prompts.style,
    })
    .from(prompts)
    .orderBy(desc(prompts.updatedAt))
    .all();
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  const promptCount = db.select({ value: count() }).from(prompts).get()?.value ?? 0;
  const assetCount = db.select({ value: count() }).from(assets).get()?.value ?? 0;
  const favoritePromptCount =
    db
      .select({ value: count() })
      .from(prompts)
      .where(eq(prompts.isFavorite, true))
      .get()?.value ?? 0;
  const favoriteAssetCount =
    db
      .select({ value: count() })
      .from(assets)
      .where(eq(assets.isFavorite, true))
      .get()?.value ?? 0;
  const totalUsage =
    db
      .select({ value: sql<number>`coalesce(sum(${prompts.usageCount}), 0)` })
      .from(prompts)
      .get()?.value ?? 0;

  const stageRows = db
    .select({ stage: prompts.stage, value: count() })
    .from(prompts)
    .groupBy(prompts.stage)
    .all();
  const typeRows = db
    .select({ type: assets.type, value: count() })
    .from(assets)
    .groupBy(assets.type)
    .all();

  const stageCounts: Record<string, number> = {};
  for (const row of stageRows) stageCounts[row.stage] = row.value;
  const typeCounts: Record<string, number> = {};
  for (const row of typeRows) typeCounts[row.type] = row.value;

  const recentAssets = db
    .select()
    .from(assets)
    .orderBy(desc(assets.createdAt))
    .limit(5)
    .all();
  const topPrompts = db
    .select()
    .from(prompts)
    .orderBy(desc(prompts.usageCount), desc(prompts.updatedAt))
    .limit(4)
    .all();

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setTime(start.getTime() - 6 * DAY);

  const promptDates = db
    .select({ createdAt: prompts.createdAt })
    .from(prompts)
    .where(sql`${prompts.createdAt} >= ${start.getTime()}`)
    .all();
  const assetDates = db
    .select({ createdAt: assets.createdAt })
    .from(assets)
    .where(sql`${assets.createdAt} >= ${start.getTime()}`)
    .all();

  const activity: DashboardStats["activity"] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + (6 - i));
    const key = formatDayKey(date);
    const promptsOnDay = promptDates.filter(
      (row) => formatDayKey(row.createdAt) === key,
    ).length;
    const assetsOnDay = assetDates.filter(
      (row) => formatDayKey(row.createdAt) === key,
    ).length;
    activity.push({
      date: key,
      label: new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date),
      prompts: promptsOnDay,
      assets: assetsOnDay,
    });
  }

  return {
    promptCount,
    assetCount,
    favoriteCount: favoritePromptCount + favoriteAssetCount,
    totalUsage: Number(totalUsage),
    stageCounts,
    typeCounts,
    recentAssets,
    topPrompts,
    activity,
    storageBytes: getStorageBytesSync(),
  };
}

export function getShellData() {
  const db = getDb();
  const promptCount = db.select({ value: count() }).from(prompts).get()?.value ?? 0;
  const assetCount = db.select({ value: count() }).from(assets).get()?.value ?? 0;
  const favoritePromptCount =
    db
      .select({ value: count() })
      .from(prompts)
      .where(eq(prompts.isFavorite, true))
      .get()?.value ?? 0;
  const favoriteAssetCount =
    db
      .select({ value: count() })
      .from(assets)
      .where(eq(assets.isFavorite, true))
      .get()?.value ?? 0;

  return {
    promptCount,
    assetCount,
    favoriteCount: favoritePromptCount + favoriteAssetCount,
    storageBytes: getStorageBytesSync(),
    version: APP_VERSION,
  };
}

export function getSearchCatalog() {
  return getDb()
    .select({
      id: prompts.id,
      title: prompts.title,
      description: prompts.description,
      style: prompts.style,
      model: prompts.model,
    })
    .from(prompts)
    .orderBy(desc(prompts.updatedAt))
    .limit(24)
    .all();
}

export function getStorageStats() {
  const db = getDb();
  const promptCount = db.select({ value: count() }).from(prompts).get()?.value ?? 0;
  const assetCount = db.select({ value: count() }).from(assets).get()?.value ?? 0;
  return {
    promptCount,
    assetCount,
    storageBytes: getStorageBytesSync(),
    version: APP_VERSION,
  };
}

export function getBackupPayload() {
  const db = getDb();
  const row = getSettingsRow();
  return {
    app: "SynapsePipe",
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    prompts: db.select().from(prompts).all(),
    assets: db.select().from(assets).all(),
    settings: {
      llmBaseUrl: row.llmBaseUrl,
      llmModel: row.llmModel,
      defaultNegativePrompt: row.defaultNegativePrompt,
      defaultLanguage: row.defaultLanguage,
    },
  };
}

function formatDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

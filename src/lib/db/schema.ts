import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { ShotParams } from "@/lib/types";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
};

export const prompts = sqliteTable(
  "prompts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    promptZh: text("prompt_zh").notNull().default(""),
    promptEn: text("prompt_en").notNull().default(""),
    negativePrompt: text("negative_prompt").notNull().default(""),
    style: text("style").notNull().default("cinematic"),
    camera: text("camera").notNull().default("wide-angle"),
    model: text("model").notNull().default("midjourney"),
    aspectRatio: text("aspect_ratio").notNull().default("16:9"),
    stage: text("stage").notNull().default("idea"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    variables: text("variables", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    shotParams: text("shot_params", { mode: "json" })
      .$type<ShotParams>()
      .notNull()
      .default(sql`'{}'`),
    isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
    usageCount: integer("usage_count").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("prompts_style_idx").on(table.style),
    index("prompts_stage_idx").on(table.stage),
    index("prompts_updated_at_idx").on(table.updatedAt),
    index("prompts_favorite_idx").on(table.isFavorite),
  ],
);

export const assets = sqliteTable(
  "assets",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    type: text("type").notNull().default("image"),
    source: text("source").notNull().default("url"),
    url: text("url").notNull(),
    storageKey: text("storage_key"),
    mimeType: text("mime_type"),
    promptId: text("prompt_id").references(() => prompts.id, { onDelete: "set null" }),
    promptSnapshot: text("prompt_snapshot").notNull().default(""),
    seed: text("seed").notNull().default(""),
    model: text("model").notNull().default("midjourney"),
    category: text("category").notNull().default("abstract"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    params: text("params", { mode: "json" })
      .$type<Record<string, string | number>>()
      .notNull()
      .default(sql`'{}'`),
    width: integer("width"),
    height: integer("height"),
    isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("assets_prompt_id_idx").on(table.promptId),
    index("assets_created_at_idx").on(table.createdAt),
    index("assets_category_idx").on(table.category),
    index("assets_favorite_idx").on(table.isFavorite),
  ],
);

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  llmBaseUrl: text("llm_base_url").notNull().default("https://api.deepseek.com/v1"),
  llmApiKeyCipher: text("llm_api_key_cipher").notNull().default(""),
  llmModel: text("llm_model").notNull().default("deepseek-chat"),
  defaultNegativePrompt: text("default_negative_prompt").notNull().default(""),
  defaultLanguage: text("default_language").notNull().default("bilingual"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const promptsRelations = relations(prompts, ({ many }) => ({
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  prompt: one(prompts, {
    fields: [assets.promptId],
    references: [prompts.id],
  }),
}));

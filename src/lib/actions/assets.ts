"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

import { createId } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { getAssetById, getPromptById } from "@/lib/db/queries";
import { assets } from "@/lib/db/schema";
import { removeUpload, saveUpload } from "@/lib/storage";
import type { ActionResult, Asset, AssetInput } from "@/lib/types";
import { parseTags } from "@/lib/utils";
import { assetInputSchema, assetUpdateSchema } from "@/lib/validations";

function fail(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return {
      ok: false,
      error: error.issues[0]?.message ?? "请检查输入内容。",
      fieldErrors,
    };
  }
  return {
    ok: false,
    error: error instanceof Error ? error.message : "操作失败，请稍后重试。",
  };
}

function revalidateEverything() {
  revalidatePath("/", "layout");
}

function normalizeRemoteUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) return trimmed;
  return trimmed;
}

function inferPromptSnapshot(promptId: string | null | undefined, fallback = "") {
  if (!promptId) return fallback;
  const prompt = getPromptById(promptId);
  if (!prompt) return fallback;
  return prompt.promptZh || prompt.promptEn || fallback;
}

export async function createRemoteAsset(input: AssetInput): Promise<ActionResult<Asset>> {
  try {
    const data = assetInputSchema.parse({
      ...input,
      source: "url",
      url: normalizeRemoteUrl(input.url),
    });
    const now = new Date();
    const promptSnapshot =
      data.promptSnapshot || inferPromptSnapshot(data.promptId ?? null, data.promptSnapshot);

    const row: Asset = {
      id: createId("asset"),
      title: data.title,
      type: data.type,
      source: "url",
      url: data.url,
      storageKey: null,
      mimeType: null,
      promptId: data.promptId || null,
      promptSnapshot,
      seed: data.seed,
      model: data.model,
      category: data.category,
      tags: Array.from(new Set(data.tags)),
      params: data.params,
      width: data.width ?? null,
      height: data.height ?? null,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };

    getDb().insert(assets).values(row).run();
    revalidateEverything();
    return { ok: true, data: row };
  } catch (error) {
    return fail(error);
  }
}

export async function uploadAsset(formData: FormData): Promise<ActionResult<Asset>> {
  let storageKey: string | null = null;
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "请选择要上传的文件。" };
    }

    const saved = await saveUpload(file);
    storageKey = saved.storageKey;

    const rawPromptId = String(formData.get("promptId") ?? "").trim() || null;
    const rawTags = String(formData.get("tags") ?? "");
    const tags = parseTags(rawTags);
    const titleInput = String(formData.get("title") ?? "").trim();
    const title =
      titleInput ||
      file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120) ||
      "未命名资产";

    const promptSnapshot =
      String(formData.get("promptSnapshot") ?? "").trim() ||
      inferPromptSnapshot(rawPromptId);

    const data = assetInputSchema.parse({
      title,
      type: saved.type,
      source: "upload",
      url: saved.url,
      storageKey: saved.storageKey,
      mimeType: saved.mimeType,
      promptId: rawPromptId,
      promptSnapshot,
      seed: String(formData.get("seed") ?? "").trim(),
      model: String(formData.get("model") ?? "midjourney"),
      category: String(formData.get("category") ?? "abstract"),
      tags,
      params: {},
      width: null,
      height: null,
    });

    const now = new Date();
    const row: Asset = {
      id: createId("asset"),
      title: data.title,
      type: data.type,
      source: "upload",
      url: data.url,
      storageKey: data.storageKey ?? null,
      mimeType: data.mimeType ?? null,
      promptId: data.promptId || null,
      promptSnapshot: data.promptSnapshot,
      seed: data.seed,
      model: data.model,
      category: data.category,
      tags: Array.from(new Set(data.tags)),
      params: {},
      width: saved.width,
      height: saved.height,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };

    getDb().insert(assets).values(row).run();
    revalidateEverything();
    return { ok: true, data: row };
  } catch (error) {
    if (storageKey) await removeUpload(storageKey);
    return fail(error);
  }
}

export async function updateAsset(
  id: string,
  input: Partial<AssetInput>,
): Promise<ActionResult<Asset>> {
  try {
    const existing = getAssetById(id);
    if (!existing) return { ok: false, error: "该资产不存在或已被删除。" };

    const parsed = assetUpdateSchema.parse({ ...existing, ...input, id });
    const promptSnapshot =
      parsed.promptSnapshot ||
      inferPromptSnapshot(parsed.promptId ?? null, existing.promptSnapshot);

    const row: Asset = {
      ...existing,
      title: parsed.title ?? existing.title,
      type: (parsed.type ?? existing.type) as Asset["type"],
      source: (parsed.source ?? existing.source) as Asset["source"],
      url: parsed.url ?? existing.url,
      promptId: parsed.promptId === undefined ? existing.promptId : parsed.promptId,
      promptSnapshot,
      seed: parsed.seed ?? existing.seed,
      model: parsed.model ?? existing.model,
      category: parsed.category ?? existing.category,
      tags: parsed.tags ? Array.from(new Set(parsed.tags)) : existing.tags,
      isFavorite: existing.isFavorite,
      updatedAt: new Date(),
    };

    getDb()
      .update(assets)
      .set({
        title: row.title,
        promptId: row.promptId,
        promptSnapshot: row.promptSnapshot,
        seed: row.seed,
        model: row.model,
        category: row.category,
        tags: row.tags,
        updatedAt: row.updatedAt,
      })
      .where(eq(assets.id, id))
      .run();

    revalidateEverything();
    return { ok: true, data: row };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleAssetFavorite(
  id: string,
): Promise<ActionResult<{ id: string; isFavorite: boolean }>> {
  try {
    const existing = getAssetById(id);
    if (!existing) return { ok: false, error: "该资产不存在。" };
    const isFavorite = !existing.isFavorite;
    getDb()
      .update(assets)
      .set({ isFavorite, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .run();
    revalidateEverything();
    return { ok: true, data: { id, isFavorite } };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteAsset(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const existing = getAssetById(id);
    if (!existing) return { ok: false, error: "该资产不存在。" };
    getDb().delete(assets).where(eq(assets.id, id)).run();
    if (existing.source === "upload") {
      await removeUpload(existing.storageKey);
    }
    revalidateEverything();
    return { ok: true, data: { id } };
  } catch (error) {
    return fail(error);
  }
}

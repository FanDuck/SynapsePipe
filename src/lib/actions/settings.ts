"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

import {
  AIError,
  getProviderFromSettings,
  testProviderConnection,
} from "@/lib/ai";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { getSettingsRow } from "@/lib/db/queries";
import { settings } from "@/lib/db/schema";
import type { ActionResult, SettingsView } from "@/lib/types";
import { settingsInputSchema } from "@/lib/validations";

function fail(error: unknown): ActionResult<never> {
  if (error instanceof ZodError) {
    return {
      ok: false,
      error: error.issues[0]?.message ?? "请检查设置内容。",
      fieldErrors: {
        form: error.issues.map((issue) => issue.message),
      },
    };
  }
  if (error instanceof AIError) {
    return { ok: false, error: error.message };
  }
  return {
    ok: false,
    error: error instanceof Error ? error.message : "操作失败，请稍后重试。",
  };
}

export async function saveSettings(input: {
  llmBaseUrl: string;
  llmModel: string;
  llmApiKey?: string;
  defaultNegativePrompt: string;
  defaultLanguage: "zh" | "en" | "bilingual";
}): Promise<ActionResult<{ updated: true }>> {
  try {
    const data = settingsInputSchema.parse(input);
    const existing = getSettingsRow();
    const trimmedKey = data.llmApiKey?.trim() ?? "";
    const keyCipher =
      trimmedKey && !trimmedKey.includes("•••")
        ? encryptSecret(trimmedKey)
        : existing.llmApiKeyCipher;

    getDb()
      .update(settings)
      .set({
        llmBaseUrl: data.llmBaseUrl.replace(/\/+$/, ""),
        llmModel: data.llmModel,
        llmApiKeyCipher: keyCipher,
        defaultNegativePrompt: data.defaultNegativePrompt,
        defaultLanguage: data.defaultLanguage,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, 1))
      .run();

    revalidatePath("/", "layout");
    return { ok: true, data: { updated: true } };
  } catch (error) {
    return fail(error);
  }
}

export async function clearApiKey(): Promise<ActionResult<{ cleared: true }>> {
  try {
    getDb()
      .update(settings)
      .set({ llmApiKeyCipher: "", updatedAt: new Date() })
      .where(eq(settings.id, 1))
      .run();
    revalidatePath("/", "layout");
    return { ok: true, data: { cleared: true } };
  } catch (error) {
    return fail(error);
  }
}

export async function testConnection(input: {
  llmBaseUrl: string;
  llmModel: string;
  llmApiKey?: string;
}): Promise<ActionResult<{ latencyMs: number; model: string; reply: string }>> {
  try {
    const baseUrl = input.llmBaseUrl.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(baseUrl)) {
      return { ok: false, error: "Base URL 必须以 http:// 或 https:// 开头。" };
    }
    const existing = getSettingsRow();
    const inputKey = input.llmApiKey?.trim() ?? "";
    const apiKey =
      inputKey && !inputKey.includes("•••")
        ? inputKey
        : decryptSecret(existing.llmApiKeyCipher);

    const result = await testProviderConnection({
      baseUrl,
      model: input.llmModel.trim(),
      apiKey,
    });
    return { ok: true, data: result };
  } catch (error) {
    return fail(error);
  }
}

export async function getSettingsForForm(): Promise<SettingsView> {
  // Kept for client-side refresh flows; the settings page normally queries the DB directly.
  const { getSettingsView } = await import("@/lib/db/queries");
  return getSettingsView();
}

export async function getProviderStatus(): Promise<{
  configured: boolean;
  baseUrl: string;
  model: string;
}> {
  const config = getProviderFromSettings();
  return {
    configured: Boolean(config.apiKey) || /localhost|127\.0\.0\.1/.test(config.baseUrl),
    baseUrl: config.baseUrl,
    model: config.model,
  };
}

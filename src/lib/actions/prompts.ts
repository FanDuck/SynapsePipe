"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { AIError } from "@/lib/ai";
import { createId } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { getPromptById } from "@/lib/db/queries";
import { prompts } from "@/lib/db/schema";
import type { ActionResult, Prompt, PromptInput } from "@/lib/types";
import { extractVariables } from "@/lib/utils";
import { promptInputSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

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
  if (error instanceof AIError) {
    return { ok: false, error: error.message };
  }
  return {
    ok: false,
    error: error instanceof Error ? error.message : "操作失败，请稍后重试。",
  };
}

function revalidateEverything() {
  revalidatePath("/", "layout");
}

export async function createPrompt(input: PromptInput): Promise<ActionResult<Prompt>> {
  try {
    const data = promptInputSchema.parse(input);
    const now = new Date();
    const id = createId("prompt");
    const variables = extractVariables(`${data.promptZh}\n${data.promptEn}`);

    const row: Prompt = {
      id,
      title: data.title,
      description: data.description,
      promptZh: data.promptZh,
      promptEn: data.promptEn,
      negativePrompt: data.negativePrompt,
      style: data.style,
      camera: data.camera,
      model: data.model,
      aspectRatio: data.aspectRatio,
      stage: data.stage,
      tags: Array.from(new Set(data.tags)),
      variables,
      shotParams: data.shotParams,
      isFavorite: false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    getDb().insert(prompts).values(row).run();
    revalidateEverything();
    return { ok: true, data: row };
  } catch (error) {
    return fail(error);
  }
}

export async function updatePrompt(
  id: string,
  input: PromptInput,
): Promise<ActionResult<Prompt>> {
  try {
    if (!id) return { ok: false, error: "缺少 Prompt ID。" };
    const existing = getPromptById(id);
    if (!existing) return { ok: false, error: "该 Prompt 不存在或已被删除。" };

    const data = promptInputSchema.parse(input);
    const variables = extractVariables(`${data.promptZh}\n${data.promptEn}`);
    const now = new Date();
    const row = {
      ...data,
      tags: Array.from(new Set(data.tags)),
      variables,
      updatedAt: now,
    };

    getDb().update(prompts).set(row).where(eq(prompts.id, id)).run();
    revalidateEverything();
    return { ok: true, data: { ...existing, ...row } };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePrompt(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    if (!id) return { ok: false, error: "缺少 Prompt ID。" };
    const existing = getPromptById(id);
    if (!existing) return { ok: false, error: "该 Prompt 不存在。" };
    getDb().delete(prompts).where(eq(prompts.id, id)).run();
    revalidateEverything();
    return { ok: true, data: { id } };
  } catch (error) {
    return fail(error);
  }
}

export async function togglePromptFavorite(
  id: string,
): Promise<ActionResult<{ id: string; isFavorite: boolean }>> {
  try {
    const existing = getPromptById(id);
    if (!existing) return { ok: false, error: "该 Prompt 不存在。" };
    const isFavorite = !existing.isFavorite;
    getDb()
      .update(prompts)
      .set({ isFavorite, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .run();
    revalidateEverything();
    return { ok: true, data: { id, isFavorite } };
  } catch (error) {
    return fail(error);
  }
}

export async function setPromptStage(
  id: string,
  stage: string,
): Promise<ActionResult<{ id: string; stage: string }>> {
  try {
    if (!["idea", "crafting", "ready"].includes(stage)) {
      return { ok: false, error: "无效的看板阶段。" };
    }
    const existing = getPromptById(id);
    if (!existing) return { ok: false, error: "该 Prompt 不存在。" };
    getDb()
      .update(prompts)
      .set({ stage, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .run();
    revalidateEverything();
    return { ok: true, data: { id, stage } };
  } catch (error) {
    return fail(error);
  }
}

export async function recordPromptUsage(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const existing = getPromptById(id);
    if (!existing) return { ok: false, error: "该 Prompt 不存在。" };
    getDb()
      .update(prompts)
      .set({ usageCount: existing.usageCount + 1 })
      .where(eq(prompts.id, id))
      .run();
    revalidatePath("/");
    return { ok: true, data: { id } };
  } catch (error) {
    return fail(error);
  }
}

export async function duplicatePrompt(id: string): Promise<ActionResult<Prompt>> {
  try {
    const existing = getPromptById(id);
    if (!existing) return { ok: false, error: "该 Prompt 不存在。" };
    const now = new Date();
    const copy: Prompt = {
      ...existing,
      id: createId("prompt"),
      title: `${existing.title} · 副本`,
      isFavorite: false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    getDb().insert(prompts).values(copy).run();
    revalidateEverything();
    return { ok: true, data: copy };
  } catch (error) {
    return fail(error);
  }
}

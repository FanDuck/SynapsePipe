"use server";

import { AIError, expandPromptWithAI } from "@/lib/ai";
import type { ActionResult, GeneratedPrompt } from "@/lib/types";
import { generateInputSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function generatePrompt(input: {
  inspiration: string;
  style?: string;
  model?: string;
  language: "zh" | "en" | "bilingual";
  creativity: number;
  negativeHint?: string;
}): Promise<ActionResult<GeneratedPrompt>> {
  try {
    const data = generateInputSchema.parse(input);
    const result = await expandPromptWithAI(data);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "请检查输入内容。",
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
      error: error instanceof Error ? error.message : "生成失败，请稍后重试。",
    };
  }
}

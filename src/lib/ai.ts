import "server-only";

import { z } from "zod";

import {
  ASPECT_RATIO_OPTIONS,
  CAMERA_VALUES,
  MODEL_VALUES,
  STYLE_VALUES,
} from "@/lib/constants";
import { decryptSecret } from "@/lib/crypto";
import { getSettingsRow } from "@/lib/db/queries";
import type { GeneratedPrompt } from "@/lib/types";
import { extractVariables } from "@/lib/utils";
import { generatedPromptSchema, shotParamsSchema } from "@/lib/validations";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ProviderConfig = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

export class AIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AIError";
    this.status = status;
  }
}

export function isLocalEndpoint(baseUrl: string) {
  try {
    const host = new URL(baseUrl).hostname;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".local")
    );
  } catch {
    return false;
  }
}

export function resolveEndpoint(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/v1$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  return `${trimmed}/chat/completions`;
}

function friendlyStatusError(status: number, raw: string) {
  if (status === 401 || status === 403) {
    return new AIError("API Key 无效或没有访问权限，请在设置中检查凭据。", status);
  }
  if (status === 404) {
    return new AIError(
      "接口返回 404：请检查 Base URL 是否包含正确的 /v1 路径，以及模型名称是否存在。",
      status,
    );
  }
  if (status === 429) {
    return new AIError("请求过于频繁或额度不足，请稍后再试或检查账户余额。", status);
  }
  if (status >= 500) {
    return new AIError("模型服务暂时不可用，请稍后重试。", status);
  }
  const snippet = raw.replace(/\s+/g, " ").slice(0, 240);
  return new AIError(snippet || `模型服务返回错误（HTTP ${status}）。`, status);
}

async function requestChat(
  config: ProviderConfig,
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    timeoutMs?: number;
  } = {},
) {
  const endpoint = resolveEndpoint(config.baseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 120_000);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.apiKey) {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }

    const body: Record<string, unknown> = {
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2400,
      stream: false,
    };
    if (options.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      throw friendlyStatusError(response.status, raw);
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string | null } }[];
      error?: { message?: string };
    };

    if (payload.error?.message) {
      throw new AIError(payload.error.message);
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new AIError("模型返回了空内容，请重试或更换模型。");
    }
    return content;
  } catch (error) {
    if (error instanceof AIError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIError("请求超时。请检查网络或模型服务是否可访问。");
    }
    throw new AIError(
      error instanceof Error
        ? `无法连接到模型服务：${error.message}`
        : "无法连接到模型服务。",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function getProviderFromSettings(): ProviderConfig {
  const row = getSettingsRow();
  return {
    baseUrl: row.llmBaseUrl,
    model: row.llmModel,
    apiKey: decryptSecret(row.llmApiKeyCipher),
  };
}

export function assertProviderReady(config: ProviderConfig) {
  if (!config.baseUrl) {
    throw new AIError("请先在设置中配置 API Base URL。");
  }
  if (!config.apiKey && !isLocalEndpoint(config.baseUrl)) {
    throw new AIError("尚未配置 API Key。请前往「设置 → 模型服务」填写你的密钥。");
  }
  if (!config.model) {
    throw new AIError("尚未配置模型名称。请前往设置选择模型。");
  }
}

const SYSTEM_PROMPT = `You are Craft, the master prompt director inside SynapsePipe — a local-first AIGC creative workbench.
Your job: transform a rough idea into production-grade, reusable prompts for image and video generation models.

Return STRICT JSON only, with this exact shape:
{
  "title": "A poetic Chinese title, max 20 Chinese characters",
  "description": "One concrete Chinese sentence describing the visual concept",
  "promptZh": "Master-level Chinese prompt, 150-280 Chinese characters. Include subject, environment, composition, lighting, lens, color palette, material, atmosphere. Use 1-3 reusable [变量] placeholders only when genuinely useful.",
  "promptEn": "Master-level English prompt, 90-170 words. Cinematic and specific; include camera, lighting, lens, palette, texture, atmosphere. Mirror the Chinese prompt and the same [variables].",
  "negativePrompt": "Comma-separated negative prompt in English",
  "style": "one of: cinematic, realistic, cyberpunk, anime, 3d, illustration, photography, fantasy, minimal",
  "camera": "one of: wide-angle, close-up, macro, aerial, low-angle, dutch-angle, portrait, tracking, static",
  "model": "one of: midjourney, flux, sdxl, runway, kling, sora, veo, other",
  "aspectRatio": "one of: 16:9, 21:9, 4:3, 1:1, 3:4, 9:16",
  "tags": ["3-6 concise Chinese tags"],
  "variables": ["each bracketed variable name without brackets"],
  "shotParams": {
    "focalLength": "e.g. 35mm anamorphic",
    "aperture": "e.g. T2.3 / f/1.8",
    "lighting": "specific lighting setup, in Chinese",
    "composition": "specific composition strategy, in Chinese",
    "mood": "emotional temperature, in Chinese"
  },
  "directorNotes": "2-3 Chinese sentences of directing notes: why these choices work, and one idea to iterate."
}

Hard rules:
- Never invent camera brands, artist names, or copyrighted characters. Describe visual language instead.
- No markdown, no code fences, no commentary outside JSON.
- Variables must actually appear inside both promptZh and promptEn as [name].
- Prefer concrete visual nouns over vague adjectives. Avoid "masterpiece, best quality" filler.
- Chinese prompts should read naturally, not translated word-by-word.
- If the idea is for video, add restrained motion cues (camera move, subject motion) without promising unsupported formats.`;

export async function expandPromptWithAI(input: {
  inspiration: string;
  style?: string;
  model?: string;
  language: "zh" | "en" | "bilingual";
  creativity: number;
  negativeHint?: string;
}): Promise<GeneratedPrompt> {
  const config = getProviderFromSettings();
  assertProviderReady(config);

  const settings = getSettingsRow();
  const styleHint = input.style
    ? `Preferred visual style: ${input.style}.`
    : "Choose the most fitting visual style.";
  const modelHint = input.model
    ? `Target generation model: ${input.model}.`
    : "Choose the most fitting target model.";
  const languageHint =
    input.language === "zh"
      ? "The user prefers Chinese; still fill both promptZh and promptEn, but make Chinese the primary reading experience."
      : input.language === "en"
        ? "The user prefers English; still fill both promptZh and promptEn, but make English the primary reading experience."
        : "Provide a balanced bilingual result.";

  const userPrompt = `Rough idea from the creator:
"""
${input.inspiration}
"""

Direction:
- ${styleHint}
- ${modelHint}
- ${languageHint}
- Creative temperature: ${input.creativity.toFixed(2)} (higher = more unexpected, lower = more controlled).
- Default negative inspiration: ${input.negativeHint || settings.defaultNegativePrompt || "none"}
- Output language for descriptive fields: Chinese; prompts must be bilingual.
- Keep the prompt directly usable and visually specific.
Return only the JSON object.`;

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  let raw: string;
  try {
    raw = await requestChat(config, messages, {
      temperature: 0.35 + input.creativity * 0.55,
      maxTokens: 2600,
      jsonMode: true,
    });
  } catch (error) {
    if (error instanceof AIError && error.status === 400) {
      raw = await requestChat(config, messages, {
        temperature: 0.35 + input.creativity * 0.55,
        maxTokens: 2600,
        jsonMode: false,
      });
    } else {
      throw error;
    }
  }

  const parsed = parseGeneratedJson(raw);
  const variables = Array.from(
    new Set([
      ...parsed.variables,
      ...extractVariables(parsed.promptZh),
      ...extractVariables(parsed.promptEn),
    ]),
  ).filter((value) => value.length <= 48);

  return {
    ...parsed,
    style: STYLE_VALUES.includes(parsed.style as (typeof STYLE_VALUES)[number])
      ? parsed.style
      : input.style && STYLE_VALUES.includes(input.style as (typeof STYLE_VALUES)[number])
        ? input.style
        : "cinematic",
    camera: CAMERA_VALUES.includes(parsed.camera as (typeof CAMERA_VALUES)[number])
      ? parsed.camera
      : "wide-angle",
    model: MODEL_VALUES.includes(parsed.model as (typeof MODEL_VALUES)[number])
      ? parsed.model
      : input.model && MODEL_VALUES.includes(input.model as (typeof MODEL_VALUES)[number])
        ? input.model
        : "midjourney",
    aspectRatio: ASPECT_RATIO_OPTIONS.some((option) => option.value === parsed.aspectRatio)
      ? parsed.aspectRatio
      : "16:9",
    variables,
  };
}

function parseGeneratedJson(raw: string): GeneratedPrompt {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new AIError("模型返回的内容不是有效 JSON，请重试一次。");
  }

  let json: unknown;
  try {
    json = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new AIError("模型返回的 JSON 无法解析，请重试一次。");
  }

  const loose = z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      promptZh: z.string().optional(),
      promptEn: z.string().optional(),
      negativePrompt: z.string().optional(),
      style: z.string().optional(),
      camera: z.string().optional(),
      model: z.string().optional(),
      aspectRatio: z.string().optional(),
      tags: z.array(z.string()).optional(),
      variables: z.array(z.string()).optional(),
      shotParams: z.record(z.string(), z.string()).optional(),
      directorNotes: z.string().optional(),
    })
    .safeParse(json);

  if (!loose.success) {
    throw new AIError("模型返回的字段格式不符合预期，请重试一次。");
  }

  const data = loose.data;
  if (!data.promptZh && !data.promptEn) {
    throw new AIError("模型没有返回可用的 Prompt，请重试一次。");
  }

  const normalized = {
    title: data.title?.trim().slice(0, 120) || "未命名创意",
    description: data.description?.trim().slice(0, 500) || "",
    promptZh: data.promptZh?.trim() || data.promptEn?.trim() || "",
    promptEn: data.promptEn?.trim() || data.promptZh?.trim() || "",
    negativePrompt: data.negativePrompt?.trim() || "",
    style: data.style?.trim() || "cinematic",
    camera: data.camera?.trim() || "wide-angle",
    model: data.model?.trim() || "midjourney",
    aspectRatio: data.aspectRatio?.trim() || "16:9",
    tags: (data.tags ?? []).map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
    variables: (data.variables ?? [])
      .map((variable) => variable.replace(/^\[|\]$/g, "").trim())
      .filter(Boolean)
      .slice(0, 12),
    shotParams: shotParamsSchema.catch({
      focalLength: "",
      aperture: "",
      lighting: "",
      composition: "",
      mood: "",
    }).parse(data.shotParams ?? {}),
    directorNotes: data.directorNotes?.trim() || "",
  };

  return generatedPromptSchema.parse(normalized);
}

export async function testProviderConnection(config: ProviderConfig) {
  assertProviderReady(config);
  const startedAt = Date.now();
  const content = await requestChat(
    config,
    [
      {
        role: "user",
        content: "Reply with exactly the word OK and nothing else.",
      },
    ],
    { maxTokens: 8, temperature: 0, timeoutMs: 45_000 },
  );
  return {
    latencyMs: Date.now() - startedAt,
    model: config.model,
    reply: content.trim().slice(0, 80),
  };
}

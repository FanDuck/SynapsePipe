import { z } from "zod";

import {
  ASPECT_RATIO_OPTIONS,
  CAMERA_VALUES,
  CATEGORY_VALUES,
  MODEL_VALUES,
  STAGE_VALUES,
  STYLE_VALUES,
} from "@/lib/constants";

const aspectRatios = ASPECT_RATIO_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];

export const shotParamsSchema = z.object({
  focalLength: z.string().trim().max(80).default(""),
  aperture: z.string().trim().max(80).default(""),
  lighting: z.string().trim().max(160).default(""),
  composition: z.string().trim().max(160).default(""),
  mood: z.string().trim().max(160).default(""),
});

export const promptInputSchema = z
  .object({
    title: z.string().trim().min(1, "请填写标题").max(120, "标题请控制在 120 字内"),
    description: z.string().trim().max(320, "摘要请控制在 320 字内").default(""),
    promptZh: z.string().trim().max(12000, "Prompt 过长").default(""),
    promptEn: z.string().trim().max(12000, "Prompt 过长").default(""),
    negativePrompt: z.string().trim().max(5000, "负向 Prompt 过长").default(""),
    style: z.enum(STYLE_VALUES),
    camera: z.enum(CAMERA_VALUES),
    model: z.enum(MODEL_VALUES),
    aspectRatio: z.enum(aspectRatios).default("16:9"),
    stage: z.enum(STAGE_VALUES),
    tags: z.array(z.string().trim().min(1).max(32)).max(16).default([]),
    shotParams: shotParamsSchema.default({
      focalLength: "",
      aperture: "",
      lighting: "",
      composition: "",
      mood: "",
    }),
  })
  .refine((data) => data.promptZh.length > 0 || data.promptEn.length > 0, {
    message: "请至少填写中文或英文 Prompt",
    path: ["promptZh"],
  });

export const assetInputSchema = z.object({
  title: z.string().trim().min(1, "请填写资产标题").max(120),
  type: z.enum(["image", "video"]),
  source: z.enum(["url", "upload"]),
  url: z
    .string()
    .trim()
    .min(1, "请填写素材地址")
    .refine((value) => /^(https?:\/\/|\/)/i.test(value), "请填写有效的 http(s) 地址"),
  storageKey: z.string().trim().max(200).nullable().optional(),
  mimeType: z.string().trim().max(120).nullable().optional(),
  promptId: z.string().trim().nullable().optional(),
  promptSnapshot: z.string().trim().max(16000).default(""),
  seed: z.string().trim().max(120).default(""),
  model: z.enum(MODEL_VALUES).default("midjourney"),
  category: z.enum(CATEGORY_VALUES).default("abstract"),
  tags: z.array(z.string().trim().min(1).max(32)).max(16).default([]),
  params: z.record(z.string(), z.union([z.string(), z.number()])).default({}),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

export const assetUpdateSchema = assetInputSchema.partial().extend({
  id: z.string().min(1),
});

export const settingsInputSchema = z.object({
  llmBaseUrl: z
    .string()
    .trim()
    .min(1, "请填写 API Base URL")
    .max(500)
    .refine((value) => /^https?:\/\//i.test(value), "Base URL 必须以 http:// 或 https:// 开头"),
  llmModel: z.string().trim().min(1, "请填写模型名称").max(160),
  llmApiKey: z.string().trim().max(500).optional(),
  defaultNegativePrompt: z.string().trim().max(4000).default(""),
  defaultLanguage: z.enum(["zh", "en", "bilingual"]).default("bilingual"),
});

export const generateInputSchema = z.object({
  inspiration: z
    .string()
    .trim()
    .min(4, "再多描述一点你的灵感（至少 4 个字）")
    .max(3000, "灵感描述请控制在 3000 字内"),
  style: z.enum(STYLE_VALUES).optional(),
  model: z.enum(MODEL_VALUES).optional(),
  language: z.enum(["zh", "en", "bilingual"]).default("bilingual"),
  creativity: z.number().min(0).max(1).default(0.7),
  negativeHint: z.string().trim().max(1000).optional(),
});

export const generatedPromptSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  promptZh: z.string().trim().min(1).max(12000),
  promptEn: z.string().trim().min(1).max(12000),
  negativePrompt: z.string().trim().max(5000).default(""),
  style: z.string().trim().default("cinematic"),
  camera: z.string().trim().default("wide-angle"),
  model: z.string().trim().default("midjourney"),
  aspectRatio: z.string().trim().default("16:9"),
  tags: z.array(z.string().trim().min(1).max(32)).max(16).default([]),
  variables: z.array(z.string().trim().min(1).max(48)).max(12).default([]),
  shotParams: shotParamsSchema,
  directorNotes: z.string().trim().max(1200).default(""),
});

export type PromptInputSchema = z.infer<typeof promptInputSchema>;
export type SettingsInputSchema = z.infer<typeof settingsInputSchema>;

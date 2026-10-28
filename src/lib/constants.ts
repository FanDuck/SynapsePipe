export const APP_NAME = "SynapsePipe";
export const APP_TAGLINE = "Next-gen Local-first AIGC Workbench & Creative Pipeline";
export const APP_DESCRIPTION =
  "一个本地优先的 AIGC 创意工作台：结构化 Prompt 库、AI 魔法扩写与可追溯的资产画廊，全部数据留在你自己的设备上。";
export const APP_VERSION = "1.0.1";
export const APP_REPO_URL = "https://github.com/FanDuck/SynapsePipe";

export type Option<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
};

export const STYLE_OPTIONS = [
  {
    value: "cinematic",
    label: "电影感",
    description: "宽银幕、体积光与叙事氛围",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  {
    value: "realistic",
    label: "写实",
    description: "照片级质感与自然光",
    badge: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-400",
  },
  {
    value: "cyberpunk",
    label: "赛博朋克",
    description: "霓虹、雨夜与高对比都市",
    badge: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-400",
  },
  {
    value: "anime",
    label: "动漫",
    description: "二次元线条与鲜明色彩",
    badge: "border-pink-500/25 bg-pink-500/10 text-pink-700 dark:text-pink-300",
    dot: "bg-pink-400",
  },
  {
    value: "3d",
    label: "3D 渲染",
    description: "材质、景深与产品级光影",
    badge: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    dot: "bg-violet-400",
  },
  {
    value: "illustration",
    label: "插画",
    description: "编辑感构图与手绘肌理",
    badge: "border-lime-500/25 bg-lime-500/10 text-lime-700 dark:text-lime-300",
    dot: "bg-lime-400",
  },
  {
    value: "photography",
    label: "摄影",
    description: "胶片颗粒与真实镜头语言",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
  {
    value: "fantasy",
    label: "奇幻",
    description: "史诗世界观与超现实场景",
    badge: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
    dot: "bg-fuchsia-400",
  },
  {
    value: "minimal",
    label: "极简",
    description: "留白、秩序与高级灰",
    badge: "border-zinc-500/25 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
] as const;

export const CAMERA_OPTIONS = [
  { value: "wide-angle", label: "广角", description: "24mm · 环境叙事" },
  { value: "close-up", label: "特写", description: "85mm · 情绪聚焦" },
  { value: "macro", label: "微距", description: "100mm · 材质细节" },
  { value: "aerial", label: "航拍", description: "俯视 · 宏大尺度" },
  { value: "low-angle", label: "低机位", description: "仰拍 · 力量感" },
  { value: "dutch-angle", label: "荷兰角", description: "倾斜 · 不安感" },
  { value: "portrait", label: "人像", description: "50mm · 自然透视" },
  { value: "tracking", label: "跟拍", description: "运动镜头 · 速度感" },
  { value: "static", label: "固定机位", description: "对称 · 秩序感" },
] as const;

export const MODEL_OPTIONS = [
  { value: "midjourney", label: "Midjourney", description: "图像 · 艺术表现力" },
  { value: "flux", label: "FLUX", description: "图像 · 语义理解" },
  { value: "sdxl", label: "SDXL", description: "图像 · 可控工作流" },
  { value: "runway", label: "Runway", description: "视频 · Gen-4" },
  { value: "kling", label: "Kling", description: "视频 · 可灵" },
  { value: "sora", label: "Sora", description: "视频 · OpenAI" },
  { value: "veo", label: "Veo", description: "视频 · Google" },
  { value: "other", label: "其他模型", description: "通用 Prompt" },
] as const;

export const STAGE_OPTIONS = [
  {
    value: "idea",
    label: "灵感收集",
    description: "尚未成型的原始想法",
    badge: "border-zinc-500/25 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
  {
    value: "crafting",
    label: "打磨中",
    description: "正在迭代参数与措辞",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  {
    value: "ready",
    label: "可出片",
    description: "验证过的高质量 Prompt",
    badge: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "character", label: "角色", description: "人物与生物设计" },
  { value: "environment", label: "场景", description: "世界观与环境概念" },
  { value: "product", label: "产品", description: "商业与产品视觉" },
  { value: "abstract", label: "抽象", description: "实验与视觉艺术" },
  { value: "interface", label: "界面", description: "UI / 视觉叙事" },
  { value: "motion", label: "动态", description: "视频与运动素材" },
] as const;

export const ASPECT_RATIO_OPTIONS = [
  { value: "16:9", label: "16:9 · 宽银幕" },
  { value: "21:9", label: "21:9 · 电影" },
  { value: "4:3", label: "4:3 · 经典" },
  { value: "1:1", label: "1:1 · 方形" },
  { value: "3:4", label: "3:4 · 竖幅" },
  { value: "9:16", label: "9:16 · 竖屏" },
] as const;

export const PROVIDER_PRESETS = [
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    note: "高性价比中文创意扩写",
  },
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
    note: "OpenAI 官方兼容接口",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4.1-mini",
    note: "统一路由多家模型",
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3",
    note: "国内加速 · 兼容 OpenAI",
  },
  {
    id: "ollama",
    name: "Ollama",
    baseUrl: "http://localhost:11434/v1",
    model: "qwen2.5:7b",
    note: "本地推理 · 数据不出机",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
    note: "本地 OpenAI 兼容服务",
  },
] as const;

export const INSPIRATION_EXAMPLES = [
  "雨夜的东京街头，一个穿透明雨衣的未来信使，霓虹倒映在积水里",
  "极简主义的月球温室，巨大玻璃穹顶内生长着银色植物",
  "一只由星云和旧钟表齿轮构成的机械鲸鱼，在深空中缓慢游动",
  "西北荒漠中的孤独加油站，黄昏，胶片颗粒，怀旧公路电影",
  "未来主义香水广告，黑曜石瓶身悬浮在液态金属之上",
] as const;

export const SORT_OPTIONS = [
  { value: "recent", label: "最近更新" },
  { value: "created", label: "创建时间" },
  { value: "usage", label: "使用次数" },
  { value: "alpha", label: "标题 A–Z" },
] as const;

export const ASSET_SORT_OPTIONS = [
  { value: "newest", label: "最新入库" },
  { value: "oldest", label: "最早入库" },
  { value: "favorite", label: "收藏优先" },
] as const;

export type StyleValue = (typeof STYLE_OPTIONS)[number]["value"];
export type CameraValue = (typeof CAMERA_OPTIONS)[number]["value"];
export type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];
export type StageValue = (typeof STAGE_OPTIONS)[number]["value"];
export type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

export const STYLE_VALUES = STYLE_OPTIONS.map((option) => option.value) as [
  StyleValue,
  ...StyleValue[],
];
export const CAMERA_VALUES = CAMERA_OPTIONS.map((option) => option.value) as [
  CameraValue,
  ...CameraValue[],
];
export const MODEL_VALUES = MODEL_OPTIONS.map((option) => option.value) as [
  ModelValue,
  ...ModelValue[],
];
export const STAGE_VALUES = STAGE_OPTIONS.map((option) => option.value) as [
  StageValue,
  ...StageValue[],
];
export const CATEGORY_VALUES = CATEGORY_OPTIONS.map((option) => option.value) as [
  CategoryValue,
  ...CategoryValue[],
];

export function getOptionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T | string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getStyle(value: string) {
  return STYLE_OPTIONS.find((option) => option.value === value) ?? STYLE_OPTIONS[0];
}

export function getStage(value: string) {
  return STAGE_OPTIONS.find((option) => option.value === value) ?? STAGE_OPTIONS[0];
}

export function getCategory(value: string) {
  return CATEGORY_OPTIONS.find((option) => option.value === value) ?? CATEGORY_OPTIONS[0];
}

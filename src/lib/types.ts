import type { assets, prompts, settings } from "@/lib/db/schema";

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type Settings = typeof settings.$inferSelect;

export type ShotParams = {
  focalLength: string;
  aperture: string;
  lighting: string;
  composition: string;
  mood: string;
};

export const EMPTY_SHOT_PARAMS: ShotParams = {
  focalLength: "",
  aperture: "",
  lighting: "",
  composition: "",
  mood: "",
};

export type PromptInput = {
  title: string;
  description: string;
  promptZh: string;
  promptEn: string;
  negativePrompt: string;
  style: string;
  camera: string;
  model: string;
  aspectRatio: string;
  stage: string;
  tags: string[];
  shotParams: ShotParams;
};

export type AssetInput = {
  title: string;
  type: "image" | "video";
  source: "url" | "upload";
  url: string;
  storageKey?: string | null;
  mimeType?: string | null;
  promptId?: string | null;
  promptSnapshot?: string;
  seed?: string;
  model?: string;
  category?: string;
  tags?: string[];
  params?: Record<string, string | number>;
  width?: number | null;
  height?: number | null;
};

export type AssetUploadInput = Omit<AssetInput, "url" | "source"> & {
  source?: "upload" | "url";
};

export type SettingsView = {
  llmBaseUrl: string;
  llmModel: string;
  hasApiKey: boolean;
  maskedApiKey: string;
  defaultNegativePrompt: string;
  defaultLanguage: "zh" | "en" | "bilingual";
  dataDir: string;
  databasePath: string;
  storageBytes: number;
  assetCount: number;
  promptCount: number;
};

export type GeneratedPrompt = {
  title: string;
  description: string;
  promptZh: string;
  promptEn: string;
  negativePrompt: string;
  style: string;
  camera: string;
  model: string;
  aspectRatio: string;
  tags: string[];
  variables: string[];
  shotParams: ShotParams;
  directorNotes: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export type DashboardStats = {
  promptCount: number;
  assetCount: number;
  favoriteCount: number;
  totalUsage: number;
  stageCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentAssets: Asset[];
  topPrompts: Prompt[];
  activity: { date: string; label: string; prompts: number; assets: number }[];
  storageBytes: number;
};

export type ShellData = {
  promptCount: number;
  assetCount: number;
  favoriteCount: number;
  storageBytes: number;
  version: string;
};

export type SearchPrompt = {
  id: string;
  title: string;
  description: string;
  style: string;
  model: string;
};

export type PromptCatalogItem = {
  id: string;
  title: string;
  promptZh: string;
  promptEn: string;
  negativePrompt: string;
  model: string;
  style: string;
};

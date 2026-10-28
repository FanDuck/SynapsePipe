"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Copy,
  Download,
  ExternalLink,
  Film,
  ImageIcon,
  Link2,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AssetMedia, VideoBadge } from "@/components/gallery/asset-media";
import { RelativeTime } from "@/components/shared/relative-time";
import { CopyButton } from "@/components/shared/copy-button";
import { TagPill } from "@/components/shared/tag-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCategory,
  getOptionLabel,
  MODEL_OPTIONS,
} from "@/lib/constants";
import type { Asset, PromptCatalogItem } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function buildRecipe(asset: Asset) {
  const lines = [
    `SynapsePipe · ${asset.title}`,
    `Model: ${asset.model}`,
    `Seed: ${asset.seed || "—"}`,
    `Category: ${asset.category}`,
    asset.params && Object.keys(asset.params).length > 0
      ? `Params: ${JSON.stringify(asset.params)}`
      : null,
    asset.promptSnapshot ? `\nPrompt:\n${asset.promptSnapshot}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function AssetDetailDialog({
  asset,
  open,
  onOpenChange,
  prompts,
  onToggleFavorite,
  onDelete,
}: {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: PromptCatalogItem[];
  onToggleFavorite: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}) {
  const [copying, setCopying] = React.useState(false);
  if (!asset) return null;

  const category = getCategory(asset.category);
  const linkedPrompt = asset.promptId
    ? prompts.find((prompt) => prompt.id === asset.promptId)
    : null;

  async function copyRecipe() {
    if (!asset) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(buildRecipe(asset));
      toast.success("生成配方已复制");
    } catch {
      toast.error("剪贴板不可用。");
    } finally {
      setCopying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] w-[calc(100%-1.5rem)] max-w-6xl overflow-hidden p-0 lg:max-h-[88vh]">
        <DialogTitle className="sr-only">{asset.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {asset.type === "video" ? "视频" : "图像"}资产详情、Prompt、Seed 与模型参数
        </DialogDescription>
        <div className="grid max-h-[94vh] grid-rows-[auto_1fr] overflow-y-auto lg:max-h-[88vh] lg:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.9fr)] lg:grid-rows-1 lg:overflow-hidden">
          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#18131f,#050507)] sm:min-h-[380px] lg:min-h-0">
            <div className="absolute inset-0">
              <AssetMedia asset={asset} fit="contain" controls={asset.type === "video"} priority />
            </div>
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
              <Badge className="border-white/15 bg-black/50 text-white backdrop-blur-md">
                {asset.type === "video" ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
                {asset.type === "video" ? "VIDEO" : "IMAGE"}
              </Badge>
              {asset.source === "upload" ? (
                <Badge className="border-white/15 bg-black/50 text-white/80 backdrop-blur-md">
                  LOCAL FILE
                </Badge>
              ) : null}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[9.5px] text-white/60">
              {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "原始尺寸未知"}
              <span>·</span>
              {asset.mimeType || "external media"}
            </div>
          </div>

          <div className="flex min-h-0 flex-col bg-popover/95">
            <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{category.label}</Badge>
                    <Badge variant="outline">{getOptionLabel(MODEL_OPTIONS, asset.model)}</Badge>
                    {asset.type === "video" ? <VideoBadge /> : null}
                  </div>
                  <h2 className="mt-3 text-[21px] font-semibold leading-tight tracking-[-0.03em]">
                    {asset.title}
                  </h2>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    收录于 {formatDate(asset.createdAt)} ·{" "}
                    <RelativeTime value={asset.createdAt} />
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={asset.isFavorite ? "text-amber-400" : "text-muted-foreground"}
                    onClick={() => onToggleFavorite(asset)}
                    aria-label="收藏"
                  >
                    <Star className={cn("size-4", asset.isFavorite && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(asset)}
                    aria-label="删除"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button variant="brand" asChild>
                  <a href={`/api/assets/${asset.id}/download`}>
                    <Download />
                    下载 / 重新导出
                  </a>
                </Button>
                <Button variant="outline" onClick={copyRecipe} disabled={copying}>
                  <Copy />
                  复制生成配方
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                    Seed
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-[11.5px]">
                    {asset.seed || "—"}
                    {asset.seed ? <CopyButton value={asset.seed} size="icon-xs" /> : null}
                  </div>
                </div>
                <div className="rounded-lg border border-border/70 bg-card/40 px-3 py-2.5">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                    Model
                  </div>
                  <div className="mt-1 truncate text-[11.5px]">
                    {getOptionLabel(MODEL_OPTIONS, asset.model)}
                  </div>
                </div>
                <div className="col-span-2 rounded-lg border border-border/70 bg-card/40 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground/60">
                      Generation params
                    </div>
                    <span className="font-mono text-[9px] text-muted-foreground/50">
                      {Object.keys(asset.params ?? {}).length} keys
                    </span>
                  </div>
                  {Object.keys(asset.params ?? {}).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(asset.params).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-muted-foreground">未记录参数</div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Sparkles className="size-3 text-brand" />
                    Prompt snapshot
                  </div>
                  {asset.promptSnapshot ? (
                    <CopyButton value={asset.promptSnapshot} size="icon-xs" />
                  ) : null}
                </div>
                {asset.promptSnapshot ? (
                  <div className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/70 bg-background/45 p-3 font-mono text-[11px] leading-relaxed text-foreground/85">
                    {asset.promptSnapshot}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-[11px] text-muted-foreground">
                    未关联 Prompt
                  </div>
                )}
                {linkedPrompt ? (
                  <Button asChild variant="ghost" size="sm" className="mt-2 h-7 px-2 text-[10px]">
                    <Link href={`/prompts?q=${encodeURIComponent(linkedPrompt.title)}`}>
                      <ArrowUpRight />
                      打开关联 Prompt：{linkedPrompt.title}
                    </Link>
                  </Button>
                ) : null}
              </div>

              {asset.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <TagPill key={tag}>{tag}</TagPill>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 space-y-2 border-t border-border/70 pt-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-3" />
                  最后更新 {formatDate(asset.updatedAt, true)}
                </div>
                <div className="flex items-center gap-2">
                  <Link2 className="size-3" />
                  {asset.source === "upload" ? "本地文件 · data/uploads" : "外部引用 URL"}
                  {asset.source === "url" && /^https?:/i.test(asset.url) ? (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto flex items-center gap-1 text-brand hover:underline"
                    >
                      原始链接
                      <ExternalLink className="size-2.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

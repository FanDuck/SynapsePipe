"use client";

import * as React from "react";
import {
  Braces,
  CalendarClock,
  Camera,
  Copy,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  Wand2,
} from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import { RelativeTime } from "@/components/shared/relative-time";
import { TagPill } from "@/components/shared/tag-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CAMERA_OPTIONS,
  getOptionLabel,
  getStage,
  getStyle,
  MODEL_OPTIONS,
} from "@/lib/constants";
import type { Prompt } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function PromptBlock({
  label,
  text,
  mono,
}: {
  label: string;
  text: string;
  mono?: boolean;
}) {
  if (!text) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span className="size-1 rounded-full bg-brand" />
          {label}
        </div>
        <CopyButton value={text} label="复制" successMessage={`${label} 已复制`} />
      </div>
      <div
        className={cn(
          "whitespace-pre-wrap rounded-xl border border-border/70 bg-background/45 p-3.5 text-[12.5px] leading-relaxed text-foreground/90",
          mono && "font-mono text-[12px]",
        )}
      >
        {text}
      </div>
    </div>
  );
}

export function PromptDetailSheet({
  prompt,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUse,
}: {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
}) {
  if (!prompt) return null;
  const style = getStyle(prompt.style);
  const stage = getStage(prompt.stage);
  const shotEntries = (
    [
      ["焦段", prompt.shotParams?.focalLength],
      ["光圈", prompt.shotParams?.aperture],
      ["布光", prompt.shotParams?.lighting],
      ["构图", prompt.shotParams?.composition],
      ["情绪", prompt.shotParams?.mood],
    ] as Array<[string, string | undefined]>
  ).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l-border/70 bg-background/95 p-0 sm:max-w-[620px]">
        <SheetHeader className="border-b border-border/70 px-6 pb-5 pt-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={cn("gap-1 border", style.badge)}>
              <span className={cn("size-1.5 rounded-full", style.dot)} />
              {style.label}
            </Badge>
            <Badge variant="subtle" className={cn("gap-1 border", stage.badge)}>
              <span className={cn("size-1 rounded-full", stage.dot)} />
              {stage.label}
            </Badge>
            <Badge variant="outline">{prompt.aspectRatio}</Badge>
            <Badge variant="outline">{getOptionLabel(MODEL_OPTIONS, prompt.model)}</Badge>
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="text-[22px] font-semibold leading-tight tracking-[-0.03em]">
                {prompt.title}
              </SheetTitle>
              <SheetDescription className="mt-1.5">
                {prompt.description || "未添加摘要"}
              </SheetDescription>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onToggleFavorite(prompt)}
                aria-label="收藏"
                className={prompt.isFavorite ? "text-amber-400" : "text-muted-foreground"}
              >
                <Star className={cn("size-4", prompt.isFavorite && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(prompt)} aria-label="编辑">
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(prompt)}
                aria-label="删除"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <Button variant="brand" className="flex-1" onClick={() => onUse(prompt)}>
              {prompt.variables.length > 0 ? <Wand2 /> : <Copy />}
              {prompt.variables.length > 0 ? "填充变量并复制" : "复制完整 Prompt"}
            </Button>
            <Button variant="outline" onClick={() => onEdit(prompt)}>
              <Pencil />
              编辑
            </Button>
          </div>

          {prompt.variables.length > 0 ? (
            <div className="rounded-xl border border-brand/20 bg-brand/[0.055] p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                <Braces className="size-3" />
                可替换变量
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {prompt.variables.map((variable) => (
                  <span
                    key={variable}
                    className="rounded-md border border-brand/20 bg-background/40 px-2 py-1 font-mono text-[10px] text-brand"
                  >
                    [{variable}]
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <PromptBlock label="中文 Prompt" text={prompt.promptZh} mono />
          <PromptBlock label="English Prompt" text={prompt.promptEn} mono />
          <PromptBlock label="负向 Prompt" text={prompt.negativePrompt} mono />

          {shotEntries.length > 0 ? (
            <div>
              <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Camera className="size-3 text-brand" />
                镜头参数
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {shotEntries.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border/70 bg-card/40 px-3 py-2"
                  >
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground/60">
                      {label}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-foreground/90">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {prompt.tags.length > 0 ? (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <TagPill key={tag}>{tag}</TagPill>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-4 text-[10.5px] text-muted-foreground sm:grid-cols-4">
            <div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground/50">Created</div>
              <div className="mt-0.5">{formatDate(prompt.createdAt)}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground/50">Updated</div>
              <div className="mt-0.5">
                <RelativeTime value={prompt.updatedAt} />
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground/50">Uses</div>
              <div className="mt-0.5 flex items-center gap-1">
                <Sparkles className="size-3 text-brand" />
                {prompt.usageCount}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground/50">Camera</div>
              <div className="mt-0.5">{getOptionLabel(CAMERA_OPTIONS, prompt.camera)}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/30 px-3 py-2 text-[10px] text-muted-foreground">
            <CalendarClock className="size-3" />
            最后更新于 <RelativeTime value={prompt.updatedAt} />，数据仅存储在你的本地设备。
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Copy,
  Ellipsis,
  Pencil,
  Sparkles,
  Star,
  Trash2,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagPill } from "@/components/shared/tag-pill";
import { RelativeTime } from "@/components/shared/relative-time";
import {
  getOptionLabel,
  STAGE_OPTIONS,
  getStage,
  getStyle,
  MODEL_OPTIONS,
  CAMERA_OPTIONS,
} from "@/lib/constants";
import type { Prompt } from "@/lib/types";
import { cn, formatCompactNumber, truncate } from "@/lib/utils";

export function PromptCard({
  prompt,
  index = 0,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStageChange,
  onUse,
  onDuplicate,
}: {
  prompt: Prompt;
  index?: number;
  onOpen: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onStageChange: (prompt: Prompt, stage: string) => void;
  onUse: (prompt: Prompt) => void;
  onDuplicate: (prompt: Prompt) => void;
}) {
  const style = getStyle(prompt.style);
  const stage = getStage(prompt.stage);
  const preview = prompt.promptZh || prompt.promptEn;
  const hasVariables = prompt.variables.length > 0;

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.2), ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(prompt)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/80 bg-card/60 p-4 transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/[0.14] hover:bg-card/95 hover:shadow-[0_22px_50px_-28px_rgba(0,0,0,0.65)]"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-20 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20",
          style.dot,
        )}
      />

      <div className="relative flex items-center gap-1.5">
        <Badge className={cn("gap-1 border", style.badge)}>
          <span className={cn("size-1.5 rounded-full", style.dot)} />
          {style.label}
        </Badge>
        <Badge variant="subtle" className={cn("gap-1 border", stage.badge)}>
          <span className={cn("size-1 rounded-full", stage.dot)} />
          {stage.label}
        </Badge>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label={prompt.isFavorite ? "取消收藏" : "收藏"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(prompt);
            }}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors hover:bg-accent",
              prompt.isFavorite ? "text-amber-400" : "text-muted-foreground/60 hover:text-foreground",
            )}
          >
            <Star className={cn("size-3.5", prompt.isFavorite && "fill-current")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground opacity-70"
                onClick={(event) => event.stopPropagation()}
                aria-label="更多操作"
              >
                <Ellipsis className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuLabel>Prompt actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => onEdit(prompt)}>
                <Pencil />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDuplicate(prompt)}>
                <Copy />
                复制一份
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sparkles />
                  移动到阶段
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {STAGE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onSelect={() => onStageChange(prompt, option.value)}
                      disabled={prompt.stage === option.value}
                    >
                      <span className={cn("size-1.5 rounded-full", option.dot)} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(prompt)}>
                <Trash2 />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h3 className="relative mt-3.5 line-clamp-1 text-[14.5px] font-semibold tracking-[-0.02em] text-foreground">
        {prompt.title}
      </h3>
      <p className="relative mt-1 line-clamp-1 text-[11.5px] text-muted-foreground">
        {prompt.description || "未添加摘要"}
      </p>

      <div className="relative mt-3 flex-1 rounded-lg border border-border/60 bg-background/40 p-2.5">
        <p className="line-clamp-3 font-mono text-[10.5px] leading-[1.7] text-muted-foreground/90">
          {truncate(preview, 190)}
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-b-lg bg-gradient-to-t from-background/70 to-transparent" />
      </div>

      {hasVariables ? (
        <div className="relative mt-2.5 flex flex-wrap items-center gap-1">
          <Wand2 className="mr-0.5 size-3 text-brand/70" />
          {prompt.variables.slice(0, 3).map((variable) => (
            <span
              key={variable}
              className="rounded border border-brand/20 bg-brand/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-brand"
            >
              [{variable}]
            </span>
          ))}
          {prompt.variables.length > 3 ? (
            <span className="text-[9px] text-muted-foreground">
              +{prompt.variables.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative mt-3 flex min-h-5 flex-wrap items-center gap-1.5">
        {prompt.tags.slice(0, 3).map((tag) => (
          <TagPill key={tag}>{tag}</TagPill>
        ))}
        {prompt.tags.length > 3 ? (
          <span className="text-[9px] text-muted-foreground/70">+{prompt.tags.length - 3}</span>
        ) : null}
      </div>

      <div className="relative mt-3 flex items-center gap-2 border-t border-border/60 pt-2.5">
        <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground/70">
          <Camera className="size-3" />
          {getOptionLabel(CAMERA_OPTIONS, prompt.camera)}
        </span>
        <span className="size-2.5 rounded-full bg-foreground/[0.08] p-0.5" />
        <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground/70">
          {getOptionLabel(MODEL_OPTIONS, prompt.model)}
        </span>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground/60">
          {formatCompactNumber(prompt.usageCount)} uses ·{" "}
          <RelativeTime value={prompt.updatedAt} />
        </span>
        <Button
          type="button"
          variant="secondary"
          size="xs"
          className="h-6 gap-1 rounded-md px-1.5 text-[10px]"
          onClick={(event) => {
            event.stopPropagation();
            onUse(prompt);
          }}
        >
          {hasVariables ? <Wand2 className="size-3" /> : <Copy className="size-3" />}
          {hasVariables ? "填充" : "复制"}
        </Button>
      </div>
    </motion.article>
  );
}

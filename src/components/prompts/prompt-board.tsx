"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Ellipsis, Pencil, Plus, Sparkles, Star, Trash2, Wand2 } from "lucide-react";

import { TagPill } from "@/components/shared/tag-pill";
import { RelativeTime } from "@/components/shared/relative-time";
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
import {
  getOptionLabel,
  getStyle,
  MODEL_OPTIONS,
  STAGE_OPTIONS,
} from "@/lib/constants";
import type { Prompt } from "@/lib/types";
import { cn, formatCompactNumber, truncate } from "@/lib/utils";

function BoardCard({
  prompt,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStageChange,
  onUse,
}: {
  prompt: Prompt;
  onOpen: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onStageChange: (prompt: Prompt, stage: string) => void;
  onUse: (prompt: Prompt) => void;
}) {
  const style = getStyle(prompt.style);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onOpen(prompt)}
      className="group cursor-pointer rounded-lg border border-border/80 bg-card/70 p-3 transition-colors hover:border-foreground/15 hover:bg-card"
    >
      <div className="flex items-center gap-1.5">
        <Badge className={cn("h-[19px] gap-1 border px-1.5 text-[9px]", style.badge)}>
          <span className={cn("size-1 rounded-full", style.dot)} />
          {style.label}
        </Badge>
        <span className="truncate font-mono text-[8.5px] uppercase tracking-wide text-muted-foreground/60">
          {getOptionLabel(MODEL_OPTIONS, prompt.model)}
        </span>
        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(prompt);
            }}
            className={cn(
              "flex size-6 items-center justify-center rounded transition-colors hover:bg-accent",
              prompt.isFavorite ? "text-amber-400" : "text-muted-foreground/50",
            )}
          >
            <Star className={cn("size-3", prompt.isFavorite && "fill-current")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="flex size-6 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
                aria-label="更多操作"
              >
                <Ellipsis className="size-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => onEdit(prompt)}>
                <Pencil />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sparkles />
                  移动阶段
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
      <h4 className="mt-2 line-clamp-1 text-[12.5px] font-semibold tracking-tight">
        {prompt.title}
      </h4>
      <p className="mt-1 line-clamp-2 font-mono text-[9.5px] leading-relaxed text-muted-foreground/80">
        {truncate(prompt.promptZh || prompt.promptEn, 120)}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1">
        {prompt.tags.slice(0, 2).map((tag) => (
          <TagPill key={tag} className="text-[8.5px]">
            {tag}
          </TagPill>
        ))}
        {prompt.variables.length > 0 ? (
          <span className="rounded border border-brand/20 bg-brand/[0.06] px-1 font-mono text-[8.5px] text-brand">
            {prompt.variables.length} vars
          </span>
        ) : null}
      </div>
      <div className="mt-2.5 flex items-center gap-2 border-t border-border/60 pt-2 text-[8.5px] text-muted-foreground/60">
        <span>{formatCompactNumber(prompt.usageCount)} uses</span>
        <span>·</span>
        <RelativeTime value={prompt.updatedAt} />
        <Button
          variant="ghost"
          size="xs"
          className="ml-auto h-5 px-1 text-[9px]"
          onClick={(event) => {
            event.stopPropagation();
            onUse(prompt);
          }}
        >
          {prompt.variables.length > 0 ? <Wand2 className="size-2.5" /> : null}
          {prompt.variables.length > 0 ? "填充" : "复制"}
        </Button>
      </div>
    </motion.div>
  );
}

export function PromptBoard({
  prompts,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStageChange,
  onUse,
  onCreate,
}: {
  prompts: Prompt[];
  onOpen: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onStageChange: (prompt: Prompt, stage: string) => void;
  onUse: (prompt: Prompt) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
      {STAGE_OPTIONS.map((stage) => {
        const columnPrompt = prompts.filter((prompt) => prompt.stage === stage.value);
        return (
          <div
            key={stage.value}
            className="flex min-w-[280px] flex-1 flex-col rounded-xl border border-border/70 bg-card/25 p-2.5 md:min-w-0"
          >
            <div className="flex items-center gap-2 px-1 py-1">
              <span className={cn("size-1.5 rounded-full", stage.dot)} />
              <span className="text-[11.5px] font-semibold tracking-tight">{stage.label}</span>
              <span className="rounded-full border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                {columnPrompt.length}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto text-muted-foreground"
                onClick={onCreate}
                aria-label={`在${stage.label}新建`}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
            <div className="mt-2 flex flex-1 flex-col gap-2">
              {columnPrompt.length === 0 ? (
                <button
                  type="button"
                  onClick={onCreate}
                  className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/20 text-[10px] text-muted-foreground transition-colors hover:border-brand/30 hover:text-foreground"
                >
                  <Plus className="mb-1 size-3.5 opacity-60" />
                  拖入灵感，或点击新建
                </button>
              ) : (
                columnPrompt.map((prompt) => (
                  <BoardCard
                    key={prompt.id}
                    prompt={prompt}
                    onOpen={onOpen}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                    onStageChange={onStageChange}
                    onUse={onUse}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

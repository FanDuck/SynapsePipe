"use client";

import * as React from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createPrompt, updatePrompt } from "@/lib/actions/prompts";
import {
  ASPECT_RATIO_OPTIONS,
  CAMERA_OPTIONS,
  MODEL_OPTIONS,
  STAGE_OPTIONS,
  STYLE_OPTIONS,
} from "@/lib/constants";
import type { Prompt, PromptInput, ShotParams } from "@/lib/types";
import { EMPTY_SHOT_PARAMS } from "@/lib/types";
import { parseTags } from "@/lib/utils";

type FormState = {
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
  tags: string;
  shotParams: ShotParams;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  promptZh: "",
  promptEn: "",
  negativePrompt: "",
  style: "cinematic",
  camera: "wide-angle",
  model: "midjourney",
  aspectRatio: "16:9",
  stage: "idea",
  tags: "",
  shotParams: EMPTY_SHOT_PARAMS,
};

function promptToForm(prompt?: Prompt | null): FormState {
  if (!prompt) return { ...EMPTY_FORM, shotParams: { ...EMPTY_SHOT_PARAMS } };
  return {
    title: prompt.title,
    description: prompt.description,
    promptZh: prompt.promptZh,
    promptEn: prompt.promptEn,
    negativePrompt: prompt.negativePrompt,
    style: prompt.style,
    camera: prompt.camera,
    model: prompt.model,
    aspectRatio: prompt.aspectRatio,
    stage: prompt.stage,
    tags: prompt.tags.join(", "),
    shotParams: { ...EMPTY_SHOT_PARAMS, ...prompt.shotParams },
  };
}

export function PromptFormDialog({
  open,
  onOpenChange,
  prompt,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  onSaved: (prompt: Prompt) => void;
}) {
  const [form, setForm] = React.useState<FormState>(() => promptToForm(prompt));
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isEditing = Boolean(prompt);

  React.useEffect(() => {
    if (open) {
      setForm(promptToForm(prompt));
      setError(null);
    }
  }, [open, prompt]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateShot(key: keyof ShotParams, value: string) {
    setForm((current) => ({
      ...current,
      shotParams: { ...current.shotParams, [key]: value },
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const input: PromptInput = {
      title: form.title,
      description: form.description,
      promptZh: form.promptZh,
      promptEn: form.promptEn,
      negativePrompt: form.negativePrompt,
      style: form.style,
      camera: form.camera,
      model: form.model,
      aspectRatio: form.aspectRatio,
      stage: form.stage,
      tags: parseTags(form.tags),
      shotParams: form.shotParams,
    };

    try {
      const result = prompt ? await updatePrompt(prompt.id, input) : await createPrompt(input);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(isEditing ? "Prompt 已更新" : "Prompt 已加入创意库");
      onSaved(result.data);
      onOpenChange(false);
    } catch {
      setError("保存失败，请稍后重试。");
      toast.error("保存失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-border/70 px-6 pb-4 pt-6">
          <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-brand">
            <Sparkles className="size-3" />
            {isEditing ? "Refine prompt" : "New prompt"}
          </div>
          <DialogTitle>{isEditing ? "编辑 Prompt" : "新建 Prompt"}</DialogTitle>
          <DialogDescription>
            同时维护中英双语版本、镜头参数与标签；方括号占位符会自动转为可替换变量。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {error ? (
            <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prompt-title">标题</Label>
              <Input
                id="prompt-title"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="例如：霓虹信使 · 雨夜东京"
                maxLength={120}
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="prompt-description">一句话摘要</Label>
              <Input
                id="prompt-description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="用一句话说明视觉概念，方便在列表里快速识别"
                maxLength={320}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label>风格</Label>
              <Select value={form.style} onValueChange={(value) => update("style", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>镜头</Label>
              <Select value={form.camera} onValueChange={(value) => update("camera", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMERA_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>模型</Label>
              <Select value={form.model} onValueChange={(value) => update("model", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>比例</Label>
              <Select
                value={form.aspectRatio}
                onValueChange={(value) => update("aspectRatio", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>阶段</Label>
              <Select value={form.stage} onValueChange={(value) => update("stage", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt-zh">中文 Prompt</Label>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {form.promptZh.length} chars
                </span>
              </div>
              <Textarea
                id="prompt-zh"
                value={form.promptZh}
                onChange={(event) => update("promptZh", event.target.value)}
                placeholder="例如：[主体] 站在 [场景] 中，电影感布光，35mm 镜头，浅景深……"
                className="min-h-44 font-mono text-[12px] leading-relaxed"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt-en">English Prompt</Label>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {form.promptEn.length} chars
                </span>
              </div>
              <Textarea
                id="prompt-en"
                value={form.promptEn}
                onChange={(event) => update("promptEn", event.target.value)}
                placeholder="English master prompt…"
                className="min-h-44 font-mono text-[12px] leading-relaxed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prompt-negative">负向 Prompt（可选）</Label>
            <Textarea
              id="prompt-negative"
              value={form.negativePrompt}
              onChange={(event) => update("negativePrompt", event.target.value)}
              placeholder="low quality, blurry, deformed, watermark…"
              className="min-h-20 font-mono text-[12px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prompt-tags">标签</Label>
            <Input
              id="prompt-tags"
              value={form.tags}
              onChange={(event) => update("tags", event.target.value)}
              placeholder="用逗号分隔，例如：赛博朋克, 雨夜, 电影感"
            />
          </div>

          <div className="rounded-xl border border-border/70 bg-background/35 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium">镜头参数</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  可选。记录焦段、光圈、布光与构图，让配方可复现。
                </div>
              </div>
              <span className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                DIRECTOR
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>焦段 / 镜头</Label>
                <Input
                  value={form.shotParams.focalLength}
                  onChange={(event) => updateShot("focalLength", event.target.value)}
                  placeholder="35mm anamorphic"
                />
              </div>
              <div className="space-y-1.5">
                <Label>光圈 / 景深</Label>
                <Input
                  value={form.shotParams.aperture}
                  onChange={(event) => updateShot("aperture", event.target.value)}
                  placeholder="T2.3 / f/1.8"
                />
              </div>
              <div className="space-y-1.5">
                <Label>布光</Label>
                <Input
                  value={form.shotParams.lighting}
                  onChange={(event) => updateShot("lighting", event.target.value)}
                  placeholder="霓虹实景光 + 雨雾体积光"
                />
              </div>
              <div className="space-y-1.5">
                <Label>构图</Label>
                <Input
                  value={form.shotParams.composition}
                  onChange={(event) => updateShot("composition", event.target.value)}
                  placeholder="偏心跟拍，前景反射"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>情绪</Label>
                <Input
                  value={form.shotParams.mood}
                  onChange={(event) => updateShot("mood", event.target.value)}
                  placeholder="忧郁、潮湿、未来主义的孤独"
                />
              </div>
            </div>
          </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border/70 bg-popover/95 px-6 py-4 backdrop-blur-xl">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" variant="brand" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" /> : <Save />}
              {submitting ? "保存中…" : isEditing ? "保存修改" : "创建 Prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

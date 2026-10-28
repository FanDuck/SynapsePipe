"use client";

import * as React from "react";
import { ArrowRight, Braces, Copy, Languages } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Prompt } from "@/lib/types";
import { applyVariables } from "@/lib/utils";

export function PromptUseDialog({
  open,
  onOpenChange,
  prompt,
  onUsed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt | null;
  onUsed: (text: string, prompt: Prompt) => void;
}) {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [language, setLanguage] = React.useState<"zh" | "en">("zh");

  React.useEffect(() => {
    if (open && prompt) {
      setValues(Object.fromEntries(prompt.variables.map((variable) => [variable, ""])));
      setLanguage(prompt.promptZh ? "zh" : "en");
    }
  }, [open, prompt]);

  if (!prompt) return null;

  const template = language === "zh" ? prompt.promptZh : prompt.promptEn;
  const preview = applyVariables(template, values);
  const hasVariables = prompt.variables.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-brand">
            <Braces className="size-3" />
            Variable injector
          </div>
          <DialogTitle>{prompt.title}</DialogTitle>
          <DialogDescription>
            {hasVariables
              ? "填入方括号变量，实时生成可直接粘贴的最终 Prompt。"
              : "这个 Prompt 没有变量，可以直接复制使用。"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Languages className="size-3" />
            {prompt.variables.length} 个变量
          </Badge>
          <Badge variant="subtle">{prompt.model}</Badge>
          <Badge variant="subtle">{prompt.aspectRatio}</Badge>
        </div>

        {hasVariables ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {prompt.variables.map((variable) => (
              <div key={variable} className="space-y-1.5">
                <Label htmlFor={`var-${variable}`} className="font-mono text-[11px]">
                  [{variable}]
                </Label>
                <Input
                  id={`var-${variable}`}
                  value={values[variable] ?? ""}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [variable]: event.target.value }))
                  }
                  placeholder={`填写「${variable}」…`}
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>最终预览</Label>
            <Tabs
              value={language}
              onValueChange={(value) => setLanguage(value as "zh" | "en")}
            >
              <TabsList className="h-7">
                <TabsTrigger value="zh" className="h-5 text-[10px]">
                  中文
                </TabsTrigger>
                <TabsTrigger value="en" className="h-5 text-[10px]">
                  English
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-background/45 p-3.5 font-mono text-[12px] leading-relaxed text-foreground/90">
            {preview || (language === "zh" ? prompt.promptZh : prompt.promptEn)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="brand"
            onClick={() => {
              const finalText =
                preview.trim() || (language === "zh" ? prompt.promptZh : prompt.promptEn);
              if (!finalText.trim()) {
                toast.error("这个语言版本还是空的，切换语言或补充 Prompt。");
                return;
              }
              onUsed(finalText, prompt);
            }}
          >
            <Copy />
            复制并记录使用
            <ArrowRight className="opacity-60" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

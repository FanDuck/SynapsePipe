"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Aperture,
  BookmarkPlus,
  BrainCircuit,
  Check,
  ChevronDown,
  Clapperboard,
  Copy,
  Film,
  Gauge,
  Languages,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { CopyButton } from "@/components/shared/copy-button";
import { TagPill } from "@/components/shared/tag-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createPrompt } from "@/lib/actions/prompts";
import { generatePrompt } from "@/lib/actions/ai";
import {
  CAMERA_OPTIONS,
  getOptionLabel,
  INSPIRATION_EXAMPLES,
  MODEL_OPTIONS,
  STYLE_OPTIONS,
  getStyle,
} from "@/lib/constants";
import type { GeneratedPrompt, PromptInput } from "@/lib/types";
import { cn, extractVariables } from "@/lib/utils";

export type StudioProvider = {
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
  configured: boolean;
  defaultNegativePrompt: string;
  defaultLanguage: "zh" | "en" | "bilingual";
};

const CREATIVITY_OPTIONS = [
  { value: 0.35, label: "克制", hint: "忠实于灵感" },
  { value: 0.7, label: "平衡", hint: "结构与惊喜" },
  { value: 0.95, label: "大胆", hint: "更多意外" },
] as const;

const LOADING_STEPS = [
  "解析灵感中的视觉锚点…",
  "构建镜头语言与光线逻辑…",
  "生成中英双语 Prompt…",
  "校准分镜参数与变量…",
];

export function PromptStudio({
  provider,
  initialIdea = "",
}: {
  provider: StudioProvider;
  initialIdea?: string;
}) {
  const [inspiration, setInspiration] = React.useState(initialIdea);
  const [style, setStyle] = React.useState("auto");
  const [model, setModel] = React.useState("midjourney");
  const [language, setLanguage] = React.useState<"zh" | "en" | "bilingual">(
    provider.defaultLanguage,
  );
  const [creativity, setCreativity] = React.useState(0.7);
  const [negativeHint, setNegativeHint] = React.useState("");
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<GeneratedPrompt | null>(null);
  const [resultLanguage, setResultLanguage] = React.useState<"zh" | "en">("zh");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setStepIndex((current) => (current + 1) % LOADING_STEPS.length);
    }, 1700);
    return () => clearInterval(timer);
  }, [loading]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void runGeneration();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspiration, style, model, language, creativity, negativeHint, loading]);

  async function runGeneration() {
    if (loading) return;
    if (inspiration.trim().length < 4) {
      toast.error("再多描述一点你的灵感（至少 4 个字）。");
      textareaRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    setResult(null);
    try {
      const response = await generatePrompt({
        inspiration,
        style: style === "auto" ? undefined : style,
        model,
        language,
        creativity,
        negativeHint,
      });
      if (!response.ok) {
        setError(response.error);
        toast.error(response.error);
        return;
      }
      setResult(response.data);
      setResultLanguage(response.data.promptZh ? "zh" : "en");
      toast.success("扩写完成，配方已就绪");
    } catch {
      setError("生成失败，请检查网络与模型配置后重试。");
      toast.error("生成失败，请检查网络与模型配置后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function saveToLibrary() {
    if (!result || saving || saved) return;
    setSaving(true);
    const input: PromptInput = {
      title: result.title,
      description: result.description,
      promptZh: result.promptZh,
      promptEn: result.promptEn,
      negativePrompt: result.negativePrompt || provider.defaultNegativePrompt,
      style: result.style,
      camera: result.camera,
      model: result.model,
      aspectRatio: result.aspectRatio,
      stage: "crafting",
      tags: result.tags,
      shotParams: result.shotParams,
    };
    const response = await createPrompt(input);
    setSaving(false);
    if (!response.ok) {
      toast.error(response.error);
      return;
    }
    setSaved(true);
    toast.success("已存入 Prompt 创意库", {
      action: {
        label: "打开",
        onClick: () => {
          window.location.href = "/prompts";
        },
      },
    });
  }

  const currentPrompt = result
    ? resultLanguage === "zh"
      ? result.promptZh
      : result.promptEn
    : "";
  const variables = result
    ? Array.from(
        new Set([
          ...result.variables,
          ...extractVariables(result.promptZh),
          ...extractVariables(result.promptEn),
        ]),
      )
    : [];

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/55 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-border/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-brand/12 text-brand ring-1 ring-brand/20">
              <Lightbulb className="size-3.5" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Idea in
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full",
                provider.configured ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <span className="max-w-[180px] truncate font-mono text-[9.5px] text-muted-foreground">
              {provider.configured ? `${provider.model}` : "provider not configured"}
            </span>
          </div>
        </div>

        <div className="relative space-y-4 p-5">
          <div>
            <Textarea
              ref={textareaRef}
              value={inspiration}
              onChange={(event) => setInspiration(event.target.value)}
              placeholder="描述一个画面、一种情绪，或一句不完整的灵感…&#10;&#10;例如：雨夜的东京街头，一个穿透明雨衣的未来信使，霓虹倒映在积水里"
              className="min-h-[190px] resize-none border-0 bg-transparent px-0 py-0 text-[15.5px] leading-relaxed shadow-none placeholder:text-muted-foreground/55 focus-visible:ring-0"
              maxLength={3000}
            />
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-muted-foreground/60">
                {inspiration.length > 0 ? "越具体，镜头语言越准确" : "支持中文 / English"}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/50">
                {inspiration.length} / 3000
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {INSPIRATION_EXAMPLES.slice(0, 4).map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setInspiration(example);
                  textareaRef.current?.focus();
                }}
                className="max-w-full truncate rounded-full border border-border bg-background/35 px-2.5 py-1 text-[9.5px] text-muted-foreground transition-colors hover:border-brand/30 hover:bg-brand/[0.06] hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                视觉风格
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动判断</SelectItem>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                目标模型
              </Label>
              <Select value={model} onValueChange={setModel}>
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                输出语言
              </Label>
              <div className="flex h-9 items-center rounded-lg border border-border bg-secondary/40 p-0.5">
                {(
                  [
                    { value: "zh", label: "中文优先" },
                    { value: "en", label: "English" },
                    { value: "bilingual", label: "双语" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={cn(
                      "flex-1 rounded-md px-1 text-[10px] transition-colors",
                      language === option.value
                        ? "bg-brand/12 text-brand shadow-sm ring-1 ring-brand/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                创意温度
              </Label>
              <div className="flex h-9 items-center rounded-lg border border-border bg-secondary/40 p-0.5">
                {CREATIVITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCreativity(option.value)}
                    title={option.hint}
                    className={cn(
                      "flex-1 rounded-md px-1 text-[10px] transition-colors",
                      creativity === option.value
                        ? "bg-brand/12 text-brand shadow-sm ring-1 ring-brand/20"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/25 px-3 py-2 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Gauge className="size-3" />
              负向引导 / 进阶
            </span>
            <ChevronDown
              className={cn("size-3 transition-transform", advancedOpen && "rotate-180")}
            />
          </button>
          <AnimatePresence initial={false}>
            {advancedOpen ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Textarea
                  value={negativeHint}
                  onChange={(event) => setNegativeHint(event.target.value)}
                  placeholder={
                    provider.defaultNegativePrompt || "希望避免的元素：多余手指、文字、塑料感…"
                  }
                  className="min-h-16 text-[11px]"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!provider.configured ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3 text-[11px]">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              <div className="text-amber-700/90 dark:text-amber-200/80">
                还没有连接模型服务。
                <Link href="/settings" className="ml-1 font-medium underline underline-offset-2">
                  前往设置
                </Link>
                ，填入兼容 OpenAI 的 Base URL 与 API Key。
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-destructive/25 bg-destructive/[0.08] p-3 text-[11px] leading-relaxed text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <div className="hidden items-center gap-1.5 text-[9.5px] text-muted-foreground/60 sm:flex">
              <kbd className="rounded border border-border bg-background/60 px-1 font-mono text-[8.5px]">
                ⌘
              </kbd>
              <kbd className="rounded border border-border bg-background/60 px-1 font-mono text-[8.5px]">
                ↵
              </kbd>
              快速生成
            </div>
            <Button
              variant="brand"
              size="lg"
              className="w-full gap-2 sm:w-auto"
              onClick={() => void runGeneration()}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <WandSparkles />}
              {loading ? "Craft 正在扩写…" : "开始扩写"}
              {!loading ? <ArrowRight className="opacity-70" /> : null}
            </Button>
          </div>
        </div>
      </section>

      <section className="min-h-[520px] overflow-hidden rounded-2xl border border-border/80 bg-card/35">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-cyan/10 text-cyan ring-1 ring-cyan/20">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Craft output
            </span>
          </div>
          {result ? (
            <Badge variant="success" className="gap-1">
              <Check className="size-3" />
              Ready
            </Badge>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/50">
              Bilingual · Shot params
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative mb-8 flex size-24 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border border-brand/25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border border-dashed border-cyan/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-6 rounded-full bg-brand/15 blur-xl"
                  animate={{ scale: [0.9, 1.15, 0.9] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
                <BrainCircuit className="relative size-7 text-brand" />
              </div>
              <div className="text-[14px] font-medium">正在把灵感编译成镜头语言</div>
              <div className="mt-2 h-5 font-mono text-[10.5px] text-muted-foreground">
                {LOADING_STEPS[stepIndex]}
              </div>
              <div className="mt-6 w-full max-w-sm space-y-2">
                <div className="h-2.5 w-3/4 rounded skeleton-shimmer" />
                <div className="h-2.5 w-full rounded skeleton-shimmer" />
                <div className="h-2.5 w-5/6 rounded skeleton-shimmer" />
                <div className="h-2.5 w-2/3 rounded skeleton-shimmer" />
              </div>
              <div className="mt-6 flex items-center gap-1 text-[9.5px] text-muted-foreground/60">
                <Zap className="size-3" />
                通常需要 8–25 秒
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-h-[calc(100dvh-220px)] overflow-y-auto"
            >
              <div className="border-b border-border/70 p-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className={cn("gap-1 border", getStyle(result.style).badge)}>
                    <span className={cn("size-1.5 rounded-full", getStyle(result.style).dot)} />
                    {getStyle(result.style).label}
                  </Badge>
                  <Badge variant="outline">{getOptionLabel(MODEL_OPTIONS, result.model)}</Badge>
                  <Badge variant="outline">{result.aspectRatio}</Badge>
                  <Badge variant="outline">{getOptionLabel(CAMERA_OPTIONS, result.camera)}</Badge>
                </div>
                <h2 className="mt-3 text-[21px] font-semibold leading-tight tracking-[-0.03em]">
                  {result.title}
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {result.description}
                </p>
              </div>

              <div className="space-y-5 p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <Languages className="size-3 text-brand" />
                      Final prompt
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tabs
                        value={resultLanguage}
                        onValueChange={(value) => setResultLanguage(value as "zh" | "en")}
                      >
                        <TabsList className="h-7">
                          <TabsTrigger value="zh" className="h-5 px-2 text-[9px]">
                            中文
                          </TabsTrigger>
                          <TabsTrigger value="en" className="h-5 px-2 text-[9px]">
                            EN
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <CopyButton value={currentPrompt} size="icon-sm" />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border/70 bg-background/45 p-3.5 font-mono text-[11.5px] leading-relaxed text-foreground/90">
                    {currentPrompt}
                  </div>
                  {variables.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] uppercase tracking-wide text-muted-foreground/60">
                        Variables
                      </span>
                      {variables.map((variable) => (
                        <span
                          key={variable}
                          className="rounded border border-brand/20 bg-brand/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-brand"
                        >
                          [{variable}]
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { icon: Aperture, label: "焦段", value: result.shotParams.focalLength },
                    { icon: Aperture, label: "光圈", value: result.shotParams.aperture },
                    { icon: Lightbulb, label: "布光", value: result.shotParams.lighting },
                    { icon: Clapperboard, label: "构图", value: result.shotParams.composition },
                    { icon: Sparkles, label: "情绪", value: result.shotParams.mood },
                    { icon: Film, label: "比例", value: result.aspectRatio },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-border/70 bg-background/30 px-2.5 py-2"
                    >
                      <div className="flex items-center gap-1 text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/60">
                        <item.icon className="size-2.5" />
                        {item.label}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[10.5px] text-foreground/85">
                        {item.value || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {result.directorNotes ? (
                  <div className="rounded-xl border border-border/70 bg-gradient-to-br from-brand/[0.06] to-transparent p-3.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-brand">
                      <BrainCircuit className="size-3" />
                      Director&apos;s notes
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {result.directorNotes}
                    </p>
                  </div>
                ) : null}

                {result.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags.map((tag) => (
                      <TagPill key={tag}>{tag}</TagPill>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-border/70 bg-popover/90 p-4 backdrop-blur-xl">
                <Button
                  variant={saved ? "secondary" : "brand"}
                  onClick={() => void saveToLibrary()}
                  disabled={saving || saved}
                  className="flex-1"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : saved ? (
                    <Check className="text-emerald-500" />
                  ) : (
                    <BookmarkPlus />
                  )}
                  {saved ? "已存入 Prompt 库" : saving ? "保存中…" : "存入 Prompt 库"}
                </Button>
                <Button variant="outline" onClick={() => void runGeneration()} disabled={loading}>
                  <RefreshCw />
                  再生成一次
                </Button>
                <Button variant="ghost" size="icon" asChild aria-label="复制配方">
                  <Link href="/prompts">
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[520px] flex-col items-center justify-center px-6 py-12 text-center"
            >
              <div className="relative mb-8 size-32">
                <div className="absolute inset-0 rounded-full bg-brand/20 blur-3xl" />
                <motion.div
                  className="absolute inset-0 rounded-full border border-border"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                >
                  <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
                  <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-cyan" />
                </motion.div>
                <div className="absolute inset-6 rounded-full border border-brand/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="flex size-14 items-center justify-center rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/20 to-cyan/10 text-brand shadow-[0_10px_40px_-10px_var(--glow)]"
                  >
                    <Sparkles className="size-6" />
                  </motion.div>
                </div>
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight">把粗糙灵感交给 Craft</h3>
              <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
                左侧写下一句话，Craft 会补齐主体、镜头、布光、色彩与材质，并给出可直接粘贴的中英双语
                Prompt 与分镜参数。
              </p>
              <div className="mt-7 grid w-full max-w-sm gap-2 text-left">
                {[
                  ["01", "解析灵感", "抽取主体、场景与情绪锚点"],
                  ["02", "构建镜头", "补齐焦段、光线与构图"],
                  ["03", "双语输出", "中文 + English + 变量"],
                ].map(([index, title, hint]) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/25 px-3 py-2.5"
                  >
                    <span className="font-mono text-[9px] text-brand">{index}</span>
                    <div>
                      <div className="text-[11px] font-medium">{title}</div>
                      <div className="text-[9.5px] text-muted-foreground/70">{hint}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-[9.5px] text-muted-foreground/50">
                <Copy className="size-2.5" />
                结果不会自动保存，由你决定是否入库
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

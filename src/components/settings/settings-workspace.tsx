"use client";

import * as React from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  HardDrive,
  Info,
  KeyRound,
  Loader2,
  LockKeyhole,
  Moon,
  Palette,
  PlugZap,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { CopyButton } from "@/components/shared/copy-button";
import { GithubIcon } from "@/components/shared/icons";
import { TagPill } from "@/components/shared/tag-pill";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  clearApiKey,
  saveSettings,
  testConnection,
} from "@/lib/actions/settings";
import { APP_REPO_URL, APP_VERSION, PROVIDER_PRESETS } from "@/lib/constants";
import type { SettingsView } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

function SettingsSection({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/80 bg-card/45 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/50 text-brand">
            <Icon className="size-4" />
          </span>
          <div>
            <h2 className="text-[13.5px] font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function SettingsWorkspace({ view }: { view: SettingsView }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [baseUrl, setBaseUrl] = React.useState(view.llmBaseUrl);
  const [model, setModel] = React.useState(view.llmModel);
  const [apiKey, setApiKey] = React.useState("");
  const [showKey, setShowKey] = React.useState(false);
  const [hasKey, setHasKey] = React.useState(view.hasApiKey);
  const [negativePrompt, setNegativePrompt] = React.useState(view.defaultNegativePrompt);
  const [language, setLanguage] = React.useState<"zh" | "en" | "bilingual">(
    view.defaultLanguage,
  );
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    latencyMs: number;
    model: string;
    reply: string;
  } | null>(null);
  const [clearOpen, setClearOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const activePreset = PROVIDER_PRESETS.find((preset) => preset.baseUrl === baseUrl);

  async function handleSave() {
    setSaving(true);
    const result = await saveSettings({
      llmBaseUrl: baseUrl,
      llmModel: model,
      llmApiKey: apiKey || undefined,
      defaultNegativePrompt: negativePrompt,
      defaultLanguage: language,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (apiKey.trim()) {
      setHasKey(true);
      setApiKey("");
    }
    toast.success("设置已保存到本地");
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection({
      llmBaseUrl: baseUrl,
      llmModel: model,
      llmApiKey: apiKey || undefined,
    });
    setTesting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setTestResult(result.data);
    toast.success(`连接成功 · ${result.data.latencyMs}ms`);
  }

  async function handleClearKey() {
    const result = await clearApiKey();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setHasKey(false);
    setApiKey("");
    setClearOpen(false);
    toast.success("API Key 已移除");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)]">
      <div className="space-y-4">
        <SettingsSection
          icon={Server}
          title="模型服务"
          description="兼容 OpenAI Chat Completions 的任意服务：DeepSeek、OpenAI、OpenRouter、Ollama、LM Studio 等。"
          action={
            <Badge variant={hasKey ? "success" : "warning"} className="gap-1">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  hasKey ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              {hasKey ? "Key 已配置" : "待配置"}
            </Badge>
          }
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PROVIDER_PRESETS.map((preset) => {
              const selected = activePreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setBaseUrl(preset.baseUrl);
                    setModel(preset.model);
                    setTestResult(null);
                  }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    selected
                      ? "border-brand/35 bg-brand/[0.08] shadow-[0_0_0_1px_var(--glow)]"
                      : "border-border bg-background/25 hover:border-foreground/15 hover:bg-accent/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold">{preset.name}</span>
                    {selected ? <CheckCircle2 className="size-3.5 text-brand" /> : null}
                  </div>
                  <p className="mt-1 line-clamp-1 text-[9px] text-muted-foreground">{preset.note}</p>
                  <p className="mt-1 truncate font-mono text-[8px] text-muted-foreground/50">
                    {preset.model}
                  </p>
                </button>
              );
            })}
          </div>

          <Separator className="my-5" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="base-url">API Base URL</Label>
              <div className="relative">
                <Cpu className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="base-url"
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="https://api.deepseek.com/v1"
                  className="pl-9 font-mono text-[12px]"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <p className="text-[9px] text-muted-foreground">
                包含 <code className="font-mono text-foreground/70">/v1</code>，无需填写
                <code className="font-mono text-foreground/70"> /chat/completions</code>。
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model-name">模型名称</Label>
              <Input
                id="model-name"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="deepseek-chat"
                className="font-mono text-[12px]"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-key" className="flex items-center justify-between">
                <span>API Key</span>
                {hasKey ? (
                  <span className="flex items-center gap-1 text-[9px] font-normal text-emerald-500">
                    <ShieldCheck className="size-2.5" />
                    {view.maskedApiKey}
                  </span>
                ) : null}
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={hasKey ? "已加密保存 · 留空保持不变" : "sk-…"}
                  className="pl-9 pr-9 font-mono text-[12px]"
                  autoComplete="new-password"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((value) => !value)}
                  className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "隐藏 API Key" : "显示 API Key"}
                >
                  {showKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              <p className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <LockKeyhole className="size-2.5" />
                AES-256-GCM 加密存储，永不上传到第三方。
              </p>
            </div>
          </div>

          {testResult ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
              <div className="text-[10.5px] leading-relaxed text-emerald-700 dark:text-emerald-300">
                已连接 <span className="font-mono">{testResult.model}</span> · 延迟{" "}
                {testResult.latencyMs}ms · 回复「{testResult.reply || "OK"}」
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button variant="brand" size="sm" onClick={() => void handleSave()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {saving ? "保存中…" : "保存设置"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleTest()}
              disabled={testing}
            >
              {testing ? <Loader2 className="animate-spin" /> : <PlugZap />}
              {testing ? "测试中…" : "测试连接"}
            </Button>
            {hasKey ? (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-muted-foreground hover:text-destructive"
                onClick={() => setClearOpen(true)}
              >
                <Trash2 />
                移除 Key
              </Button>
            ) : null}
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Sparkles}
          title="创作默认值"
          description="每次扩写与入库时使用的默认负向提示与语言偏好。"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="negative-prompt">默认负向 Prompt</Label>
              <Textarea
                id="negative-prompt"
                value={negativePrompt}
                onChange={(event) => setNegativePrompt(event.target.value)}
                placeholder="low quality, blurry, deformed, watermark…"
                className="min-h-20 font-mono text-[11px]"
              />
              <p className="text-[9px] text-muted-foreground">
                会自动注入到 AI 扩写的提示词中，也可以逐条覆盖。
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>默认输出语言</Label>
              <div className="flex h-9 max-w-sm items-center rounded-lg border border-border bg-secondary/40 p-0.5">
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
                      "flex-1 rounded-md px-2 text-[10px] transition-colors",
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              保存创作默认值
            </Button>
          </div>
        </SettingsSection>
      </div>

      <div className="space-y-4">
        <SettingsSection
          icon={Palette}
          title="外观"
          description="深色优先，但也为白天工作准备了一套通透的浅色主题。"
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "dark", label: "深色", hint: "Dark", icon: Moon },
              { value: "light", label: "浅色", hint: "Light", icon: Sun },
            ].map((option) => {
              const active = mounted && resolvedTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-brand/35 bg-brand/[0.08]"
                      : "border-border bg-background/25 hover:bg-accent/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <option.icon className={cn("size-4", active ? "text-brand" : "text-muted-foreground")} />
                    {active ? <Badge variant="default" className="text-[8px]">ACTIVE</Badge> : null}
                  </div>
                  <div className="mt-2 text-[11.5px] font-medium">{option.label}</div>
                  <div className="text-[9px] text-muted-foreground">{option.hint} mode</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-[9.5px] text-muted-foreground">
            <Info className="size-3" />
            主题偏好保存在浏览器本地，不进入数据库。
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Database}
          title="本地数据"
          description="SQLite 单文件 + 本地媒体目录，完整掌控你的创作资产。"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/70 bg-background/25 px-3 py-2.5">
              <div className="flex items-center gap-1 text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/60">
                <Database className="size-2.5" />
                Prompts
              </div>
              <div className="mt-1 text-[18px] font-semibold tracking-tight">
                {view.promptCount}
              </div>
            </div>
            <div className="rounded-lg border border-border/70 bg-background/25 px-3 py-2.5">
              <div className="flex items-center gap-1 text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/60">
                <HardDrive className="size-2.5" />
                Assets
              </div>
              <div className="mt-1 text-[18px] font-semibold tracking-tight">
                {view.assetCount}
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-border/70 bg-background/25 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/60">
                  Database path
                </span>
                <CopyButton value={view.databasePath} size="icon-xs" />
              </div>
              <div className="mt-1 truncate font-mono text-[9.5px] text-foreground/70">
                {view.databasePath}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-background/25 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <HardDrive className="size-3" />
                磁盘占用
              </span>
              <span className="font-mono text-[10.5px]">{formatBytes(view.storageBytes)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/backup" download>
                <Download />
                导出 JSON 备份
              </a>
            </Button>
            <p className="flex items-start gap-1.5 text-[9px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-2.5 shrink-0" />
              完整备份请复制整个 <code className="font-mono text-foreground/70">data/</code>{" "}
              目录；JSON 备份仅含元数据，不含本地媒体文件。
            </p>
          </div>
        </SettingsSection>

        <SettingsSection icon={ShieldCheck} title="关于 SynapsePipe">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-brand/20 bg-gradient-to-br from-brand/20 to-cyan/10 text-brand">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                SynapsePipe
                <Badge variant="outline" className="font-mono text-[8px]">
                  v{APP_VERSION}
                </Badge>
              </div>
              <div className="mt-0.5 text-[9.5px] text-muted-foreground">
                Next-gen Local-first AIGC Workbench
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["Next.js 15", "React 19", "SQLite", "Drizzle ORM", "Tailwind v4", "shadcn/ui"].map(
              (tech) => (
                <TagPill key={tech}>{tech}</TagPill>
              ),
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <a href={APP_REPO_URL} target="_blank" rel="noreferrer">
                <GithubIcon className="size-4" />
                GitHub
              </a>
            </Button>
            <Badge variant="success" className="gap-1">
              <BadgeCheck className="size-3" />
              MIT
            </Badge>
          </div>
          <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/30 px-3 py-2 text-[9px] text-muted-foreground">
            <LockKeyhole className="size-2.5" />
            没有账号、没有云端锁定、没有遥测。你的工作台属于你。
          </div>
        </SettingsSection>
      </div>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>移除已保存的 API Key？</AlertDialogTitle>
            <AlertDialogDescription>
              密钥会从本地 SQLite 中清除。AI 扩写将暂停，直到重新配置。Prompt 与资产数据不受影响。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleClearKey();
              }}
            >
              确认移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

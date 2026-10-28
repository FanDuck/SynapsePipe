"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  Images,
  LayoutGrid,
  LibraryBig,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  WandSparkles,
  Zap,
} from "lucide-react";

import { AssetMedia } from "@/components/gallery/asset-media";
import { RelativeTime } from "@/components/shared/relative-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getOptionLabel,
  getStage,
  getStyle,
  MODEL_OPTIONS,
  STAGE_OPTIONS,
} from "@/lib/constants";
import type { DashboardStats } from "@/lib/types";
import {
  cn,
  formatBytes,
  formatCompactNumber,
} from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
  iconClass,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
  accent: string;
  iconClass: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-border/80 bg-card/50 p-4 transition-colors hover:border-foreground/15 hover:bg-card/80"
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-[0.14]",
          accent,
        )}
      />
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg border border-border/70 bg-background/50",
            iconClass,
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground" />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-[-0.04em]">{value}</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 text-[9.5px] text-muted-foreground/70">{hint}</div>
    </motion.div>
  );
}

function PipelineVisual({
  promptCount,
  assetCount,
}: {
  promptCount: number;
  assetCount: number;
}) {
  const chips = [
    {
      label: "PROMPT",
      value: `${promptCount}`,
      icon: LibraryBig,
      className: "left-1 top-5 text-brand border-brand/25 bg-brand/10",
      delay: 0,
    },
    {
      label: "STUDIO",
      value: "AI",
      icon: WandSparkles,
      className: "right-1 top-16 text-cyan border-cyan/25 bg-cyan/10",
      delay: 0.6,
    },
    {
      label: "ASSET",
      value: `${assetCount}`,
      icon: Images,
      className: "bottom-5 left-10 text-emerald-500 border-emerald-500/25 bg-emerald-500/10",
      delay: 1.2,
    },
  ];

  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[340px]">
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,var(--glow),transparent_65%)]" />
      <motion.div
        className="absolute left-1/2 top-1/2 size-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-foreground/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.05]"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]" />
        <span className="absolute bottom-3 right-6 size-1 rounded-full bg-cyan" />
      </motion.div>
      <div className="absolute left-1/2 top-1/2 flex size-[112px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-brand/25 via-card to-cyan/10 shadow-[0_20px_60px_-20px_var(--glow)] backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <Sparkles className="size-7 text-brand" />
          <span className="mt-2 font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            SYNAPSE
          </span>
          <span className="mt-1 flex items-center gap-1 font-mono text-[7px] text-emerald-500">
            <span className="size-1 rounded-full bg-emerald-500" />
            LIVE
          </span>
        </div>
      </div>
      {chips.map((chip) => (
        <motion.div
          key={chip.label}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: chip.delay }}
          className={cn(
            "absolute flex items-center gap-2 rounded-xl border px-2.5 py-2 backdrop-blur-md",
            chip.className,
            "bg-opacity-100",
          )}
        >
          <chip.icon className="size-3.5" />
          <div>
            <div className="font-mono text-[7px] tracking-[0.14em] opacity-70">{chip.label}</div>
            <div className="text-[11px] font-semibold">{chip.value}</div>
          </div>
        </motion.div>
      ))}
      <div className="absolute inset-x-6 bottom-0 flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5 font-mono text-[8px] text-muted-foreground backdrop-blur-md">
        <span className="flex items-center gap-1">
          <Database className="size-2.5" />
          /data/synapsepipe.db
        </span>
        <span className="flex items-center gap-1 text-emerald-500">
          <ShieldCheck className="size-2.5" />
          LOCAL
        </span>
      </div>
    </div>
  );
}

function ActivityChart({ stats }: { stats: DashboardStats }) {
  const max = Math.max(1, ...stats.activity.map((day) => day.prompts + day.assets));
  const total = stats.activity.reduce((sum, day) => sum + day.prompts + day.assets, 0);

  return (
    <section className="rounded-2xl border border-border/80 bg-card/45 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <TrendingUp className="size-3 text-brand" />
            Pipeline pulse
          </div>
          <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight">最近 7 天的创作脉冲</h2>
        </div>
        <div className="text-right">
          <div className="text-[20px] font-semibold leading-none tracking-tight">{total}</div>
          <div className="mt-1 text-[9px] text-muted-foreground">new items</div>
        </div>
      </div>

      <div className="mt-6 flex h-36 items-end gap-2 sm:gap-3">
        {stats.activity.map((day) => {
          const totalDay = day.prompts + day.assets;
          return (
            <div key={day.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full w-full items-end justify-center gap-1">
                <div
                  className="w-[34%] rounded-t-[3px] bg-gradient-to-t from-brand/40 to-brand transition-all duration-500 group-hover:from-brand/60"
                  style={{
                    height: `${Math.max(3, (day.prompts / max) * 100)}%`,
                    minHeight: day.prompts ? 6 : 2,
                  }}
                  title={`${day.prompts} prompts`}
                />
                <div
                  className="w-[34%] rounded-t-[3px] bg-gradient-to-t from-cyan/30 to-cyan/80 transition-all duration-500 group-hover:from-cyan/50"
                  style={{
                    height: `${Math.max(3, (day.assets / max) * 100)}%`,
                    minHeight: day.assets ? 6 : 2,
                  }}
                  title={`${day.assets} assets`}
                />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[8.5px] text-muted-foreground/70">{day.label}</span>
                {totalDay > 0 ? (
                  <span className="font-mono text-[7.5px] text-muted-foreground/40">{totalDay}</span>
                ) : (
                  <span className="h-[10px]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-sm bg-brand" />
            Prompts
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-sm bg-cyan" />
            Assets
          </span>
        </div>
        <span className="font-mono text-[8.5px] text-muted-foreground/50">
          local time · {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}

function StageOverview({ stats }: { stats: DashboardStats }) {
  const ready = stats.stageCounts.ready ?? 0;
  const readiness =
    stats.promptCount > 0 ? Math.round((ready / stats.promptCount) * 100) : 0;

  return (
    <section className="rounded-2xl border border-border/80 bg-card/45 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <CircleDot className="size-3 text-brand" />
            Workflow
          </div>
          <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight">创意管线健康度</h2>
        </div>
        <Badge variant={readiness >= 40 ? "success" : "warning"} className="font-mono text-[9px]">
          {readiness}% ready
        </Badge>
      </div>

      <div className="mt-5 space-y-4">
        {STAGE_OPTIONS.map((stage) => {
          const count = stats.stageCounts[stage.value] ?? 0;
          const percent = stats.promptCount > 0 ? (count / stats.promptCount) * 100 : 0;
          return (
            <div key={stage.value}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className={cn("size-1.5 rounded-full", stage.dot)} />
                <span className="text-[11px] font-medium">{stage.label}</span>
                <span className="ml-auto font-mono text-[9.5px] text-muted-foreground">
                  {count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.055]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(2, percent)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn("h-full rounded-full", stage.dot)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-border/60 bg-background/25 px-3 py-2">
        <span className="text-[9.5px] text-muted-foreground">
          <span className="font-medium text-foreground/80">{ready}</span> 条 Prompt 已达到可出片状态
        </span>
        <Link
          href="/prompts"
          className="flex items-center gap-1 text-[9.5px] font-medium text-brand hover:underline"
        >
          看板
          <ArrowRight className="size-2.5" />
        </Link>
      </div>
    </section>
  );
}

export function DashboardView({
  stats,
  providerConfigured,
  providerModel,
  providerBaseUrl,
}: {
  stats: DashboardStats;
  providerConfigured: boolean;
  providerModel: string;
  providerBaseUrl: string;
}) {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
        <div className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-brand/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-64 rounded-full bg-cyan/10 blur-[100px]" />
        <div className="relative grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="gap-1.5">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-50" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
                </span>
                LOCAL-FIRST AIGC
              </Badge>
              <Badge variant="outline" className="font-mono text-[9px]">
                SQLITE · ENCRYPTED KEY
              </Badge>
              <Badge variant="outline" className="font-mono text-[9px]">
                v1.0
              </Badge>
            </div>
            <h1 className="mt-5 text-[34px] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-[42px]">
              让每一条灵感，
              <br />
              <span className="text-gradient">都有迹可循。</span>
            </h1>
            <p className="mt-4 max-w-lg text-[12.5px] leading-relaxed text-muted-foreground">
              从一句模糊的画面，到结构化 Prompt、镜头参数与可追溯的资产画廊。SynapsePipe
              把创意管线收进一个本地优先的工作台，数据始终留在你的设备上。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button asChild variant="brand" size="lg">
                <Link href="/generate">
                  <WandSparkles />
                  打开 AI 扩写台
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/prompts?new=1">
                  <Plus />
                  新建 Prompt
                </Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <LibraryBig className="size-3 text-brand" />
                <span className="font-semibold text-foreground">{stats.promptCount}</span> Prompts
              </span>
              <span className="flex items-center gap-1.5">
                <Images className="size-3 text-cyan" />
                <span className="font-semibold text-foreground">{stats.assetCount}</span> Assets
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-3 text-amber-400" />
                <span className="font-semibold text-foreground">{stats.favoriteCount}</span> Saved
              </span>
              <span className="flex items-center gap-1.5">
                <Database className="size-3 text-emerald-500" />
                {formatBytes(stats.storageBytes)} local
              </span>
            </div>
          </div>
          <PipelineVisual promptCount={stats.promptCount} assetCount={stats.assetCount} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <StatCard
          icon={LibraryBig}
          label="Prompt 总量"
          value={String(stats.promptCount)}
          hint={`${stats.stageCounts.ready ?? 0} 条已准备出片`}
          accent="bg-brand"
          iconClass="text-brand"
          index={0}
        />
        <StatCard
          icon={Images}
          label="资产总量"
          value={String(stats.assetCount)}
          hint={`${stats.typeCounts.video ?? 0} 个视频 · ${stats.typeCounts.image ?? 0} 张图像`}
          accent="bg-cyan-500"
          iconClass="text-cyan-500"
          index={1}
        />
        <StatCard
          icon={Star}
          label="收藏"
          value={String(stats.favoriteCount)}
          hint="Prompt 与资产的总收藏数"
          accent="bg-amber-500"
          iconClass="text-amber-500"
          index={2}
        />
        <StatCard
          icon={Zap}
          label="累计调用"
          value={formatCompactNumber(stats.totalUsage)}
          hint="一键复制 / 变量填充次数"
          accent="bg-emerald-500"
          iconClass="text-emerald-500"
          index={3}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
        <ActivityChart stats={stats} />
        <StageOverview stats={stats} />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-2xl border border-border/80 bg-card/45 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Clock3 className="size-3 text-brand" />
                Recent assets
              </div>
              <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight">最近入库</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-[10px]">
              <Link href="/gallery">
                全部资产
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          {stats.recentAssets.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {stats.recentAssets.slice(0, 4).map((asset, index) => (
                <Link
                  key={asset.id}
                  href="/gallery"
                  className="group relative overflow-hidden rounded-lg border border-border/70 bg-background/30"
                  style={{ aspectRatio: index === 0 ? 1.1 : 1 }}
                >
                  <div className="absolute inset-0">
                    <AssetMedia
                      asset={asset}
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <div className="line-clamp-1 text-[10px] font-medium text-white">
                      {asset.title}
                    </div>
                    <div className="mt-0.5 font-mono text-[7.5px] text-white/50">
                      {getOptionLabel(MODEL_OPTIONS, asset.model)} ·{" "}
                      <RelativeTime value={asset.createdAt} />
                    </div>
                  </div>
                  {asset.type === "video" ? (
                    <span className="absolute right-2 top-2 rounded bg-black/50 px-1 py-0.5 font-mono text-[7px] text-white/80">
                      VIDEO
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
              <Images className="size-5 text-muted-foreground/50" />
              <p className="mt-2 text-[11px] text-muted-foreground">画廊还空着，入库第一件资产吧。</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/gallery?upload=1">上传资产</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border/80 bg-card/45 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="size-3 text-brand" />
                Most used
              </div>
              <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight">高频 Prompt</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7 text-[10px]">
              <Link href="/prompts">
                创意库
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="mt-3 divide-y divide-border/60">
            {stats.topPrompts.length > 0 ? (
              stats.topPrompts.map((prompt, index) => {
                const style = getStyle(prompt.style);
                return (
                  <Link
                    key={prompt.id}
                    href={`/prompts?q=${encodeURIComponent(prompt.title)}`}
                    className="group flex items-center gap-3 py-2.5 transition-colors"
                  >
                    <span className="w-4 font-mono text-[9px] text-muted-foreground/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full", style.dot)} />
                        <span className="truncate text-[11.5px] font-medium group-hover:text-brand">
                          {prompt.title}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[8.5px] text-muted-foreground/60">
                        <span>{getOptionLabel(MODEL_OPTIONS, prompt.model)}</span>
                        <span>·</span>
                        <span>{getStage(prompt.stage).label}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 font-mono text-[9px] text-muted-foreground">
                      <Zap className="size-2.5 text-brand/70" />
                      {prompt.usageCount}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <LayoutGrid className="size-5 text-muted-foreground/40" />
                <p className="mt-2 text-[11px] text-muted-foreground">还没有使用记录。</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5",
          providerConfigured
            ? "border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.07] via-card/45 to-transparent"
            : "border-amber-500/25 bg-gradient-to-r from-amber-500/[0.08] via-card/45 to-transparent",
        )}
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                providerConfigured
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-500",
              )}
            >
              {providerConfigured ? <CheckCircle2 className="size-4" /> : <Zap className="size-4" />}
            </span>
            <div>
              <h2 className="text-[13px] font-semibold">
                {providerConfigured ? "模型服务已连接" : "连接模型服务，解锁 AI 魔法扩写"}
              </h2>
              <p className="mt-1 max-w-xl text-[10.5px] leading-relaxed text-muted-foreground">
                {providerConfigured
                  ? `当前使用 ${providerModel} · ${providerBaseUrl}。API Key 已使用 AES-256-GCM 加密保存。`
                  : "支持 DeepSeek、OpenAI、OpenRouter、Ollama 等任意 OpenAI 兼容服务。密钥加密保存在本机，不经过任何第三方。"}
              </p>
            </div>
          </div>
          <Button asChild variant={providerConfigured ? "outline" : "brand"} size="sm">
            <Link href="/settings">
              {providerConfigured ? "管理模型服务" : "去配置"}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

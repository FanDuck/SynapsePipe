"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Database,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

import { BrandMark, BrandWordmark } from "@/components/shared/brand";
import { GithubIcon } from "@/components/shared/icons";
import { StatusDot } from "@/components/shared/tag-pill";
import { Badge } from "@/components/ui/badge";
import { isNavActive, primaryNav, secondaryNav, type NavItem } from "@/components/layout/nav";
import { APP_REPO_URL } from "@/lib/constants";
import type { ShellData } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

function NavLink({
  item,
  pathname,
  shell,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  shell: ShellData;
  onNavigate?: () => void;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;
  let count: number | null = null;
  if (item.badge === "prompts") count = shell.promptCount;
  if (item.badge === "assets") count = shell.assetCount;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-[background-color,color] duration-150",
        active
          ? "bg-foreground/[0.065] text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active"
          className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      ) : null}
      <span
        className={cn(
          "relative flex size-6 items-center justify-center rounded-md transition-colors",
          active ? "text-brand" : "text-muted-foreground/80 group-hover:text-foreground",
          item.badge === "ai" &&
            "bg-gradient-to-br from-brand/20 to-cyan/10 text-brand ring-1 ring-brand/20",
        )}
      >
        <Icon className="size-[15px]" />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {count !== null ? (
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
          {count}
        </span>
      ) : null}
      {item.badge === "ai" ? (
        <Badge variant="default" className="h-[17px] px-1.5 text-[8px] font-bold tracking-wider">
          AI
        </Badge>
      ) : null}
    </Link>
  );
}

export function SidebarContent({
  shell,
  onNavigate,
  className,
}: {
  shell: ShellData;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/60 px-4">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <BrandMark className="size-8" />
          <BrandWordmark />
        </Link>
        <Badge
          variant="outline"
          className="ml-auto px-1.5 py-0 font-mono text-[9px] text-muted-foreground"
        >
          v{shell.version}
        </Badge>
      </div>

      <div className="px-3 pt-4">
        <Link
          href="/generate"
          onClick={onNavigate}
          className="group relative block overflow-hidden rounded-xl border border-brand/20 bg-gradient-to-br from-brand/[0.13] via-card/70 to-cyan/[0.05] p-3 transition-colors hover:border-brand/35"
        >
          <div className="pointer-events-none absolute -right-10 -top-12 size-28 rounded-full bg-brand/20 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-start gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/15 text-brand ring-1 ring-brand/20">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold tracking-tight">
                Prompt Studio
                <span className="rounded bg-brand/15 px-1 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-brand">
                  new
                </span>
              </div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
                用一句话灵感，扩写为可出片的中英双语 Prompt。
              </p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-2 px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          Workspace
        </div>
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              shell={shell}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="mb-2 mt-6 px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
          System
        </div>
        <div className="space-y-0.5">
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              shell={shell}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border/70 bg-card/40 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Database className="size-3" />
              Local vault
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-500">
              <StatusDot pulse className="text-emerald-500" />
              SQLite
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <HardDrive className="size-3" />
            {formatBytes(shell.storageBytes)} on this device
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-cyan"
              style={{ width: `${Math.min(100, Math.max(3, shell.storageBytes / (1024 * 1024 * 50) * 100))}%` }}
            />
          </div>
          <p className="mt-2.5 text-[9.5px] leading-relaxed text-muted-foreground/70">
            数据永不出机。备份只需复制 <span className="font-mono">data/</span>。
          </p>
        </div>
      </nav>

      <div className="shrink-0 border-t border-border/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/70">Local-first · MIT</span>
          <a
            href={APP_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-3" />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

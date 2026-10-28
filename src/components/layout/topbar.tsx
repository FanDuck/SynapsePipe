"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  FilePlus2,
  Menu,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";

import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BrandMark } from "@/components/shared/brand";
import { GithubIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_REPO_URL } from "@/lib/constants";
import type { SearchPrompt } from "@/lib/types";
import { cn } from "@/lib/utils";

const pageNames: Record<string, string> = {
  "/": "总览",
  "/prompts": "Prompt 库",
  "/generate": "AI 扩写台",
  "/gallery": "资产画廊",
  "/settings": "设置",
};

export function Topbar({
  prompts,
  onOpenMobileNav,
}: {
  prompts: SearchPrompt[];
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const pageName = pageNames[pathname] ?? "Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/70 bg-background/65 px-3 backdrop-blur-2xl sm:gap-3 sm:px-5 lg:h-16 lg:px-7">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="打开导航"
      >
        <Menu className="size-4" />
      </Button>

      <div className="flex items-center gap-2 lg:hidden">
        <BrandMark className="size-7" />
        <span className="text-[13px] font-semibold tracking-tight">{pageName}</span>
      </div>

      <div className="hidden min-w-0 items-center gap-2 text-[12px] lg:flex">
        <span className="text-muted-foreground/60">SynapsePipe</span>
        <span className="text-muted-foreground/30">/</span>
        <span className="font-medium text-foreground/90">{pageName}</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 xl:flex">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Local · 已同步
        </div>

        <div className="mx-1 hidden h-4 w-px bg-border xl:block" />

        <CommandPalette prompts={prompts} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="brand" size="sm" className="group h-8 gap-1.5 pl-2.5 pr-2">
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">新建</span>
              <ChevronDown className="size-3 opacity-60 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Create new</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/prompts?new=1">
                <FilePlus2 className="text-brand" />
                新建 Prompt
                <span className="ml-auto font-mono text-[9px] text-muted-foreground">
                  ⌘N
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/gallery?upload=1">
                <Upload className="text-cyan-500" />
                上传资产
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/generate">
                <Sparkles className="text-brand" />
                打开 AI 扩写台
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-0.5 hidden h-4 w-px bg-border sm:block" />

        <ThemeToggle className="hidden sm:flex" />

        <a
          href={APP_REPO_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub repository"
          className={cn(
            "hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex",
          )}
        >
          <GithubIcon className="size-4" />
        </a>
      </div>
    </header>
  );
}

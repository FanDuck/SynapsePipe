"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Command,
  FilePlus2,
  Images,
  LayoutDashboard,
  LibraryBig,
  Moon,
  Search,
  Settings2,
  Sparkles,
  Sun,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/shared/kbd";
import { getOptionLabel, STYLE_OPTIONS } from "@/lib/constants";
import type { SearchPrompt } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaletteEntry = {
  id: string;
  group: "快速前往" | "Prompts";
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
};

export function CommandPalette({ prompts }: { prompts: SearchPrompt[] }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const navigate = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const entries = React.useMemo<PaletteEntry[]>(() => {
    const navEntries: PaletteEntry[] = [
      {
        id: "nav-overview",
        group: "快速前往",
        label: "总览",
        hint: "Workbench overview",
        icon: LayoutDashboard,
        keywords: "home dashboard 首页",
        run: () => navigate("/"),
      },
      {
        id: "nav-prompts",
        group: "快速前往",
        label: "Prompt 库",
        hint: "Library · list & board",
        icon: LibraryBig,
        keywords: "prompt 提示词 库",
        run: () => navigate("/prompts"),
      },
      {
        id: "nav-studio",
        group: "快速前往",
        label: "AI 扩写台",
        hint: "Idea → production prompt",
        icon: WandSparkles,
        keywords: "ai generate 扩写 灵感",
        run: () => navigate("/generate"),
      },
      {
        id: "nav-gallery",
        group: "快速前往",
        label: "资产画廊",
        hint: "Assets · images & video",
        icon: Images,
        keywords: "gallery asset 画廊 资产",
        run: () => navigate("/gallery"),
      },
      {
        id: "nav-settings",
        group: "快速前往",
        label: "设置",
        hint: "Provider, data, preferences",
        icon: Settings2,
        keywords: "settings api key 设置",
        run: () => navigate("/settings"),
      },
      {
        id: "action-new-prompt",
        group: "快速前往",
        label: "新建 Prompt",
        hint: "Create",
        icon: FilePlus2,
        keywords: "new create 新建",
        run: () => navigate("/prompts?new=1"),
      },
      {
        id: "action-theme",
        group: "快速前往",
        label: resolvedTheme === "dark" ? "切换到浅色模式" : "切换到深色模式",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        keywords: "theme dark light 主题",
        run: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
    ];

    const promptEntries: PaletteEntry[] = prompts.map((prompt) => ({
      id: `prompt-${prompt.id}`,
      group: "Prompts",
      label: prompt.title,
      hint: `${getOptionLabel(STYLE_OPTIONS, prompt.style)} · ${prompt.model}`,
      icon: Sparkles,
      keywords: `${prompt.description} ${prompt.title} ${prompt.style} ${prompt.model}`,
      run: () => navigate(`/prompts?q=${encodeURIComponent(prompt.title)}`),
    }));

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [...navEntries, ...promptEntries.slice(0, 4)];
    }

    const filteredNav = navEntries.filter((entry) =>
      `${entry.label} ${entry.hint ?? ""} ${entry.keywords ?? ""}`
        .toLowerCase()
        .includes(trimmed),
    );
    const filteredPrompts = promptEntries
      .filter((entry) =>
        `${entry.label} ${entry.hint ?? ""} ${entry.keywords ?? ""}`
          .toLowerCase()
          .includes(trimmed),
      )
      .slice(0, 7);

    return [...filteredNav, ...filteredPrompts];
  }, [navigate, prompts, query, resolvedTheme, setTheme]);

  React.useEffect(() => {
    setActive(0);
  }, [query]);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(entries.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      entries[active]?.run();
    }
  }

  let lastGroup: PaletteEntry["group"] | null = null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group hidden h-8 w-[236px] items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 text-left text-[12px] text-muted-foreground transition-colors hover:border-foreground/15 hover:bg-accent/60 hover:text-foreground md:flex"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 truncate">搜索 Prompt、资产…</span>
          <Kbd className="h-5 gap-0.5 px-1">
            <Command className="size-2.5" />K
          </Kbd>
        </button>
      </DialogTrigger>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          aria-label="打开搜索"
        >
          <Search className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="top-[14%] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-2xl border-border/80 bg-popover/90 p-0 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] data-[state=open]:slide-in-from-top-4"
      >
        <DialogTitle className="sr-only">命令面板</DialogTitle>
        <DialogDescription className="sr-only">
          快速搜索 Prompt、跳转模块并执行工作台操作。
        </DialogDescription>
        <div className="flex h-13 items-center gap-3 border-b border-border/70 px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="搜索 Prompt、跳转模块、执行操作…"
            className="h-full flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground/65"
          />
          <Kbd>ESC</Kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto overscroll-contain p-2">
          {entries.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                <Search className="size-4 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-medium">没有找到匹配项</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                试试「赛博朋克」「产品」或模块名称。
              </p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const showGroup = entry.group !== lastGroup;
              lastGroup = entry.group;
              const Icon = entry.icon;
              return (
                <React.Fragment key={entry.id}>
                  {showGroup ? (
                    <div className="px-2.5 pb-1.5 pt-3 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60 first:pt-1">
                      {entry.group}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={entry.run}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active === index
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground/85 hover:bg-accent/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/60",
                        active === index && "border-brand/25 bg-brand/10 text-brand",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">
                        {entry.label}
                      </span>
                      {entry.hint ? (
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {entry.hint}
                        </span>
                      ) : null}
                    </span>
                    {active === index ? (
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : null}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              打开
            </span>
          </div>
          <Badge variant="subtle" className="gap-1 text-[9px]">
            <Sparkles className="size-2.5" />
            SynapsePeek
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  Columns3,
  LayoutGrid,
  LibraryBig,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PromptBoard } from "@/components/prompts/prompt-board";
import { PromptCard } from "@/components/prompts/prompt-card";
import { PromptDetailSheet } from "@/components/prompts/prompt-detail-sheet";
import { PromptFormDialog } from "@/components/prompts/prompt-form-dialog";
import { PromptUseDialog } from "@/components/prompts/prompt-use-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  CAMERA_OPTIONS,
  MODEL_OPTIONS,
  SORT_OPTIONS,
  STAGE_OPTIONS,
  STYLE_OPTIONS,
} from "@/lib/constants";
import {
  deletePrompt,
  duplicatePrompt,
  recordPromptUsage,
  setPromptStage,
  togglePromptFavorite,
} from "@/lib/actions/prompts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Prompt } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "board";
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export function PromptWorkspace({
  prompts,
  initialQuery = "",
  initialCreate = false,
}: {
  prompts: Prompt[];
  initialQuery?: string;
  initialCreate?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(prompts);
  const [view, setView] = React.useState<ViewMode>("grid");
  const [search, setSearch] = React.useState(initialQuery);
  const debouncedSearch = useDebouncedValue(search, 220);
  const [styleFilter, setStyleFilter] = React.useState("all");
  const [modelFilter, setModelFilter] = React.useState("all");
  const [cameraFilter, setCameraFilter] = React.useState("all");
  const [stageFilter, setStageFilter] = React.useState("all");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [sort, setSort] = React.useState<SortValue>("recent");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPrompt, setEditingPrompt] = React.useState<Prompt | null>(null);
  const [detailPrompt, setDetailPrompt] = React.useState<Prompt | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Prompt | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [usePrompt, setUsePrompt] = React.useState<Prompt | null>(null);
  const [useOpen, setUseOpen] = React.useState(false);

  React.useEffect(() => {
    setItems(prompts);
  }, [prompts]);

  React.useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  React.useEffect(() => {
    if (!initialCreate) return;
    setEditingPrompt(null);
    setFormOpen(true);
    router.replace("/prompts", { scroll: false });
  }, [initialCreate, router]);

  React.useEffect(() => {
    const stored = window.localStorage.getItem("synapse:prompt-view");
    if (stored === "grid" || stored === "board") setView(stored);
  }, []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.getAttribute("contenteditable") === "true";
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        setEditingPrompt(null);
        setFormOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function changeView(next: ViewMode) {
    setView(next);
    window.localStorage.setItem("synapse:prompt-view", next);
  }

  const allTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const prompt of items) {
      for (const tag of prompt.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [items]);

  const filtered = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const result = items.filter((prompt) => {
      if (styleFilter !== "all" && prompt.style !== styleFilter) return false;
      if (modelFilter !== "all" && prompt.model !== modelFilter) return false;
      if (cameraFilter !== "all" && prompt.camera !== cameraFilter) return false;
      if (stageFilter !== "all" && prompt.stage !== stageFilter) return false;
      if (favoritesOnly && !prompt.isFavorite) return false;
      if (selectedTag && !prompt.tags.includes(selectedTag)) return false;
      if (!query) return true;
      const haystack = [
        prompt.title,
        prompt.description,
        prompt.promptZh,
        prompt.promptEn,
        prompt.negativePrompt,
        ...prompt.tags,
        ...prompt.variables,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });

    result.sort((a, b) => {
      if (sort === "usage") return b.usageCount - a.usageCount;
      if (sort === "alpha") return a.title.localeCompare(b.title, "zh-CN");
      if (sort === "created") return b.createdAt.getTime() - a.createdAt.getTime();
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    return result;
  }, [
    items,
    debouncedSearch,
    styleFilter,
    modelFilter,
    cameraFilter,
    stageFilter,
    favoritesOnly,
    selectedTag,
    sort,
  ]);

  const activeFilterCount =
    Number(styleFilter !== "all") +
    Number(modelFilter !== "all") +
    Number(cameraFilter !== "all") +
    Number(stageFilter !== "all") +
    Number(favoritesOnly) +
    Number(Boolean(selectedTag)) +
    Number(sort !== "recent");

  function resetFilters() {
    setStyleFilter("all");
    setModelFilter("all");
    setCameraFilter("all");
    setStageFilter("all");
    setFavoritesOnly(false);
    setSelectedTag(null);
    setSort("recent");
  }

  function openCreate() {
    setEditingPrompt(null);
    setFormOpen(true);
  }

  function openEdit(prompt: Prompt) {
    setDetailOpen(false);
    setEditingPrompt(prompt);
    setFormOpen(true);
  }

  function handleSaved(saved: Prompt) {
    setItems((current) => {
      const exists = current.some((prompt) => prompt.id === saved.id);
      return exists
        ? current.map((prompt) => (prompt.id === saved.id ? saved : prompt))
        : [saved, ...current];
    });
    setDetailPrompt((current) => (current?.id === saved.id ? saved : current));
  }

  async function handleToggleFavorite(prompt: Prompt) {
    setItems((current) =>
      current.map((item) =>
        item.id === prompt.id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
    setDetailPrompt((current) =>
      current?.id === prompt.id ? { ...current, isFavorite: !current.isFavorite } : current,
    );
    const result = await togglePromptFavorite(prompt.id);
    if (!result.ok) {
      setItems((current) =>
        current.map((item) =>
          item.id === prompt.id ? { ...item, isFavorite: prompt.isFavorite } : item,
        ),
      );
      toast.error(result.error);
    }
  }

  async function handleStageChange(prompt: Prompt, stage: string) {
    const previous = prompt.stage;
    setItems((current) =>
      current.map((item) => (item.id === prompt.id ? { ...item, stage } : item)),
    );
    const result = await setPromptStage(prompt.id, stage);
    if (!result.ok) {
      setItems((current) =>
        current.map((item) => (item.id === prompt.id ? { ...item, stage: previous } : item)),
      );
      toast.error(result.error);
      return;
    }
    toast.success("已移动到新阶段");
  }

  async function handleDuplicate(prompt: Prompt) {
    const result = await duplicatePrompt(prompt.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setItems((current) => [result.data, ...current]);
    toast.success("已复制 Prompt");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deletePrompt(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setItems((current) => current.filter((prompt) => prompt.id !== deleteTarget.id));
    if (detailPrompt?.id === deleteTarget.id) setDetailOpen(false);
    setDeleteTarget(null);
    toast.success("Prompt 已删除");
  }

  async function handleUse(prompt: Prompt) {
    if (prompt.variables.length > 0) {
      setDetailOpen(false);
      setUsePrompt(prompt);
      setUseOpen(true);
      return;
    }
    const text = prompt.promptZh || prompt.promptEn;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("完整 Prompt 已复制");
      setItems((current) =>
        current.map((item) =>
          item.id === prompt.id ? { ...item, usageCount: item.usageCount + 1 } : item,
        ),
      );
      void recordPromptUsage(prompt.id);
    } catch {
      toast.error("剪贴板不可用，请打开详情手动复制。");
    }
  }

  async function handleUsed(text: string, prompt: Prompt) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("最终 Prompt 已复制，可以直接去出图了");
      setUseOpen(false);
      setItems((current) =>
        current.map((item) =>
          item.id === prompt.id ? { ...item, usageCount: item.usageCount + 1 } : item,
        ),
      );
      void recordPromptUsage(prompt.id);
    } catch {
      toast.error("剪贴板不可用，请手动复制预览文本。");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索标题、Prompt、标签…"
            className="h-9 pl-9 pr-8"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="清空搜索"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </div>

        <Select value={styleFilter} onValueChange={setStyleFilter}>
          <SelectTrigger className="h-9 w-[118px]">
            <SelectValue placeholder="风格" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部风格</SelectItem>
            {STYLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="h-9 w-[128px]">
            <SelectValue placeholder="模型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部模型</SelectItem>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <SlidersHorizontal className="size-3.5" />
              筛选
              {activeFilterCount > 0 ? (
                <Badge variant="default" className="h-4 min-w-4 px-1 text-[9px]">
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[330px] p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold">细化筛选</div>
              <Button
                variant="ghost"
                size="xs"
                className="h-6 text-[10px] text-muted-foreground"
                onClick={resetFilters}
              >
                重置
              </Button>
            </div>

            <div className="mt-3 space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                镜头语言
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCameraFilter("all")}
                  className={cn(
                    "rounded-md border px-1 py-1.5 text-[10px] transition-colors",
                    cameraFilter === "all"
                      ? "border-brand/30 bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  全部
                </button>
                {CAMERA_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setCameraFilter(option.value)}
                    className={cn(
                      "rounded-md border px-1 py-1.5 text-[10px] transition-colors",
                      cameraFilter === option.value
                        ? "border-brand/30 bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                工作流阶段
              </Label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStageFilter("all")}
                  className={cn(
                    "rounded-md border px-1 py-1.5 text-[10px] transition-colors",
                    stageFilter === "all"
                      ? "border-brand/30 bg-brand/10 text-brand"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  全部
                </button>
                {STAGE_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setStageFilter(option.value)}
                    className={cn(
                      "rounded-md border px-1 py-1.5 text-[10px] transition-colors",
                      stageFilter === option.value
                        ? "border-brand/30 bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                排序
              </Label>
              <div className="grid grid-cols-2 gap-1.5">
                {SORT_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] transition-colors",
                      sort === option.value
                        ? "border-brand/30 bg-brand/10 text-brand"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {option.value === "recent" ? <ArrowDownUp className="size-3" /> : null}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Star className="size-3.5 text-amber-400" />
                只看收藏
              </div>
              <Switch checked={favoritesOnly} onCheckedChange={setFavoritesOnly} />
            </div>
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex h-9 items-center rounded-lg border border-border bg-secondary/40 p-0.5">
            <button
              type="button"
              onClick={() => changeView("grid")}
              aria-label="列表视图"
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                view === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => changeView("board")}
              aria-label="看板视图"
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors",
                view === "board"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Columns3 className="size-3.5" />
            </button>
          </div>
          <Button variant="brand" size="sm" className="h-9 gap-1.5" onClick={openCreate}>
            <Plus className="size-3.5" />
            新建 Prompt
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <Sparkles className="size-3 text-brand" />
          <span className="font-medium text-foreground/80">{filtered.length}</span> / {items.length}{" "}
          条创意
        </div>
        <div className="h-3 w-px bg-border" />
        <button
          type="button"
          onClick={() => setSelectedTag(null)}
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] transition-colors",
            !selectedTag
              ? "border-brand/30 bg-brand/10 text-brand"
              : "border-border text-muted-foreground hover:bg-accent",
          )}
        >
          全部标签
        </button>
        {allTags.slice(0, 8).map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors",
              selectedTag === tag
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            <Tag className="size-2.5" />
            {tag}
          </button>
        ))}
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-2.5" />
            清除 {activeFilterCount} 个筛选
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={LibraryBig}
          title="这里还没有匹配的 Prompt"
          description={
            items.length === 0
              ? "建立你的第一条结构化 Prompt，把灵感、镜头语言和模型参数留在本地。"
              : "试着放宽筛选条件，或者创建一个新的创意。"
          }
          action={
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 ? (
                <Button variant="outline" onClick={resetFilters}>
                  <X />
                  清除筛选
                </Button>
              ) : null}
              <Button variant="brand" onClick={openCreate}>
                <Plus />
                新建 Prompt
              </Button>
            </div>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((prompt, index) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              index={index}
              onOpen={(value) => {
                setDetailPrompt(value);
                setDetailOpen(true);
              }}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggleFavorite={handleToggleFavorite}
              onStageChange={handleStageChange}
              onUse={handleUse}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <PromptBoard
          prompts={filtered}
          onOpen={(value) => {
            setDetailPrompt(value);
            setDetailOpen(true);
          }}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onToggleFavorite={handleToggleFavorite}
          onStageChange={handleStageChange}
          onUse={handleUse}
          onCreate={openCreate}
        />
      )}

      <PromptFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        prompt={editingPrompt}
        onSaved={handleSaved}
      />

      <PromptDetailSheet
        prompt={detailPrompt}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={openEdit}
        onDelete={(prompt) => {
          setDetailOpen(false);
          setDeleteTarget(prompt);
        }}
        onToggleFavorite={handleToggleFavorite}
        onUse={handleUse}
      />

      <PromptUseDialog
        open={useOpen}
        onOpenChange={setUseOpen}
        prompt={usePrompt}
        onUsed={handleUsed}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除这条 Prompt？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.title}」将从创意库移除。关联资产会保留，但不再指向这条 Prompt。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "删除中…" : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

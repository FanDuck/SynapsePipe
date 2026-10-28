"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Images,
  LayoutGrid,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AssetCard } from "@/components/gallery/asset-card";
import { AssetDetailDialog } from "@/components/gallery/asset-detail-dialog";
import { AssetUploadDialog } from "@/components/gallery/asset-upload-dialog";
import { EmptyState } from "@/components/shared/empty-state";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { deleteAsset, toggleAssetFavorite } from "@/lib/actions/assets";
import {
  ASSET_SORT_OPTIONS,
  CATEGORY_OPTIONS,
} from "@/lib/constants";
import type { Asset, PromptCatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type AssetSort = (typeof ASSET_SORT_OPTIONS)[number]["value"];
type TypeFilter = "all" | "image" | "video";

export function AssetGallery({
  assets,
  prompts,
  initialUpload = false,
}: {
  assets: Asset[];
  prompts: PromptCatalogItem[];
  initialUpload?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState(assets);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 220);
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<AssetSort>("newest");
  const [uploadOpen, setUploadOpen] = React.useState(initialUpload);
  const [detailAsset, setDetailAsset] = React.useState<Asset | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Asset | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => setItems(assets), [assets]);

  React.useEffect(() => {
    if (!initialUpload) return;
    setUploadOpen(true);
    router.replace("/gallery", { scroll: false });
  }, [initialUpload, router]);

  const allTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const asset of items) {
      for (const tag of asset.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [items]);

  const filtered = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const result = items.filter((asset) => {
      if (typeFilter !== "all" && asset.type !== typeFilter) return false;
      if (categoryFilter !== "all" && asset.category !== categoryFilter) return false;
      if (favoritesOnly && !asset.isFavorite) return false;
      if (selectedTag && !asset.tags.includes(selectedTag)) return false;
      if (!query) return true;
      return [asset.title, asset.promptSnapshot, asset.seed, asset.model, ...asset.tags]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    result.sort((a, b) => {
      if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (sort === "favorite") {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return result;
  }, [items, debouncedSearch, typeFilter, categoryFilter, favoritesOnly, selectedTag, sort]);

  const activeFilterCount =
    Number(typeFilter !== "all") +
    Number(categoryFilter !== "all") +
    Number(favoritesOnly) +
    Number(Boolean(selectedTag)) +
    Number(sort !== "newest");

  function resetFilters() {
    setTypeFilter("all");
    setCategoryFilter("all");
    setFavoritesOnly(false);
    setSelectedTag(null);
    setSort("newest");
  }

  function handleSaved(asset: Asset) {
    setItems((current) => [asset, ...current]);
  }

  async function handleToggleFavorite(asset: Asset) {
    setItems((current) =>
      current.map((item) =>
        item.id === asset.id ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    );
    setDetailAsset((current) =>
      current?.id === asset.id ? { ...current, isFavorite: !current.isFavorite } : current,
    );
    const result = await toggleAssetFavorite(asset.id);
    if (!result.ok) {
      setItems((current) =>
        current.map((item) =>
          item.id === asset.id ? { ...item, isFavorite: asset.isFavorite } : item,
        ),
      );
      toast.error(result.error);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAsset(deleteTarget.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setItems((current) => current.filter((asset) => asset.id !== deleteTarget.id));
    if (detailAsset?.id === deleteTarget.id) setDetailOpen(false);
    setDeleteTarget(null);
    toast.success("资产已从画廊移除");
  }

  const imageCount = items.filter((asset) => asset.type === "image").length;
  const videoCount = items.filter((asset) => asset.type === "video").length;
  const localCount = items.filter((asset) => asset.source === "upload").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "全部资产", value: items.length, hint: "ALL ASSETS" },
          { label: "图像", value: imageCount, hint: "IMAGES" },
          { label: "视频", value: videoCount, hint: "VIDEO" },
          { label: "本地文件", value: localCount, hint: "LOCAL FILES" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-3"
          >
            <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-muted-foreground/60">
              {stat.hint}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-[20px] font-semibold tracking-[-0.04em]">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索资产、Prompt、Seed…"
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

        <div className="flex h-9 items-center rounded-lg border border-border bg-secondary/40 p-0.5">
          {(
            [
              { value: "all", label: "全部" },
              { value: "image", label: "图像" },
              { value: "video", label: "视频" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTypeFilter(item.value)}
              className={cn(
                "rounded-md px-2.5 text-[10.5px] font-medium transition-colors",
                typeFilter === item.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[118px]">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => setSort(value as AssetSort)}>
          <SelectTrigger className="h-9 w-[122px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASSET_SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={favoritesOnly ? "secondary" : "outline"}
          size="sm"
          className={cn("h-9 gap-1.5", favoritesOnly && "border-amber-500/25 text-amber-500")}
          onClick={() => setFavoritesOnly((value) => !value)}
        >
          <Star className={cn("size-3.5", favoritesOnly && "fill-current")} />
          收藏
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-[10px] text-muted-foreground"
              onClick={resetFilters}
            >
              <SlidersHorizontal className="size-3" />
              清除 {activeFilterCount}
            </Button>
          ) : null}
          <Button
            variant="brand"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="size-3.5" />
            收录资产
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <LayoutGrid className="size-3 text-brand" />
          <span className="font-medium text-foreground/80">{filtered.length}</span> / {items.length}{" "}
          件资产
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
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Images}
          title="画廊里还没有匹配的资产"
          description={
            items.length === 0
              ? "上传第一张图像或视频，把 Prompt、Seed 和模型参数一起留档。" 
              : "试着调整筛选条件，或收录一件新资产。"
          }
          action={
            <Button variant="brand" onClick={() => setUploadOpen(true)}>
              <Upload />
              收录第一个资产
            </Button>
          }
        />
      ) : (
        <div className="columns-1 gap-3 sm:columns-2 xl:columns-3 2xl:columns-4">
          {filtered.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              onOpen={(value) => {
                setDetailAsset(value);
                setDetailOpen(true);
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      <AssetUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        prompts={prompts}
        onSaved={handleSaved}
      />

      <AssetDetailDialog
        asset={detailAsset}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        prompts={prompts}
        onToggleFavorite={handleToggleFavorite}
        onDelete={(asset) => {
          setDetailOpen(false);
          setDeleteTarget(asset);
        }}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>从画廊删除这件资产？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteTarget?.title}」的记录会被移除
              {deleteTarget?.source === "upload" ? "，本地文件也会一并删除" : ""}。此操作不可撤销。
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

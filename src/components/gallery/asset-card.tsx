"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Download,
  Maximize2,
  Play,
  Star,
} from "lucide-react";

import { AssetMedia, VideoBadge } from "@/components/gallery/asset-media";
import { RelativeTime } from "@/components/shared/relative-time";
import {
  getCategory,
  getOptionLabel,
  MODEL_OPTIONS,
} from "@/lib/constants";
import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AssetCard({
  asset,
  index = 0,
  onOpen,
  onToggleFavorite,
}: {
  asset: Asset;
  index?: number;
  onOpen: (asset: Asset) => void;
  onToggleFavorite: (asset: Asset) => void;
}) {
  const category = getCategory(asset.category);
  const ratio =
    asset.width && asset.height
      ? Math.min(1.62, Math.max(0.74, asset.width / asset.height))
      : 1.35;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.24) }}
      onClick={() => onOpen(asset)}
      className="group relative mb-3 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-border/80 bg-card text-left transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)]"
      style={{ aspectRatio: ratio }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.035]">
          <AssetMedia
            asset={asset}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            priority={index < 4}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {asset.type === "video" ? <VideoBadge /> : null}
          <span className="rounded-full border border-white/12 bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white/80 backdrop-blur-md">
            {category.label}
          </span>
          {asset.source === "upload" ? (
            <span className="rounded-full border border-white/12 bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-md">
              LOCAL
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(asset);
          }}
          aria-label={asset.isFavorite ? "取消收藏" : "收藏"}
          className={cn(
            "flex size-7 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/60 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white",
            asset.isFavorite && "text-amber-300",
          )}
        >
          <Star className={cn("size-3.5", asset.isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 transition-transform duration-300 group-hover:translate-y-0">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-[13px] font-semibold tracking-tight text-white">
              {asset.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-white/55">
              <span className="font-mono uppercase">
                {getOptionLabel(MODEL_OPTIONS, asset.model)}
              </span>
              <span>·</span>
              <span>seed {asset.seed || "—"}</span>
              <span>·</span>
              <RelativeTime value={asset.createdAt} />
            </div>
            <div className="mt-2 flex max-h-0 flex-wrap gap-1 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-10 group-hover:opacity-100">
              {asset.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[8.5px] text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen(asset);
              }}
              className="flex size-7 items-center justify-center rounded-md border border-white/10 bg-black/45 text-white/75 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
              aria-label="查看详情"
            >
              <Maximize2 className="size-3" />
            </button>
            <a
              href={`/api/assets/${asset.id}/download`}
              onClick={(event) => event.stopPropagation()}
              className="flex size-7 items-center justify-center rounded-md border border-white/10 bg-black/45 text-white/75 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
              aria-label="下载资产"
            >
              <Download className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {asset.type === "video" ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white opacity-80 backdrop-blur-md transition-opacity group-hover:opacity-0">
          <Play className="ml-0.5 size-4 fill-current" />
        </div>
      ) : null}
    </motion.article>
  );
}

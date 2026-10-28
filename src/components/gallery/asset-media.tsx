"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff, Play } from "lucide-react";

import type { Asset } from "@/lib/types";
import { cn } from "@/lib/utils";

export const BLUR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%231b1428'/%3E%3Cstop offset='1' stop-color='%2309090b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='16' height='9' fill='url(%23g)'/%3E%3C/svg%3E";

export function SmartImage({
  src,
  alt,
  fit = "cover",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
  className,
}: {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/50 to-background text-muted-foreground">
        <ImageOff className="size-5 opacity-50" />
        <span className="text-[10px]">媒体加载失败</span>
      </div>
    );
  }

  return (
    <>
      {!loaded ? (
        <div className="skeleton-shimmer absolute inset-0" aria-hidden="true" />
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "transition-opacity duration-500",
          fit === "cover" ? "object-cover" : "object-contain",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}

export function AssetMedia({
  asset,
  fit = "cover",
  controls = false,
  priority = false,
  sizes,
  className,
}: {
  asset: Asset;
  fit?: "cover" | "contain";
  controls?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (asset.type === "video") {
    return (
      <video
        src={asset.url}
        muted={!controls}
        loop
        playsInline
        controls={controls}
        autoPlay={!controls}
        preload="metadata"
        className={cn(
          "absolute inset-0 h-full w-full bg-black",
          fit === "cover" ? "object-cover" : "object-contain",
          className,
        )}
      />
    );
  }

  return (
    <SmartImage
      src={asset.url}
      alt={asset.title}
      fit={fit}
      priority={priority}
      sizes={sizes}
    />
  );
}

export function VideoBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-md">
      <Play className="size-2.5 fill-current" />
      VIDEO
    </span>
  );
}

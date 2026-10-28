import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-border/70 pb-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-[440px] max-w-full" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[70px] rounded-xl" />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-full max-w-xs" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="ml-auto h-9 w-28" />
      </div>
      <div className="columns-1 gap-3 sm:columns-2 xl:columns-3 2xl:columns-4">
        {[1.35, 0.78, 1.2, 1.6, 0.9, 1.45, 1.05, 1.3].map((ratio, index) => (
          <Skeleton
            key={index}
            className="mb-3 w-full break-inside-avoid rounded-xl"
            style={{ aspectRatio: ratio }}
          />
        ))}
      </div>
    </div>
  );
}

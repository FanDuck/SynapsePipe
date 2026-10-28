import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 border-b border-border/70 pb-6">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-[520px] max-w-full" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)]">
        <div className="space-y-4">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-[280px] rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[210px] rounded-2xl" />
          <Skeleton className="h-[360px] rounded-2xl" />
          <Skeleton className="h-[240px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-border/70 pb-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-[500px] max-w-full" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Skeleton className="h-[620px] rounded-2xl" />
        <Skeleton className="h-[620px] rounded-2xl" />
      </div>
    </div>
  );
}

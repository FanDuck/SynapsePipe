import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[420px] rounded-2xl" />
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[118px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-[290px] rounded-2xl" />
        <Skeleton className="h-[290px] rounded-2xl" />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <Skeleton className="h-[250px] rounded-2xl" />
        <Skeleton className="h-[250px] rounded-2xl" />
      </div>
    </div>
  );
}

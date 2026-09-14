import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between py-3 border-b border-border/40">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="size-8 rounded-full" />
      </div>

      {/* 3-column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_320px] gap-6">
        {/* Left menu skeleton */}
        <div className="hidden lg:flex flex-col gap-3">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        {/* Center hero pizza skeleton */}
        <Card className="flex flex-col items-center p-6 gap-6">
          <Skeleton className="size-64 rounded-full" />
          <div className="w-full max-w-sm space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </Card>

        {/* Right updates column skeleton */}
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-28 mb-1" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

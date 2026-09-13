import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
      <DashboardSkeleton />
    </div>
  );
}

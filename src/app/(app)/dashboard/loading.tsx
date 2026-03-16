import { Skeleton } from "@/client/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="col-span-full space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Summary card skeletons */}
      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Larger content card skeletons */}
      <div className="col-span-1 md:col-span-2 rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>

      <div className="rounded-radius-card bg-card p-[var(--density-card-padding)] border border-border space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </>
  );
}

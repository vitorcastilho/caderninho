import { Skeleton } from "@/client/components/ui/skeleton";

export default function CreditCardsLoading() {
  return (
    <div className="col-span-full flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-card bg-card p-[var(--density-card-padding)] border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <div className="flex gap-1">
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-7 w-18" />
              </div>
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

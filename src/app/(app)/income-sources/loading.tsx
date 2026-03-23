import { Skeleton } from "@/client/components/ui/skeleton";

export default function IncomeSourcesLoading() {
  return (
    <div className="col-span-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-card bg-card p-[var(--density-card-padding)] border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-7 w-18" />
              </div>
            </div>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

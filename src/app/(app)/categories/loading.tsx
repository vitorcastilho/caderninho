import { Skeleton } from '@/client/components/ui/skeleton';

export default function CategoriesLoading() {
  return (
    <div className="col-span-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-card bg-card p-[var(--density-card-padding)] border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="space-y-2 pl-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

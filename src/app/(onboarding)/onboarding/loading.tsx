import { Skeleton } from '@/client/components/ui/skeleton';

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="mx-auto h-6 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-2 rounded-full" />
          ))}
        </div>
        <Skeleton className="mx-auto h-10 w-full max-w-xs" />
      </div>
    </div>
  );
}

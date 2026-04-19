import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function SkeletonCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex gap-1.5 mt-auto">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card">
      <Skeleton className="shrink-0 w-40 h-28 rounded-lg" />
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-20 shrink-0" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="flex gap-1.5 mt-auto">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

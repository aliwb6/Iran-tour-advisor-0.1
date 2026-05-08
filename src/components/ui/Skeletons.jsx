import { cn } from '@/lib/utils';

export function TourCardSkeleton({ className }) {
  return (
    <div className={cn("bg-card rounded-3xl overflow-hidden border border-border/50", className)}>
      <div className="aspect-[16/9] animate-pulse bg-muted" />
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 animate-pulse bg-muted rounded" />
        <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse bg-muted rounded" />
          <div className="h-4 w-2/3 animate-pulse bg-muted rounded" />
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-6 w-16 animate-pulse bg-muted rounded-full" />
          <div className="h-6 w-16 animate-pulse bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TourGridSkeleton({ count = 6, className }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TourDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[60vh] bg-muted" />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 w-2/3 bg-muted rounded" />
            <div className="h-6 w-full bg-muted rounded" />
            <div className="h-6 w-3/4 bg-muted rounded" />
            <div className="h-32 w-full bg-muted rounded" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-muted rounded-2xl" />
            <div className="h-24 bg-muted rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GuideCardSkeleton({ className }) {
  return (
    <div className={cn("p-6 rounded-2xl border border-border/50 bg-card", className)}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full animate-pulse bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-24 animate-pulse bg-muted rounded" />
          <div className="h-4 w-16 animate-pulse bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full animate-pulse bg-muted rounded" />
        <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse bg-muted rounded-full" />
        <div className="h-6 w-20 animate-pulse bg-muted rounded-full" />
      </div>
    </div>
  );
}

export function GuideGridSkeleton({ count = 6, className }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <GuideCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArticleCardSkeleton({ className }) {
  return (
    <div className={cn("", className)}>
      <div className="aspect-[4/3] rounded-2xl animate-pulse bg-muted mb-4" />
      <div className="h-4 w-20 animate-pulse bg-muted rounded mb-2" />
      <div className="h-6 w-3/4 animate-pulse bg-muted rounded mb-2" />
      <div className="h-4 w-full animate-pulse bg-muted rounded" />
    </div>
  );
}

export function ArticleGridSkeleton({ count = 3, className }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DestinationsSkeleton({ count = 6, className }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl animate-pulse bg-muted" />
      ))}
    </div>
  );
}

export function SearchResultsSkeleton({ count = 4, className }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl animate-pulse bg-muted" />
      ))}
    </div>
  );
}
import { Skeleton } from "@/components/ui/skeleton";

export function DressCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/30">
      {/* Image Section */}
      <div className="relative aspect-[3/4]">
        <Skeleton className="w-full h-full" />
        {/* Condition Badge */}
        <Skeleton className="absolute top-2 right-2 w-16 h-6 rounded-full" />
        {/* Like Button */}
        <Skeleton className="absolute top-2 left-2 w-8 h-8 rounded-full" />
        {/* Price Badge */}
        <Skeleton className="absolute bottom-2 right-2 w-20 h-7 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="p-3 space-y-2">
        <Skeleton className="h-5 w-3/4 mr-auto" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

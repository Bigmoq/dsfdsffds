import { Skeleton } from "@/components/ui/skeleton";

export function HallCardSkeleton() {
  return (
    <div className="card-luxe rounded-2xl overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48">
        <Skeleton className="w-full h-full" />
        {/* Price Badge */}
        <Skeleton className="absolute top-3 left-3 w-24 h-8 rounded-full" />
        {/* Favorite Button */}
        <Skeleton className="absolute top-3 right-3 w-10 h-10 rounded-full" />
      </div>
      
      {/* Details Section */}
      <div className="p-4 space-y-4">
        {/* Capacity */}
        <div className="flex items-center justify-end gap-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Availability */}
        <div className="space-y-3 pt-3 border-t border-border/50">
          <Skeleton className="h-4 w-24 mr-auto" />
          <div className="flex items-center justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded-full" />
                <Skeleton className="w-8 h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

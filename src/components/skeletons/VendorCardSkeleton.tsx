import { Skeleton } from "@/components/ui/skeleton";

export function VendorCardSkeleton() {
  return (
    <div className="card-luxe rounded-2xl overflow-hidden">
      {/* Image Section */}
      <div className="relative h-40">
        <Skeleton className="w-full h-full" />
        {/* Like Button */}
        <Skeleton className="absolute top-3 right-3 w-9 h-9 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="p-4 text-right space-y-3">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        {/* Location and Packages */}
        <div className="flex items-center justify-end gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        
        {/* Price and Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <Skeleton className="h-9 w-20 rounded-md" />
          <div className="text-right">
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

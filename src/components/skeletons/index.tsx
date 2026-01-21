import { HallCardSkeleton } from "./HallCardSkeleton";
import { VendorCardSkeleton } from "./VendorCardSkeleton";
import { DressCardSkeleton } from "./DressCardSkeleton";

export { HallCardSkeleton, VendorCardSkeleton, DressCardSkeleton };

interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
}

export function SkeletonGrid({ count = 4, columns = 2, children }: SkeletonGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </div>
  );
}

// Convenience components for common use cases
export function HallsLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonGrid count={count} columns={2}>
      <HallCardSkeleton />
    </SkeletonGrid>
  );
}

export function VendorsLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonGrid count={count} columns={2}>
      <VendorCardSkeleton />
    </SkeletonGrid>
  );
}

export function DressesLoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <SkeletonGrid count={count} columns={2}>
      <DressCardSkeleton />
    </SkeletonGrid>
  );
}

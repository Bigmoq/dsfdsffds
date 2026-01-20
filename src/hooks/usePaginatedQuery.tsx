import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef, useEffect } from "react";

interface PaginatedQueryOptions<T> {
  queryKey: string[];
  tableName: string;
  pageSize?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  select?: string;
  enabled?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  totalCount: number;
}

export function usePaginatedQuery<T>({
  queryKey,
  tableName,
  pageSize = 20,
  orderBy = { column: 'created_at', ascending: false },
  filters = {},
  select = '*',
  enabled = true,
}: PaginatedQueryOptions<T>): PaginatedResult<T> {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...queryKey, filters, orderBy],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(tableName as any)
        .select(select, { count: 'exact' })
        .range(from, to)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false });

      // Apply filters dynamically
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (typeof value === 'object' && 'gte' in value) {
            query = query.gte(key, value.gte);
          } else if (typeof value === 'object' && 'lte' in value) {
            query = query.lte(key, value.lte);
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data: items, error, count } = await query;

      if (error) throw error;

      return {
        items: items as T[],
        nextPage: items && items.length === pageSize ? pageParam + 1 : undefined,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled,
  });

  // Flatten all pages into a single array
  const allItems = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return {
    data: allItems,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    totalCount,
  };
}

// Hook for infinite scroll trigger
export function useInfiniteScroll(
  onLoadMore: () => void,
  hasNextPage: boolean,
  isFetchingNextPage: boolean
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const setLoadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (node && hasNextPage && !isFetchingNextPage) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        {
          rootMargin: '200px', // Start loading 200px before reaching the end
          threshold: 0.1,
        }
      );
      observerRef.current.observe(node);
    }

    loadMoreRef.current = node;
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return setLoadMoreRef;
}

// Props for the infinite scroll trigger component
interface InfiniteScrollTriggerProps {
  loadMoreRef: (node: HTMLDivElement | null) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

// Component for the infinite scroll trigger
export function InfiniteScrollTrigger({
  loadMoreRef,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollTriggerProps) {
  if (!hasNextPage && !isFetchingNextPage) return null;

  return (
    <div ref={loadMoreRef} className="flex justify-center py-8">
      {isFetchingNextPage && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-arabic text-sm">جاري تحميل المزيد...</span>
        </div>
      )}
    </div>
  );
}

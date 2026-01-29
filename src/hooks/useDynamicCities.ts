import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch unique cities from a specific table
 * Cities are dynamically populated based on actual data in the database
 */
export function useDynamicCities(tableName: 'public_halls' | 'public_service_providers' | 'public_dresses') {
  return useQuery({
    queryKey: ['dynamic-cities', tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('city')
        .not('city', 'is', null);

      if (error) {
        console.error(`Error fetching cities from ${tableName}:`, error);
        return [];
      }

      // Extract unique cities
      const uniqueCities = [...new Set(data?.map(item => item.city).filter(Boolean))] as string[];
      return uniqueCities.sort();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all unique cities across halls, services, and dresses
 */
export function useAllDynamicCities() {
  return useQuery({
    queryKey: ['all-dynamic-cities'],
    queryFn: async () => {
      // Fetch cities from all three tables in parallel
      const [hallsResult, servicesResult, dressesResult] = await Promise.all([
        supabase.from('public_halls').select('city').not('city', 'is', null),
        supabase.from('public_service_providers').select('city').not('city', 'is', null),
        supabase.from('public_dresses').select('city').not('city', 'is', null),
      ]);

      const allCities: string[] = [];
      
      if (hallsResult.data) {
        allCities.push(...hallsResult.data.map(item => item.city).filter(Boolean));
      }
      if (servicesResult.data) {
        allCities.push(...servicesResult.data.map(item => item.city).filter(Boolean));
      }
      if (dressesResult.data) {
        allCities.push(...dressesResult.data.map(item => item.city).filter(Boolean));
      }

      // Return unique sorted cities
      return [...new Set(allCities)].sort() as string[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

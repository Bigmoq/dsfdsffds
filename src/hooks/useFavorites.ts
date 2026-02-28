import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ['hall-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("hall_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data?.map(f => f.hall_id) || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isFavorite = useCallback((hallId: string) => {
    return favorites.includes(hallId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (hallId: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "سجل دخولك لحفظ القاعات المفضلة",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyFavorite = favorites.includes(hallId);
    
    // Optimistic update
    queryClient.setQueryData(['hall-favorites', user.id], (old: string[] = []) =>
      isCurrentlyFavorite ? old.filter(id => id !== hallId) : [...old, hallId]
    );

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("hall_id", hallId);
        if (error) throw error;
        toast({ title: "تمت الإزالة", description: "تم إزالة القاعة من المفضلة" });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, hall_id: hallId });
        if (error) throw error;
        toast({ title: "تمت الإضافة", description: "تم إضافة القاعة إلى المفضلة" });
      }
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(['hall-favorites', user.id], favorites);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث المفضلة", variant: "destructive" });
    }
  }, [user, favorites, toast, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['hall-favorites', user?.id] });
  }, [queryClient, user?.id]);

  return { favorites, loading, isFavorite, toggleFavorite, refetch };
}

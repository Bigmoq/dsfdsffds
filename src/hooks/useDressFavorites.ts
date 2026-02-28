import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useDressFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ['dress-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("dress_favorites")
        .select("dress_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data?.map(f => f.dress_id) || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isFavorite = useCallback((dressId: string) => {
    return favorites.includes(dressId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (dressId: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "سجل دخولك لحفظ الفساتين المفضلة",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyFavorite = favorites.includes(dressId);

    queryClient.setQueryData(['dress-favorites', user.id], (old: string[] = []) =>
      isCurrentlyFavorite ? old.filter(id => id !== dressId) : [...old, dressId]
    );

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("dress_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("dress_id", dressId);
        if (error) throw error;
        toast({ title: "تمت الإزالة", description: "تم إزالة الفستان من المفضلة" });
      } else {
        const { error } = await supabase
          .from("dress_favorites")
          .insert({ user_id: user.id, dress_id: dressId });
        if (error) throw error;
        toast({ title: "تمت الإضافة", description: "تم إضافة الفستان إلى المفضلة" });
      }
    } catch (error) {
      queryClient.setQueryData(['dress-favorites', user.id], favorites);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث المفضلة", variant: "destructive" });
    }
  }, [user, favorites, toast, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dress-favorites', user?.id] });
  }, [queryClient, user?.id]);

  return { favorites, loading, isFavorite, toggleFavorite, refetch };
}

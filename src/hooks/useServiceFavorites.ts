import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useServiceFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading: loading } = useQuery({
    queryKey: ['service-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("service_favorites")
        .select("provider_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data?.map(f => f.provider_id) || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isFavorite = useCallback((providerId: string) => {
    return favorites.includes(providerId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (providerId: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "سجل دخولك لحفظ الخدمات المفضلة",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyFavorite = favorites.includes(providerId);

    queryClient.setQueryData(['service-favorites', user.id], (old: string[] = []) =>
      isCurrentlyFavorite ? old.filter(id => id !== providerId) : [...old, providerId]
    );

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("service_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("provider_id", providerId);
        if (error) throw error;
        toast({ title: "تمت الإزالة", description: "تم إزالة الخدمة من المفضلة" });
      } else {
        const { error } = await supabase
          .from("service_favorites")
          .insert({ user_id: user.id, provider_id: providerId });
        if (error) throw error;
        toast({ title: "تمت الإضافة", description: "تم إضافة الخدمة إلى المفضلة" });
      }
    } catch (error) {
      queryClient.setQueryData(['service-favorites', user.id], favorites);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث المفضلة", variant: "destructive" });
    }
  }, [user, favorites, toast, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['service-favorites', user?.id] });
  }, [queryClient, user?.id]);

  return { favorites, loading, isFavorite, toggleFavorite, refetch };
}

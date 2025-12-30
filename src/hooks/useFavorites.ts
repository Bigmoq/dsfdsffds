import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("hall_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.hall_id) || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

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
    if (isCurrentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== hallId));
    } else {
      setFavorites(prev => [...prev, hallId]);
    }

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("hall_id", hallId);

        if (error) throw error;

        toast({
          title: "تمت الإزالة",
          description: "تم إزالة القاعة من المفضلة",
        });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, hall_id: hallId });

        if (error) throw error;

        toast({
          title: "تمت الإضافة",
          description: "تم إضافة القاعة إلى المفضلة",
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isCurrentlyFavorite) {
        setFavorites(prev => [...prev, hallId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== hallId));
      }

      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المفضلة",
        variant: "destructive",
      });
    }
  }, [user, favorites, toast]);

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}

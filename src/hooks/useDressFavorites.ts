import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useDressFavorites() {
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
        .from("dress_favorites")
        .select("dress_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.dress_id) || []);
    } catch (error) {
      console.error("Error fetching dress favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

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

    // Optimistic update
    if (isCurrentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== dressId));
    } else {
      setFavorites(prev => [...prev, dressId]);
    }

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("dress_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("dress_id", dressId);

        if (error) throw error;

        toast({
          title: "تمت الإزالة",
          description: "تم إزالة الفستان من المفضلة",
        });
      } else {
        const { error } = await supabase
          .from("dress_favorites")
          .insert({ user_id: user.id, dress_id: dressId });

        if (error) throw error;

        toast({
          title: "تمت الإضافة",
          description: "تم إضافة الفستان إلى المفضلة",
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isCurrentlyFavorite) {
        setFavorites(prev => [...prev, dressId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== dressId));
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

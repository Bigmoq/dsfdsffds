import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useServiceFavorites() {
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
        .from("service_favorites")
        .select("provider_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.provider_id) || []);
    } catch (error) {
      console.error("Error fetching service favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

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

    // Optimistic update
    if (isCurrentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== providerId));
    } else {
      setFavorites(prev => [...prev, providerId]);
    }

    try {
      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("service_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("provider_id", providerId);

        if (error) throw error;

        toast({
          title: "تمت الإزالة",
          description: "تم إزالة الخدمة من المفضلة",
        });
      } else {
        const { error } = await supabase
          .from("service_favorites")
          .insert({ user_id: user.id, provider_id: providerId });

        if (error) throw error;

        toast({
          title: "تمت الإضافة",
          description: "تم إضافة الخدمة إلى المفضلة",
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      if (isCurrentlyFavorite) {
        setFavorites(prev => [...prev, providerId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== providerId));
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

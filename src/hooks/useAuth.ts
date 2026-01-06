import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "user" | "hall_owner" | "service_provider" | "dress_seller" | "admin";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch role when user changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    // Fetch all roles for the user and prioritize admin role
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    if (data && data.length > 0) {
      // Prioritize admin role if user has multiple roles
      const adminRole = data.find(r => r.role === "admin");
      if (adminRole) {
        setRole("admin");
      } else {
        // Otherwise use the first non-user role, or fall back to user
        const vendorRole = data.find(r => r.role !== "user");
        setRole((vendorRole?.role || data[0].role) as AppRole);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return {
    user,
    session,
    loading,
    role,
    signOut,
    isAuthenticated: !!user,
    isVendor: role && role !== "user" && role !== "admin",
    isAdmin: role === "admin",
  };
}

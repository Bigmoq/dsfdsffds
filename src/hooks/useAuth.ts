import { useState, useEffect, useContext, createContext, useCallback, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

type AppRole = "user" | "hall_owner" | "service_provider" | "dress_seller" | "admin";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isVendor: boolean | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

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
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    if (data && data.length > 0) {
      const adminRole = data.find(r => r.role === "admin");
      if (adminRole) {
        setRole("admin");
      } else {
        const vendorRole = data.find(r => r.role !== "user");
        setRole((vendorRole?.role || data[0].role) as AppRole);
      }
    }
  };

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    role,
    signOut,
    isAuthenticated: !!user,
    isVendor: role ? role !== "user" && role !== "admin" : null,
    isAdmin: role === "admin",
  }), [user, session, loading, role, signOut]);

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dresses: {
        Row: {
          city: string
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_sold: boolean | null
          price: number
          seller_id: string
          size: string
          title: string
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          city: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_sold?: boolean | null
          price: number
          seller_id: string
          size: string
          title: string
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          city?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_sold?: boolean | null
          price?: number
          seller_id?: string
          size?: string
          title?: string
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dresses_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_availability: {
        Row: {
          date: string
          hall_id: string
          id: string
          notes: string | null
          resale_discount: number | null
          status: Database["public"]["Enums"]["availability_status"] | null
        }
        Insert: {
          date: string
          hall_id: string
          id?: string
          notes?: string | null
          resale_discount?: number | null
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Update: {
          date?: string
          hall_id?: string
          id?: string
          notes?: string | null
          resale_discount?: number | null
          status?: Database["public"]["Enums"]["availability_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "hall_availability_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_bookings: {
        Row: {
          booking_date: string
          created_at: string | null
          guest_count_men: number | null
          guest_count_women: number | null
          hall_id: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_id: string | null
          total_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string | null
          guest_count_men?: number | null
          guest_count_women?: number | null
          hall_id: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_id?: string | null
          total_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string | null
          guest_count_men?: number | null
          guest_count_women?: number | null
          hall_id?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_id?: string | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hall_bookings_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hall_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      halls: {
        Row: {
          address: string | null
          capacity_men: number
          capacity_women: number
          city: string
          cover_image: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          gallery_images: string[] | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string | null
          owner_id: string
          price_weekday: number
          price_weekend: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity_men: number
          capacity_women: number
          city: string
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en?: string | null
          owner_id: string
          price_weekday: number
          price_weekend: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity_men?: number
          capacity_women?: number
          city?: string
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string | null
          owner_id?: string
          price_weekday?: number
          price_weekend?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "halls_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name_ar: string
          name_en: string | null
          price: number
          provider_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
          price: number
          provider_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
          price?: number
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          category_id: string
          city: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string | null
          owner_id: string
          phone: string | null
          portfolio_images: string[] | null
          rating: number | null
          reviews_count: number | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
          work_days: string[] | null
        }
        Insert: {
          category_id: string
          city: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en?: string | null
          owner_id: string
          phone?: string | null
          portfolio_images?: string[] | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
          work_days?: string[] | null
        }
        Update: {
          category_id?: string
          city?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string | null
          owner_id?: string
          phone?: string | null
          portfolio_images?: string[] | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
          work_days?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          applied_at: string | null
          business_description: string | null
          business_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          role: Database["public"]["Enums"]["vendor_role"]
          status: Database["public"]["Enums"]["vendor_status"] | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          business_description?: string | null
          business_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: Database["public"]["Enums"]["vendor_role"]
          status?: Database["public"]["Enums"]["vendor_status"] | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          business_description?: string | null
          business_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: Database["public"]["Enums"]["vendor_role"]
          status?: Database["public"]["Enums"]["vendor_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_status: "available" | "booked" | "resale"
      booking_status: "pending" | "accepted" | "rejected" | "cancelled"
      vendor_role: "hall_owner" | "service_provider" | "dress_seller"
      vendor_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: ["available", "booked", "resale"],
      booking_status: ["pending", "accepted", "rejected", "cancelled"],
      vendor_role: ["hall_owner", "service_provider", "dress_seller"],
      vendor_status: ["pending", "approved", "rejected"],
    },
  },
} as const

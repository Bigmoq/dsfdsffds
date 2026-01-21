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
      advertisements: {
        Row: {
          click_count: number | null
          created_at: string
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          position: string | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          click_count?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          click_count?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_category: string
          event_data: Json | null
          event_name: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_category: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_category?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          images: string[] | null
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          images?: string[] | null
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          images?: string[] | null
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          admin_response: string | null
          created_at: string
          id: string
          message: string
          reference_id: string | null
          reference_type: string | null
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message: string
          reference_id?: string | null
          reference_type?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          dress_id: string | null
          hall_id: string | null
          id: string
          participant_1: string
          participant_2: string
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dress_id?: string | null
          hall_id?: string | null
          id?: string
          participant_1: string
          participant_2: string
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dress_id?: string | null
          hall_id?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_dress_id_fkey"
            columns: ["dress_id"]
            isOneToOne: false
            referencedRelation: "dresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "public_halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      dress_favorites: {
        Row: {
          created_at: string
          dress_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dress_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dress_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dress_favorites_dress_id_fkey"
            columns: ["dress_id"]
            isOneToOne: false
            referencedRelation: "dresses"
            referencedColumns: ["id"]
          },
        ]
      }
      dresses: {
        Row: {
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
      favorites: {
        Row: {
          created_at: string
          hall_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hall_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hall_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "public_halls"
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
          {
            foreignKeyName: "hall_availability_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "public_halls"
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
            foreignKeyName: "hall_bookings_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "public_halls"
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
      hall_reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          hall_id: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          hall_id: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          hall_id?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hall_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "hall_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hall_reviews_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "halls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hall_reviews_hall_id_fkey"
            columns: ["hall_id"]
            isOneToOne: false
            referencedRelation: "public_halls"
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
          min_capacity_men: number | null
          min_capacity_women: number | null
          name_ar: string
          name_en: string | null
          owner_id: string
          phone: string | null
          price_per_chair_weekday: number | null
          price_per_chair_weekend: number | null
          price_weekday: number
          price_weekend: number
          pricing_type: string | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
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
          min_capacity_men?: number | null
          min_capacity_women?: number | null
          name_ar: string
          name_en?: string | null
          owner_id: string
          phone?: string | null
          price_per_chair_weekday?: number | null
          price_per_chair_weekend?: number | null
          price_weekday: number
          price_weekend: number
          pricing_type?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
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
          min_capacity_men?: number | null
          min_capacity_women?: number | null
          name_ar?: string
          name_en?: string | null
          owner_id?: string
          phone?: string | null
          price_per_chair_weekday?: number | null
          price_per_chair_weekend?: number | null
          price_weekday?: number
          price_weekend?: number
          pricing_type?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
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
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          phone: string | null
          updated_at: string | null
          vendor_welcome_seen: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string | null
          vendor_welcome_seen?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          updated_at?: string | null
          vendor_welcome_seen?: boolean | null
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          booking_date: string
          created_at: string
          id: string
          notes: string | null
          package_id: string | null
          provider_id: string
          status: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          provider_id: string
          status?: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          provider_id?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_favorites: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_favorites_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
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
      service_provider_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          provider_id: string
          status: Database["public"]["Enums"]["service_availability_status"]
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          provider_id: string
          status?: Database["public"]["Enums"]["service_availability_status"]
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          provider_id?: string
          status?: Database["public"]["Enums"]["service_availability_status"]
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          provider_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_reviews_provider_id_fkey"
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      public_halls: {
        Row: {
          address: string | null
          capacity_men: number | null
          capacity_women: number | null
          city: string | null
          cover_image: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          gallery_images: string[] | null
          id: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          min_capacity_men: number | null
          min_capacity_women: number | null
          name_ar: string | null
          name_en: string | null
          owner_id: string | null
          price_per_chair_weekday: number | null
          price_per_chair_weekend: number | null
          price_weekday: number | null
          price_weekend: number | null
          pricing_type: string | null
          updated_at: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          address?: string | null
          capacity_men?: number | null
          capacity_women?: number | null
          city?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_capacity_men?: number | null
          min_capacity_women?: number | null
          name_ar?: string | null
          name_en?: string | null
          owner_id?: string | null
          price_per_chair_weekday?: number | null
          price_per_chair_weekend?: number | null
          price_weekday?: number | null
          price_weekend?: number | null
          pricing_type?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          address?: string | null
          capacity_men?: number | null
          capacity_women?: number | null
          city?: string | null
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          gallery_images?: string[] | null
          id?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_capacity_men?: number | null
          min_capacity_women?: number | null
          name_ar?: string | null
          name_en?: string | null
          owner_id?: string | null
          price_per_chair_weekday?: number | null
          price_per_chair_weekend?: number | null
          price_weekday?: number | null
          price_weekend?: number | null
          pricing_type?: string | null
          updated_at?: string | null
          whatsapp_enabled?: boolean | null
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
    }
    Functions: {
      get_hall_rating: {
        Args: { hall_uuid: string }
        Returns: {
          average_rating: number
          reviews_count: number
        }[]
      }
      get_service_provider_rating: {
        Args: { provider_uuid: string }
        Returns: {
          average_rating: number
          reviews_count: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "user"
        | "hall_owner"
        | "service_provider"
        | "dress_seller"
        | "admin"
      availability_status: "available" | "booked" | "resale"
      booking_status: "pending" | "accepted" | "rejected" | "cancelled"
      service_availability_status: "available" | "booked" | "unavailable"
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
      app_role: [
        "user",
        "hall_owner",
        "service_provider",
        "dress_seller",
        "admin",
      ],
      availability_status: ["available", "booked", "resale"],
      booking_status: ["pending", "accepted", "rejected", "cancelled"],
      service_availability_status: ["available", "booked", "unavailable"],
      vendor_role: ["hall_owner", "service_provider", "dress_seller"],
      vendor_status: ["pending", "approved", "rejected"],
    },
  },
} as const

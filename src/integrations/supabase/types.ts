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
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_visible: boolean | null
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_visible?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_visible?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          accent_color_hex: string | null
          bg_card_hex: string | null
          bg_main_hex: string | null
          body_font_family: string | null
          border_color_hex: string | null
          border_radius: string | null
          button_theme: Json | null
          company_name: string | null
          font_family: string | null
          heading_font_family: string | null
          hero_theme: Json | null
          id: string
          imprint_address: string | null
          imprint_company: string | null
          imprint_contact: string | null
          imprint_legal: string | null
          inserted_at: string | null
          logo_path: string | null
          navigation_theme: Json | null
          primary_color_hex: string | null
          secondary_color_hex: string | null
          surface_theme: Json | null
          text_main_hex: string | null
          text_muted_hex: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color_hex?: string | null
          bg_card_hex?: string | null
          bg_main_hex?: string | null
          body_font_family?: string | null
          border_color_hex?: string | null
          border_radius?: string | null
          button_theme?: Json | null
          company_name?: string | null
          font_family?: string | null
          heading_font_family?: string | null
          hero_theme?: Json | null
          id?: string
          imprint_address?: string | null
          imprint_company?: string | null
          imprint_contact?: string | null
          imprint_legal?: string | null
          inserted_at?: string | null
          logo_path?: string | null
          navigation_theme?: Json | null
          primary_color_hex?: string | null
          secondary_color_hex?: string | null
          surface_theme?: Json | null
          text_main_hex?: string | null
          text_muted_hex?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color_hex?: string | null
          bg_card_hex?: string | null
          bg_main_hex?: string | null
          body_font_family?: string | null
          border_color_hex?: string | null
          border_radius?: string | null
          button_theme?: Json | null
          company_name?: string | null
          font_family?: string | null
          heading_font_family?: string | null
          hero_theme?: Json | null
          id?: string
          imprint_address?: string | null
          imprint_company?: string | null
          imprint_contact?: string | null
          imprint_legal?: string | null
          inserted_at?: string | null
          logo_path?: string | null
          navigation_theme?: Json | null
          primary_color_hex?: string | null
          secondary_color_hex?: string | null
          surface_theme?: Json | null
          text_main_hex?: string | null
          text_muted_hex?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          background_image_path: string | null
          background_mobile_image_path: string | null
          badge_text: string | null
          cta_text: string | null
          headline: string | null
          id: string
          image_path: string | null
          overlay_opacity: number | null
          stat1_label: string | null
          stat1_value: string | null
          stat2_label: string | null
          stat2_value: string | null
          stat3_label: string | null
          stat3_value: string | null
          subheadline: string | null
          updated_at: string
        }
        Insert: {
          background_image_path?: string | null
          background_mobile_image_path?: string | null
          badge_text?: string | null
          cta_text?: string | null
          headline?: string | null
          id?: string
          image_path?: string | null
          overlay_opacity?: number | null
          stat1_label?: string | null
          stat1_value?: string | null
          stat2_label?: string | null
          stat2_value?: string | null
          stat3_label?: string | null
          stat3_value?: string | null
          subheadline?: string | null
          updated_at?: string
        }
        Update: {
          background_image_path?: string | null
          background_mobile_image_path?: string | null
          badge_text?: string | null
          cta_text?: string | null
          headline?: string | null
          id?: string
          image_path?: string | null
          overlay_opacity?: number | null
          stat1_label?: string | null
          stat1_value?: string | null
          stat2_label?: string | null
          stat2_value?: string | null
          stat3_label?: string | null
          stat3_value?: string | null
          subheadline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          name: string
          phone: string | null
          service: string | null
          website: string | null
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          service?: string | null
          website?: string | null
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          service?: string | null
          website?: string | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          price: number
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          price: number
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          price?: number
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string
          id: string
          is_visible: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          is_visible?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          is_visible?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          image_url: string | null
          is_visible: boolean | null
          linkedin_url: string | null
          name: string
          role: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          linkedin_url?: string | null
          name: string
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          linkedin_url?: string | null
          name?: string
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string
          id: string
          image_url: string | null
          is_visible: boolean | null
          name: string
          quote: string | null
          rating: number | null
          role: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          name: string
          quote?: string | null
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          name?: string
          quote?: string | null
          rating?: number | null
          role?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

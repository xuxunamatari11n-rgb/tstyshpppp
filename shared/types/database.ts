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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          delivery_instructions: string | null
          district: string | null
          id: string
          is_default: boolean
          label: string
          recipient_name: string
          recipient_phone: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          delivery_instructions?: string | null
          district?: string | null
          id?: string
          is_default?: boolean
          label: string
          recipient_name: string
          recipient_phone: string
          street: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          delivery_instructions?: string | null
          district?: string | null
          id?: string
          is_default?: boolean
          label?: string
          recipient_name?: string
          recipient_phone?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_path: string | null
          is_featured: boolean
          is_root: boolean | null
          is_visible: boolean
          parent_id: string | null
          parent_is_root: boolean | null
          slug: string
          sort_order: number
          stable_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_path?: string | null
          is_featured?: boolean
          is_root?: boolean | null
          is_visible?: boolean
          parent_id?: string | null
          parent_is_root?: boolean | null
          slug: string
          sort_order?: number
          stable_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_path?: string | null
          is_featured?: boolean
          is_root?: boolean | null
          is_visible?: boolean
          parent_id?: string | null
          parent_is_root?: boolean | null
          slug?: string
          sort_order?: number
          stable_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_parent_is_root_fkey"
            columns: ["parent_id", "parent_is_root"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "is_root"]
          },
        ]
      }
      category_translations: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          image_alt: string | null
          locale: Database["public"]["Enums"]["shop_locale"]
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          image_alt?: string | null
          locale: Database["public"]["Enums"]["shop_locale"]
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          image_alt?: string | null
          locale?: Database["public"]["Enums"]["shop_locale"]
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: Json
          created_at: string
          height: number
          id: string
          is_cutout: boolean
          product_id: string
          sort_order: number
          storage_path: string
          updated_at: string
          width: number
        }
        Insert: {
          alt?: Json
          created_at?: string
          height?: number
          id?: string
          is_cutout?: boolean
          product_id: string
          sort_order?: number
          storage_path: string
          updated_at?: string
          width?: number
        }
        Update: {
          alt?: Json
          created_at?: string
          height?: number
          id?: string
          is_cutout?: boolean
          product_id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string
          id: string
          label: Json
          product_id: string
          sort_order: number
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          label: Json
          product_id: string
          sort_order?: number
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          label?: Json
          product_id?: string
          sort_order?: number
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_translations: {
        Row: {
          created_at: string
          full_description: string | null
          keywords: string[]
          locale: Database["public"]["Enums"]["shop_locale"]
          name: string
          product_id: string
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_description?: string | null
          keywords?: string[]
          locale: Database["public"]["Enums"]["shop_locale"]
          name: string
          product_id: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_description?: string | null
          keywords?: string[]
          locale?: Database["public"]["Enums"]["shop_locale"]
          name?: string
          product_id?: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_translations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          bestseller_rank: number | null
          category_id: string
          comparison_price: number | null
          created_at: string
          id: string
          is_available: boolean
          is_featured: boolean
          is_new_arrival: boolean
          is_visible: boolean
          price: number
          published_at: string | null
          sku: string | null
          slug: string
          sort_order: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          bestseller_rank?: number | null
          category_id: string
          comparison_price?: number | null
          created_at?: string
          id?: string
          is_available?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          is_visible?: boolean
          price: number
          published_at?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          bestseller_rank?: number | null
          category_id?: string
          comparison_price?: number | null
          created_at?: string
          id?: string
          is_available?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          is_visible?: boolean
          price?: number
          published_at?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          first_name?: string
          id: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          announcement: Json
          created_at: string
          currency_symbol: string
          id: string
          is_open: boolean
          singleton: boolean
          store_name: string
          support_email: string | null
          support_information: Json
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          announcement?: Json
          created_at?: string
          currency_symbol?: string
          id?: string
          is_open?: boolean
          singleton?: boolean
          store_name: string
          support_email?: string | null
          support_information?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          announcement?: Json
          created_at?: string
          currency_symbol?: string
          id?: string
          is_open?: boolean
          singleton?: boolean
          store_name?: string
          support_email?: string | null
          support_information?: Json
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["shop_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["shop_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["shop_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      regie_products: { Args: { filters?: Json }; Returns: Json }
      regie_categories: { Args: Record<PropertyKey, never>; Returns: Json }
      regie_store_product: { Args: { payload: Json }; Returns: string }
      regie_visibility: { Args: { target: string; visible: boolean }; Returns: undefined }
      regie_store_category: { Args: { payload: Json }; Returns: string }
      set_default_address: { Args: { address_id: string }; Returns: undefined }
      shop_catalogue: {
        Args: {
          filters?: Json
          language?: Database["public"]["Enums"]["shop_locale"]
        }
        Returns: Json
      }
      shop_categories: {
        Args: { language?: Database["public"]["Enums"]["shop_locale"] }
        Returns: Json
      }
    }
    Enums: {
      shop_locale: "fr" | "es"
      shop_role: "customer" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      shop_locale: ["fr", "es"],
      shop_role: ["customer", "admin"],
    },
  },
} as const

export type ShopLocale = Database['public']['Enums']['shop_locale']
export type ShopRole = Database['public']['Enums']['shop_role']
export type ShopRow<TableName extends keyof Database['public']['Tables']> = Database['public']['Tables'][TableName]['Row']

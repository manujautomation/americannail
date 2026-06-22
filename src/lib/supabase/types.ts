export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zip: string;
          phone: string;
          email: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          role: "owner" | "admin" | "staff" | "customer";
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string;
          location_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      employees: {
        Row: {
          id: string;
          profile_id: string | null;
          location_id: string;
          display_name: string;
          role: string;
          specialty: string | null;
          bio: string | null;
          years_experience: number;
          avatar_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["service_categories"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["service_categories"]["Insert"]>;
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          location_id: string;
          name: string;
          description: string | null;
          duration_min: number;
          price_min: number | null;
          price_max: number | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
      };
      appointments: {
        Row: {
          id: string;
          reference: string;
          location_id: string;
          customer_id: string | null;
          employee_id: string | null;
          service_id: string;
          status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          appointment_date: string;
          appointment_time: string;
          duration_min: number;
          first_name: string;
          last_name: string;
          phone: string;
          email: string | null;
          notes: string | null;
          source: "online" | "phone" | "walk_in" | "admin";
          demo_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          location_id: string;
          reference: string;
          name: string;
          phone: string;
          email: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          message: string;
          status: "new" | "read" | "contacted" | "booked" | "closed";
          source: "concierge" | "contact_form" | "website";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          location_id: string;
          status: "active" | "unsubscribed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["newsletter_subscribers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          location_id: string;
          customer_id: string | null;
          customer_name: string;
          rating: number;
          text: string;
          service_name: string | null;
          source: "google" | "internal" | "demo";
          is_featured: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      gallery: {
        Row: {
          id: string;
          location_id: string;
          image_url: string;
          alt_text: string;
          service_id: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gallery"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["gallery"]["Insert"]>;
      };
      reward_points: {
        Row: {
          id: string;
          customer_id: string;
          balance: number;
          lifetime_earned: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reward_points"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reward_points"]["Insert"]>;
      };
      reward_history: {
        Row: {
          id: string;
          customer_id: string;
          appointment_id: string | null;
          points: number;
          type: "earned" | "redeemed" | "bonus" | "expired" | "adjusted";
          description: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reward_history"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["reward_history"]["Insert"]>;
      };
      memberships: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_monthly: number;
          benefits: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["memberships"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
      };
      coupons: {
        Row: {
          id: string;
          location_id: string;
          code: string;
          description: string;
          discount_type: "percent" | "fixed";
          discount_value: number;
          min_spend: number | null;
          max_uses: number | null;
          uses_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["coupons"]["Row"], "id" | "created_at" | "uses_count">;
        Update: Partial<Database["public"]["Tables"]["coupons"]["Insert"]>;
      };
      gift_cards: {
        Row: {
          id: string;
          code: string;
          initial_balance: number;
          current_balance: number;
          purchaser_email: string | null;
          recipient_email: string | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gift_cards"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["gift_cards"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          location_id: string;
          supplier_id: string | null;
          name: string;
          sku: string | null;
          barcode: string | null;
          category: string;
          purchase_price: number | null;
          retail_price: number | null;
          current_qty: number;
          min_qty: number;
          storage_location: string | null;
          expiration_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["suppliers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
      };
      purchase_orders: {
        Row: {
          id: string;
          location_id: string;
          supplier_id: string;
          reference: string;
          status: "draft" | "pending" | "approved" | "ordered" | "partially_received" | "received" | "cancelled";
          notes: string | null;
          total_amount: number;
          ordered_at: string | null;
          expected_at: string | null;
          received_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["purchase_orders"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["purchase_orders"]["Insert"]>;
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          inventory_id: string;
          qty_ordered: number;
          qty_received: number;
          unit_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["purchase_order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["purchase_order_items"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
      settings: {
        Row: {
          id: string;
          location_id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

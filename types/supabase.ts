export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          company_name: string | null
          role: 'CLIENT' | 'ADMIN' | 'SUPPORT' | 'TECHNICIAN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          company_name?: string | null
          role?: 'CLIENT' | 'ADMIN' | 'SUPPORT' | 'TECHNICIAN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          company_name?: string | null
          role?: 'CLIENT' | 'ADMIN' | 'SUPPORT' | 'TECHNICIAN'
          created_at?: string
          updated_at?: string
        }
      }
      service_categories: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon?: string | null
        }
      }
      services: {
        Row: {
          id: number
          name: string
          description: string
          base_price: number
          category_id: number
          estimated_duration: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          base_price: number
          category_id: number
          estimated_duration?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          base_price?: number
          category_id?: number
          estimated_duration?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      service_options: {
        Row: {
          id: number
          service_id: number
          name: string
          description: string | null
          price_modifier: number
          required: boolean
        }
        Insert: {
          id?: number
          service_id: number
          name: string
          description?: string | null
          price_modifier: number
          required?: boolean
        }
        Update: {
          id?: number
          service_id?: number
          name?: string
          description?: string | null
          price_modifier?: number
          required?: boolean
        }
      }
      orders: {
        Row: {
          id: number
          user_id: string
          order_number: string
          total_amount: number
          status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          order_date: string
          estimated_delivery: string | null
          payment_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          order_number: string
          total_amount: number
          status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          order_date?: string
          estimated_delivery?: string | null
          payment_status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          order_number?: string
          total_amount?: number
          status?: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          order_date?: string
          estimated_delivery?: string | null
          payment_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          service_id: number
          unit_price: number
          quantity: number
          configuration: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          service_id: number
          unit_price: number
          quantity?: number
          configuration?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          service_id?: number
          unit_price?: number
          quantity?: number
          configuration?: Json | null
          created_at?: string
        }
      }
      interventions: {
        Row: {
          id: number
          order_item_id: number
          status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          scheduled_date: string | null
          completion_date: string | null
          technician_id: string | null
          report: Json | null
        }
        Insert: {
          id?: number
          order_item_id: number
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          scheduled_date?: string | null
          completion_date?: string | null
          technician_id?: string | null
          report?: Json | null
        }
        Update: {
          id?: number
          order_item_id?: number
          status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
          scheduled_date?: string | null
          completion_date?: string | null
          technician_id?: string | null
          report?: Json | null
        }
      }
      invoices: {
        Row: {
          id: number
          order_id: number
          invoice_number: string
          amount: number
          issue_date: string
          due_date: string
          status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
          payment_method: string | null
        }
        Insert: {
          id?: number
          order_id: number
          invoice_number: string
          amount: number
          issue_date?: string
          due_date: string
          status?: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
          payment_method?: string | null
        }
        Update: {
          id?: number
          order_id?: number
          invoice_number?: string
          amount?: number
          issue_date?: string
          due_date?: string
          status?: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'
          payment_method?: string | null
        }
      }
    }
    Views: {
      // Vues définies dans Supabase
    }
    Functions: {
      // Fonctions définies dans Supabase
    }
    Enums: {
      // Types énumérés définis dans Supabase
    }
  }
} 
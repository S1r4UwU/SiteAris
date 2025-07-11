export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface CustomerProfile {
  id: string;
  acquisition_source: string | null;
  lifetime_value: number;
  engagement_score: number;
  last_activity: string | null;
  company_size: string | null;
  industry: string | null;
  business_type: string | null;
  technical_level: 'NOVICE' | 'INTERMEDIATE' | 'EXPERT' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string | null;
  criteria: Record<string, any>;
  is_dynamic: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerSegmentMember {
  customer_id: string;
  segment_id: string;
  created_at: string;
}

export interface ServiceSLADefinition {
  id: string;
  service_id: string;
  response_time_minutes: number;
  resolution_time_minutes: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  business_hours_only: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterventionSLATracking {
  id: string;
  intervention_id: string;
  sla_definition_id: string | null;
  start_time: string;
  target_response_time: string | null;
  actual_response_time: string | null;
  target_resolution_time: string | null;
  actual_resolution_time: string | null;
  status: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'BREACHED';
  breach_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  type: 'EMAIL' | 'PHONE' | 'CHAT' | 'MEETING' | 'OTHER';
  subject: string | null;
  content: string | null;
  staff_id: string | null;
  related_order_id: string | null;
  interaction_date: string;
  created_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  query_definition: Record<string, any>;
  chart_type: 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'CARD' | 'CUSTOM';
  permissions: Record<string, any> | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedReport {
  id: string;
  template_id: string | null;
  name: string;
  parameters: Record<string, any> | null;
  result_data: Record<string, any> | null;
  created_by: string | null;
  created_at: string;
}

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
      customer_profiles: {
        Row: CustomerProfile;
        Insert: Omit<CustomerProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerProfile, 'created_at' | 'updated_at'>>;
      };
      customer_segments: {
        Row: CustomerSegment;
        Insert: Omit<CustomerSegment, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerSegment, 'created_at' | 'updated_at'>>;
      };
      customer_segment_members: {
        Row: CustomerSegmentMember;
        Insert: Omit<CustomerSegmentMember, 'created_at'>;
        Update: Partial<Omit<CustomerSegmentMember, 'created_at'>>;
      };
      service_sla_definitions: {
        Row: ServiceSLADefinition;
        Insert: Omit<ServiceSLADefinition, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceSLADefinition, 'created_at' | 'updated_at'>>;
      };
      intervention_sla_tracking: {
        Row: InterventionSLATracking;
        Insert: Omit<InterventionSLATracking, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InterventionSLATracking, 'created_at' | 'updated_at'>>;
      };
      customer_interactions: {
        Row: CustomerInteraction;
        Insert: Omit<CustomerInteraction, 'created_at'>;
        Update: Partial<Omit<CustomerInteraction, 'created_at'>>;
      };
      report_templates: {
        Row: ReportTemplate;
        Insert: Omit<ReportTemplate, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ReportTemplate, 'created_at' | 'updated_at'>>;
      };
      saved_reports: {
        Row: SavedReport;
        Insert: Omit<SavedReport, 'created_at'>;
        Update: Partial<Omit<SavedReport, 'created_at'>>;
      };
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
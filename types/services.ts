// Types pour le catalogue de services

// Type pour les catégories de services
export type ServiceCategory = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Type pour les services
export type Service = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string | null;
  base_price: number;
  display_price: string | null;
  estimated_duration: string | null;
  complexity_level: 'faible' | 'moyen' | 'élevé' | null;
  icon: string | null;
  image_url: string | null;
  features: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ServiceCategory;
  options?: ServiceOption[];
  tags?: ServiceTag[];
};

// Type pour les options de services
export type ServiceOption = {
  id: string;
  service_id: string;
  option_name: string;
  option_type: 'number' | 'select' | 'boolean' | 'range';
  price_modifier: number;
  price_multiplier: boolean;
  description: string | null;
  min_value: number | null;
  max_value: number | null;
  default_value: string | null;
  available_values: Record<string, string> | null;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Type pour les règles de tarification
export type ServicePricing = {
  id: string;
  service_id: string;
  rule_name: string;
  rule_type: 'fixed' | 'percentage' | 'formula';
  rule_value: string;
  conditions: {
    option_name: string;
    option_value: string;
  } | null;
  created_at: string;
  updated_at: string;
};

// Type pour les tags de services
export type ServiceTag = {
  id: string;
  name: string;
  created_at: string;
};

// Type pour les filtres de services
export type ServiceFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  complexity?: ('faible' | 'moyen' | 'élevé')[];
  tags?: string[];
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
};

// Type pour la réponse paginée
export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// Type pour le calcul de prix
export type PriceCalculationRequest = {
  service_id: string;
  options: {
    [key: string]: string | number | boolean;
  };
};

export type PriceCalculationResponse = {
  base_price: number;
  options_price: number;
  total_price: number;
  breakdown: {
    name: string;
    price: number;
  }[];
  display_price: string;
  estimated_duration: string | null;
}; 
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { supabaseConfig } from './config';
import { 
  Service, 
  ServiceCategory, 
  ServiceFilters, 
  ServiceTag,
  PaginatedResponse
} from '@/types/services';

// Fonction pour créer un client Supabase côté serveur
const createServerClient = async () => {
  return createServerComponentClient<Database>(
    { cookies },
    {
      supabaseUrl: supabaseConfig.supabaseUrl,
      supabaseKey: supabaseConfig.supabaseKey
    }
  );
};

// Fonctions côté serveur
export const serviceServer = {
  // Récupérer toutes les catégories de services
  async getCategories(): Promise<ServiceCategory[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('sort_order');
    
    if (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
    
    return data || [];
  },

  // Récupérer les services mis en avant
  async getFeaturedServices(): Promise<Service[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(id, name, slug, icon, color)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Erreur lors de la récupération des services mis en avant:', error);
      return [];
    }
    
    return data || [];
  },

  // Récupérer les services filtrés et paginés
  async getServices(filters: ServiceFilters): Promise<PaginatedResponse<Service>> {
    const {
      category,
      minPrice,
      maxPrice,
      complexity,
      tags,
      search,
      sort = 'name_asc',
      page = 1,
      limit = 9
    } = filters;

    const supabase = await createServerClient();
    let query = supabase
      .from('services')
      .select(`
        *,
        category:service_categories(id, name, slug, icon, color),
        tags:service_to_tags(service_tags(id, name))
      `, { count: 'exact' })
      .eq('is_active', true);

    // Filtres
    if (category) {
      query = query.eq('service_categories.slug', category);
    }
    
    if (minPrice !== undefined) {
      query = query.gte('base_price', minPrice);
    }
    
    if (maxPrice !== undefined) {
      query = query.lte('base_price', maxPrice);
    }
    
    if (complexity && complexity.length > 0) {
      query = query.in('complexity_level', complexity);
    }
    
    if (tags && tags.length > 0) {
      query = query.in('service_to_tags.service_tags.name', tags);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%, short_description.ilike.%${search}%, description.ilike.%${search}%`);
    }

    // Tri
    switch (sort) {
      case 'price_asc':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('base_price', { ascending: false });
        break;
      case 'name_desc':
        query = query.order('name', { ascending: false });
        break;
      case 'name_asc':
      default:
        query = query.order('name', { ascending: true });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des services:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      };
    }
    
    // Transformer les données pour simplifier les tags
    const transformedData = data?.map((service: any) => {
      const transformedTags = service.tags?.map((tag: any) => tag.service_tags) || [];
      return {
        ...service,
        tags: transformedTags
      };
    }) || [];

    return {
      data: transformedData,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    };
  },

  // Récupérer un service par son slug
  async getServiceBySlug(slug: string): Promise<Service | null> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(id, name, slug, icon, color),
        options:service_options(*),
        tags:service_to_tags(service_tags(id, name))
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération du service ${slug}:`, error);
      return null;
    }

    // Transformer les données pour simplifier les tags
    if (data) {
      const transformedTags = data.tags?.map((tag: any) => tag.service_tags) || [];
      return {
        ...data,
        tags: transformedTags
      };
    }
    
    return null;
  },

  // Récupérer les tags de services
  async getServiceTags(): Promise<ServiceTag[]> {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('service_tags')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erreur lors de la récupération des tags:', error);
      return [];
    }
    
    return data || [];
  }
}; 
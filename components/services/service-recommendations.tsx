'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

interface ServiceCategory {
  name: string;
  slug: string;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  base_price: number;
  category: ServiceCategory;
}

interface RawService {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  base_price: number;
  category: ServiceCategory[];
}

interface ServiceRecommendationsProps {
  currentServiceId: number;
  categoryId?: number;
}

export function ServiceRecommendations({ currentServiceId, categoryId }: ServiceRecommendationsProps) {
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendedServices() {
      try {
        setIsLoading(true);
        
        let query = supabaseClient
          .from('services')
          .select(`
            id,
            name,
            slug,
            short_description,
            base_price,
            category:categories(name, slug)
          `)
          .neq('id', currentServiceId)
          .eq('is_published', true)
          .limit(3);
          
        // Si nous avons un ID de catégorie, prioriser les services de la même catégorie
        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Erreur lors de la récupération des services recommandés:', error);
          return;
        }
        
        // Transformer les données pour assurer la compatibilité avec le type Service
        const formattedServices = (data as RawService[] || []).map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          short_description: item.short_description,
          base_price: item.base_price,
          category: {
            name: item.category[0]?.name || 'Non catégorisé',
            slug: item.category[0]?.slug || 'non-categorise'
          }
        }));
        
        setRecommendedServices(formattedServices);
      } catch (error) {
        console.error('Erreur lors de la récupération des services recommandés:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRecommendedServices();
  }, [currentServiceId, categoryId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Services recommandés</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedServices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Services recommandés</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {recommendedServices.map((service) => (
          <Link href={`/services/${service.slug}`} key={service.id}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {service.category.name}
                  </Badge>
                  <span className="font-semibold text-sm">
                    {formatPrice(service.base_price)}
                  </span>
                </div>
                <CardTitle className="text-base mb-1">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.short_description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 
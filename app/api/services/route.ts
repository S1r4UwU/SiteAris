import { NextRequest, NextResponse } from 'next/server';
import { serviceServer } from '@/lib/supabase/services';
import { ServiceFilters } from '@/types/services';

// GET /api/services - Récupérer les services avec filtres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraire les paramètres de filtrage
    const filters: ServiceFilters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      complexity: searchParams.get('complexity')?.split(',') as ('faible' | 'moyen' | 'élevé')[],
      tags: searchParams.get('tags')?.split(','),
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') as 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' || 'name_asc',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 9
    };

    const services = await serviceServer.getServices(filters);
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des services' },
      { status: 500 }
    );
  }
}

// POST /api/services/calculate-price - Calculer le prix d'un service avec options
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vérifier que les données requises sont présentes
    if (!body.service_id || !body.options) {
      return NextResponse.json(
        { error: 'Données de requête incomplètes' },
        { status: 400 }
      );
    }

    // Cette route est un placeholder pour le moment
    // La logique de calcul de prix sera implémentée dans une Edge Function Supabase
    return NextResponse.json({
      base_price: 0,
      options_price: 0,
      total_price: 0,
      breakdown: [],
      display_price: '0€',
      estimated_duration: null
    });
  } catch (error) {
    console.error('Erreur lors du calcul du prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du prix' },
      { status: 500 }
    );
  }
} 
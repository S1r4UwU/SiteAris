import { NextRequest, NextResponse } from 'next/server';
import { serviceServer } from '@/lib/supabase/services';

// GET /api/services/categories - Récupérer toutes les catégories de services
export async function GET(request: NextRequest) {
  try {
    const categories = await serviceServer.getCategories();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
} 
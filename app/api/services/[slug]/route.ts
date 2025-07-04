import { NextRequest, NextResponse } from 'next/server';
import { serviceServer } from '@/lib/supabase/services';

// GET /api/services/[slug] - Récupérer un service par son slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug de service manquant' },
        { status: 400 }
      );
    }

    const service = await serviceServer.getServiceBySlug(slug);
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error(`Erreur lors de la récupération du service ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du service' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

// Types pour les données de performance client
interface PerformanceData {
  url: string;
  navigationTiming: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  resourceTiming?: any[];
  userAgent: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, navigationTiming, resourceTiming, userAgent } = body as PerformanceData;
    const supabase = createServerComponentClient({ cookies });
    
    // Valider les données reçues
    if (!url || !navigationTiming || !userAgent) {
      return NextResponse.json(
        { error: "Données de performance incomplètes" },
        { status: 400 }
      );
    }
    
    // Récupérer la session pour associer les métriques à un utilisateur si connecté
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;
    
    // Enregistrer les métriques de performance
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        url,
        navigation_timing: navigationTiming,
        resource_timing: resourceTiming || [],
        user_id: userId,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Erreur lors de l\'enregistrement des métriques:', error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement des métriques de performance" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du traitement des métriques de performance:', error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// Endpoint pour récupérer les métriques de performance (accessible aux admins)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté et est admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Vérifier le rôle de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès restreint aux administrateurs" },
        { status: 403 }
      );
    }
    
    // Récupérer les paramètres de requête
    const url = request.nextUrl.searchParams.get('url');
    const startDate = request.nextUrl.searchParams.get('start_date');
    const endDate = request.nextUrl.searchParams.get('end_date');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    
    // Construire la requête
    let query = supabase
      .from('performance_metrics')
      .select('*');
    
    if (url) {
      query = query.eq('url', url);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Exécuter la requête
    const { data: metrics, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des métriques de performance" },
        { status: 500 }
      );
    }
    
    // Calculer des statistiques globales
    const avgLoadTime = metrics?.length 
      ? metrics.reduce((sum, m) => sum + (m.navigation_timing?.loadTime || 0), 0) / metrics.length 
      : 0;
      
    const avgDomContentLoaded = metrics?.length 
      ? metrics.reduce((sum, m) => sum + (m.navigation_timing?.domContentLoaded || 0), 0) / metrics.length 
      : 0;
    
    return NextResponse.json({
      metrics,
      stats: {
        count: metrics?.length || 0,
        avgLoadTime: Math.round(avgLoadTime),
        avgDomContentLoaded: Math.round(avgDomContentLoaded)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
} 
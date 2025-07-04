import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Récupération des paramètres de la requête
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier l'authentification de l'utilisateur
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || (userId && session.user.id !== userId)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Utiliser l'ID de l'utilisateur connecté si aucun n'est fourni
    const currentUserId = userId || session.user.id;
    
    // Récupérer les commandes actives (en cours, en attente)
    const { count: activeOrdersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUserId)
      .in('status', ['PENDING', 'PAID_DEPOSIT', 'IN_PROGRESS']);
    
    // Récupérer les commandes terminées
    const { count: completedOrdersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUserId)
      .eq('status', 'COMPLETED');
    
    // Récupérer le montant total dépensé
    const { data: orderAmounts } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', currentUserId)
      .not('status', 'eq', 'CANCELLED');
    
    let totalSpent = 0;
    if (orderAmounts) {
      totalSpent = orderAmounts.reduce((sum, order) => sum + Number(order.total_amount), 0);
    }
    
    // Récupérer les interventions planifiées à venir
    const { count: upcomingServicesCount } = await supabase
      .from('interventions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'SCHEDULED')
      .gt('scheduled_date', new Date().toISOString());
    
    // Construction de la réponse
    const metrics = {
      activeOrders: activeOrdersCount || 0,
      completedOrders: completedOrdersCount || 0,
      totalSpent,
      upcomingServices: upcomingServicesCount || 0,
      lastUpdateTime: new Date().toISOString()
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    // Vérifier si l'utilisateur est administrateur
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Accès refusé' },
        { status: 403 }
      );
    }
    
    // Récupérer les données du corps de la requête
    const { status, notes } = await req.json();
    
    // Valider les données
    if (!status) {
      return NextResponse.json(
        { message: 'Le statut est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si la commande existe
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json(
        { message: 'Commande non trouvée' },
        { status: 404 }
      );
    }
    
    // Mettre à jour le statut de la commande
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', params.id);
      
    if (updateError) {
      return NextResponse.json(
        { message: 'Erreur lors de la mise à jour du statut', error: updateError.message },
        { status: 500 }
      );
    }
    
    // Ajouter une entrée dans l'historique des statuts
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: params.id,
        status,
        notes: notes || null,
        created_by: session.user.id
      });
      
    if (historyError) {
      console.error('Erreur lors de l\'ajout à l\'historique:', historyError);
      // On continue malgré l'erreur d'historique
    }
    
    // Ajouter une notification pour le client
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', params.id)
      .single();
      
    if (orderData) {
      // Déterminer le message de notification en fonction du statut
      let title = 'Mise à jour de votre commande';
      let message = '';
      
      switch (status) {
        case 'PENDING':
          message = 'Votre commande est en attente de traitement.';
          break;
        case 'PAID_DEPOSIT':
          message = 'Nous avons bien reçu votre acompte. Votre commande est en cours de préparation.';
          break;
        case 'IN_PROGRESS':
          message = 'Votre commande est maintenant en cours de traitement.';
          break;
        case 'COMPLETED':
          message = 'Votre commande a été complétée avec succès.';
          break;
        case 'CANCELLED':
          message = 'Votre commande a été annulée.';
          break;
        default:
          message = `Le statut de votre commande a été mis à jour: ${status}`;
      }
      
      // Ajouter la notification
      await supabase
        .from('notifications')
        .insert({
          user_id: orderData.user_id,
          type: 'ORDER_UPDATE',
          title,
          message,
          action_url: `/account/orders/${params.id}`,
          metadata: {
            order_id: params.id,
            status
          }
        });
    }
    
    return NextResponse.json({
      message: 'Statut mis à jour avec succès',
      status
    });
    
  } catch (error) {
    console.error('Erreur dans la route PUT /api/admin/orders/[id]/status:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Récupérer l'historique des statuts d'une commande
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    // Vérifier si l'utilisateur est administrateur ou propriétaire de la commande
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', params.id)
      .single();
      
    const isAdmin = userData?.role === 'ADMIN';
    const isOwner = orderData?.user_id === session.user.id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: 'Accès refusé' },
        { status: 403 }
      );
    }
    
    // Récupérer l'historique des statuts
    const { data: history, error } = await supabase
      .from('order_status_history')
      .select(`
        id,
        status,
        notes,
        created_at,
        created_by,
        users (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('order_id', params.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      return NextResponse.json(
        { message: 'Erreur lors de la récupération de l\'historique', error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      history
    });
    
  } catch (error) {
    console.error('Erreur dans la route GET /api/admin/orders/[id]/status:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 
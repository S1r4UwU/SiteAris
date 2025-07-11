import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté et a les droits d'admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" }, 
        { status: 401 }
      );
    }
    
    // Récupérer les informations sur l'utilisateur pour vérifier son rôle
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPPORT')) {
      return NextResponse.json(
        { error: "Accès non autorisé" }, 
        { status: 403 }
      );
    }
    
    // Récupérer les données envoyées dans la requête
    const { newStatus, notes } = await req.json();
    
    if (!newStatus) {
      return NextResponse.json(
        { error: "Le nouveau statut est requis" }, 
        { status: 400 }
      );
    }
    
    // Valider le statut
    const validStatuses = ['PENDING', 'PAID_DEPOSIT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAID'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: "Statut non valide" }, 
        { status: 400 }
      );
    }
    
    // Récupérer la commande pour vérifier son statut actuel
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      return NextResponse.json(
        { error: "Commande non trouvée" }, 
        { status: 404 }
      );
    }
    
    // Mettre à jour le statut de la commande
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (updateError) {
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du statut de la commande" }, 
        { status: 500 }
      );
    }
    
    // Ajouter un événement pour le changement de statut
    const { error: eventError } = await supabase
      .from('order_events')
      .insert({
        order_id: orderId,
        event_type: `STATUT_${newStatus}`,
        description: notes || `Statut changé en ${newStatus}`,
        created_at: new Date().toISOString()
      });
    
    if (eventError) {
      console.error('Erreur lors de la création de l\'événement:', eventError);
      // On continue malgré l'erreur sur l'événement
    }
    
    // Créer une notification pour l'utilisateur
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id, // Idéalement, utiliser l'ID de l'utilisateur propriétaire de la commande
        type: 'ORDER_UPDATE',
        title: 'Mise à jour de commande',
        message: `Le statut de votre commande a été changé en ${newStatus}`,
        read: false,
        action_url: `/account/orders/${orderId}`,
        created_at: new Date().toISOString()
      });
    
    if (notifError) {
      console.error('Erreur lors de la création de la notification:', notifError);
      // On continue malgré l'erreur sur la notification
    }
    
    return NextResponse.json({
      success: true,
      message: "Statut de la commande mis à jour",
      status: newStatus
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" }, 
        { status: 401 }
      );
    }
    
    // Récupérer l'historique des statuts de la commande
    const { data: statusHistory, error } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
      
    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'historique des statuts" }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      statusHistory
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des statuts:', error);
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    );
  }
} 
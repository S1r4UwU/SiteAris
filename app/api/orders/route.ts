import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { CreateOrderParams } from '@/lib/supabase/orders';
import type { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, total_amount, deposit_amount, orderForm } = body as CreateOrderParams;
    
    // Validation de base
    if (!items || !items.length || !total_amount || !orderForm) {
      return NextResponse.json(
        { error: 'Données de commande invalides' },
        { status: 400 }
      );
    }
    
    // Validation des champs requis
    const requiredFields = ['client_name', 'client_email', 'billing_address'];
    for (const field of requiredFields) {
      if (!orderForm[field as keyof typeof orderForm]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }
    
    // Créer le client Supabase
    const supabase = createServerComponentClient<Database>({ cookies });
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }
    
    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount,
        deposit_amount,
        status: 'pending',
        payment_status: 'awaiting_payment',
        client_name: orderForm.client_name,
        client_email: orderForm.client_email,
        client_phone: orderForm.client_phone,
        client_company: orderForm.client_company,
        billing_address: orderForm.billing_address,
        intervention_address: orderForm.intervention_address || orderForm.billing_address,
        desired_date: orderForm.desired_date ? new Date(orderForm.desired_date).toISOString() : null,
        notes: orderForm.notes
      })
      .select('id, order_number')
      .single();
    
    if (orderError) {
      console.error('Erreur lors de la création de la commande:', orderError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      );
    }
    
    // Ajouter les éléments de commande
    const orderItems = items.map(item => ({
      order_id: order?.id,
      service_id: item.serviceId,
      quantity: item.quantity,
      unit_price: item.basePrice,
      total_price: item.totalPrice,
      configuration: item.options
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Erreur lors de l\'ajout des éléments de commande:', itemsError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout des éléments de commande' },
        { status: 500 }
      );
    }
    
    // Retourner la réponse
    return NextResponse.json({
      success: true,
      orderId: order?.id,
      orderNumber: order?.order_number
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Créer le client Supabase
    const supabase = createServerComponentClient<Database>({ cookies });
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }
    
    // Récupérer les commandes de l'utilisateur
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des commandes' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ orders });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    );
  }
} 
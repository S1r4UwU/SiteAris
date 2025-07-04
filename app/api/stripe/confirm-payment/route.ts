import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { stripeClient } from '@/lib/stripe/client';
import type { Database } from '@/types/supabase';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { paymentIntentId, customerInfo, shippingInfo } = await req.json();
    
    if (!paymentIntentId || !customerInfo) {
      return NextResponse.json(
        { error: 'Informations de paiement ou client manquantes' },
        { status: 400 }
      );
    }

    // Récupérer la session utilisateur
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }
    
    // Récupérer les détails du PaymentIntent
    const paymentIntent = await stripeClient.getPaymentIntent(paymentIntentId);
    
    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Impossible de récupérer les informations de paiement' },
        { status: 404 }
      );
    }
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Le paiement n'est pas confirmé. Statut: ${paymentIntent.status}` },
        { status: 400 }
      );
    }
    
    // Extraire les métadonnées du PaymentIntent
    const cartItemsJson = paymentIntent.metadata.cartItems;
    if (!cartItemsJson) {
      return NextResponse.json(
        { error: 'Informations de panier manquantes dans le paiement' },
        { status: 400 }
      );
    }
    
    const cartItems = JSON.parse(cartItemsJson);
    const paymentType = paymentIntent.metadata.paymentType || 'deposit';
    
    // Générer un numéro de commande unique
    const orderNumber = generateOrderNumber();
    
    // Calculer les montants
    const total = paymentIntent.amount / 100; // Convertir en euros
    let depositAmount = total;
    let remainingAmount = 0;
    
    if (paymentType === 'deposit') {
      // Récupérer le panier complet pour calculer le montant total
      const { data: cartData } = await supabase
        .from('carts')
        .select('cart_items')
        .eq('user_id', session.user.id)
        .single();
      
      if (cartData?.cart_items) {
        const fullCartItems = cartData.cart_items as any[];
        const subtotal = fullCartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const taxRate = 0.2; // 20% TVA
        const fullTotal = subtotal * (1 + taxRate);
        
        remainingAmount = fullTotal - total;
      }
    }
    
    // Créer la commande dans Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        order_number: orderNumber,
        total_amount: total + remainingAmount,
        deposit_amount: depositAmount,
        remaining_amount: remainingAmount,
        stripe_payment_intent_id: paymentIntentId,
        stripe_customer_id: paymentIntent.customer as string,
        status: paymentType === 'deposit' ? 'paid_deposit' : 'paid',
        customer_info: customerInfo,
        shipping_info: shippingInfo || customerInfo, // Utiliser les infos client par défaut
        payment_status: 'completed',
        estimated_completion_date: calculateEstimatedCompletionDate(cartItems)
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande' },
        { status: 500 }
      );
    }
    
    // Récupérer les services pour avoir les informations complètes
    const serviceIds = cartItems.map((item: any) => item.serviceId);
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds);
      
    const servicesMap = services ? services.reduce((acc: Record<string, any>, service: any) => {
      acc[service.id] = service;
      return acc;
    }, {}) : {};
    
    // Ajouter les items de commande
    const orderItems = cartItems.map((item: any) => {
      const service = servicesMap[item.serviceId] || {};
      return {
        order_id: order.id,
        service_id: item.serviceId,
        service_name: item.name,
        base_price: service.base_price || item.basePrice || 0,
        calculated_price: item.totalPrice || service.base_price || 0,
        quantity: item.quantity || 1,
        configuration: item.configuration || {},
        estimated_duration: service.estimated_duration || null
      };
    });
    
    // Insérer les items de commande
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Erreur lors de la création des items de commande:', itemsError);
      // On continue quand même car la commande principale est créée
    }
    
    // Vider le panier de l'utilisateur
    await supabase
      .from('carts')
      .update({ cart_items: [] })
      .eq('user_id', session.user.id);
    
    // Retourner les détails de la commande
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        depositAmount: order.deposit_amount,
        remainingAmount: order.remaining_amount,
        estimatedCompletionDate: order.estimated_completion_date
      }
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la confirmation du paiement' },
      { status: 500 }
    );
  }
}

// Helper pour calculer la date estimée de livraison
function calculateEstimatedCompletionDate(cartItems: any[]): string {
  // Par défaut, une semaine après la commande
  const date = new Date();
  date.setDate(date.getDate() + 7);
  
  // Si des services ont des délais spécifiques, prendre le plus long
  cartItems.forEach((item: any) => {
    if (item.slug === 'audit-securite-complet') {
      // Les audits de sécurité prennent 2 semaines
      const auditDate = new Date();
      auditDate.setDate(auditDate.getDate() + 14);
      if (auditDate > date) date.setTime(auditDate.getTime());
    } else if (item.slug === 'securisation-reseau-entreprise') {
      // La sécurisation réseau prend 10 jours
      const networkDate = new Date();
      networkDate.setDate(networkDate.getDate() + 10);
      if (networkDate > date) date.setTime(networkDate.getTime());
    }
  });
  
  return date.toISOString();
} 
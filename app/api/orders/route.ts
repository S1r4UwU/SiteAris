import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Type pour les éléments du panier
interface CartItem {
  serviceId: string;
  slug: string;
  name: string;
  basePrice: number;
  quantity: number;
  totalPrice: number;
  options: any[];
  configuration?: Record<string, any>;
}

// Type pour les données de la commande
interface OrderData {
  cartItems: CartItem[];
  customerInfo: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company_name?: string;
  };
  shippingInfo?: {
    street: string;
    postal_code: string;
    city: string;
    country: string;
  };
  paymentIntentId?: string;
  isDeposit?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    
    // Récupérer les données de la commande
    const orderData: OrderData = await request.json();
    
    if (!orderData.cartItems || orderData.cartItems.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }

    // Calculer les montants
    const subtotalAmount = orderData.cartItems.reduce(
      (sum, item) => sum + (item.totalPrice * item.quantity),
      0
    );
    
    const taxRate = 0.20; // 20% de TVA
    const taxAmount = subtotalAmount * taxRate;
    const totalAmount = subtotalAmount + taxAmount;
    
    // Calculer l'acompte (30% du total)
    const depositAmount = orderData.isDeposit ? Math.round(totalAmount * 0.3) : totalAmount;
    const remainingAmount = orderData.isDeposit ? totalAmount - depositAmount : 0;
    
    // Générer un numéro de commande
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: session?.user.id,
        order_number: orderNumber,
        status: orderData.isDeposit ? 'PAID_DEPOSIT' : 'PAID',
        total_amount: totalAmount,
        subtotal_amount: subtotalAmount,
        tax_amount: taxAmount,
        deposit_amount: depositAmount,
        remaining_amount: remainingAmount,
        customer_info: orderData.customerInfo,
        shipping_info: orderData.shippingInfo,
        payment_method: 'card',
        payment_intent_id: orderData.paymentIntentId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (orderError) {
      console.error('Erreur lors de la création de la commande:', orderError);
      return NextResponse.json(
        { error: "Erreur lors de la création de la commande" },
        { status: 500 }
      );
    }
    
    // Ajouter les éléments de la commande
    const orderItems = orderData.cartItems.map(item => ({
      order_id: order.id,
      service_id: item.serviceId,
      service_name: item.name,
      quantity: item.quantity,
      unit_price: item.basePrice,
      calculated_price: item.totalPrice,
      configuration: item.configuration || {},
      created_at: new Date().toISOString()
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) {
      console.error('Erreur lors de l\'ajout des éléments de la commande:', itemsError);
      return NextResponse.json(
        { error: "Erreur lors de l'ajout des éléments de la commande" },
        { status: 500 }
      );
    }
    
    // Créer un événement pour la commande
    await supabase
      .from('order_events')
      .insert({
        order_id: order.id,
        event_type: orderData.isDeposit ? 'ACOMPTE_PAYÉ' : 'COMMANDE_PAYÉE',
        description: orderData.isDeposit 
          ? `Acompte de ${depositAmount/100}€ payé` 
          : `Commande payée (${totalAmount/100}€)`,
        created_at: new Date().toISOString()
      });
    
    // Renvoyer les données de la commande
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount,
        depositAmount,
        remainingAmount
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du traitement de la commande:', error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }
    
    // Récupérer toutes les commandes de l'utilisateur
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des commandes" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { stripe, formatAmountForStripe, calculateDepositAmount, getDepositRateByServiceType } from '@/lib/stripe/client';
import { useCartStore } from '@/lib/store/cart-store';
import { CartItemConfig } from '@/lib/store/cart-store';

// Type adapté pour la gestion côté serveur (similaire mais non identique à CartItemConfig)
type CartItem = {
  serviceId: string;
  slug: string;
  name: string;
  basePrice: number;
  quantity: number;
  totalPrice: number;
  options: any[];
  configuration?: {
    postes?: number;
    sla?: string;
    urgence?: boolean;
    extras?: string[];
  };
};

export async function POST(req: Request) {
  try {
    // Récupérer le panier et les informations client depuis la requête
    const { items, customerInfo, paymentType = 'deposit' } = await req.json();
    
    // Vérifier si le panier est valide
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Panier invalide ou vide' },
        { status: 400 }
      );
    }
    
    // Authentification Supabase pour récupérer l'utilisateur
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    // Vérifier si l'utilisateur existe
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Calculer le montant total et l'acompte
    let subtotal = 0;
    const cartItems: CartItem[] = items;
    
    // Parcourir les items pour calculer les montants
    cartItems.forEach(item => {
      subtotal += item.totalPrice;
    });
    
    // Appliquer la TVA
    const taxRate = 0.2; // 20%
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    // Déterminer le montant à payer
    let amountToCharge: number;
    let paymentDescription: string;
    
    if (paymentType === 'deposit') {
      // Calculer l'acompte en tenant compte des règles spécifiques par service
      let depositAmount = 0;
      
      cartItems.forEach(item => {
        const depositRate = getDepositRateByServiceType(item.slug);
        depositAmount += item.totalPrice * depositRate;
      });
      
      // Appliquer la TVA sur l'acompte
      depositAmount = Math.round((depositAmount + (depositAmount * taxRate)) * 100) / 100;
      amountToCharge = depositAmount;
      paymentDescription = 'Acompte pour services SiteAris';
    } else {
      // Paiement complet
      amountToCharge = total;
      paymentDescription = 'Paiement complet pour services SiteAris';
    }
    
    // Rechercher ou créer un customer Stripe pour l'utilisateur
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id, first_name, last_name, email')
      .eq('id', userId)
      .single();
    
    let stripeCustomerId = userProfile?.stripe_customer_id;
    
    // Si l'utilisateur n'a pas encore de customerId Stripe, en créer un
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: customerInfo?.fullName || `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim() || undefined,
        metadata: {
          userId: userId
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Enregistrer le customerId dans Supabase
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }
    
    // Créer le PaymentIntent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amountToCharge),
      currency: 'eur',
      customer: stripeCustomerId,
      description: paymentDescription,
      metadata: {
        userId: userId,
        paymentType: paymentType,
        cartItems: JSON.stringify(cartItems.map(item => ({
          serviceId: item.serviceId,
          name: item.name,
          quantity: item.quantity,
          slug: item.slug
        })))
      },
      automatic_payment_methods: { enabled: true }
    });
    
    // Retourner le client secret pour initier le paiement côté client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountToCharge,
      total: total,
      depositAmount: paymentType === 'deposit' ? amountToCharge : null,
      remainingAmount: paymentType === 'deposit' ? total - amountToCharge : 0,
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    );
  }
} 
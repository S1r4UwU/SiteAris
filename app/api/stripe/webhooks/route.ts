import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/client';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      console.error('Signature ou secret webhook manquants');
      return NextResponse.json(
        { error: 'Signature ou secret webhook manquants' },
        { status: 400 }
      );
    }

    // Vérifier la signature
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Erreur de webhook: ${err.message}`);
    return NextResponse.json(
      { error: `Erreur de webhook: ${err.message}` },
      { status: 400 }
    );
  }

  // Créer le client Supabase
  const supabase = createServerComponentClient({ cookies });
  
  // Traiter l'événement
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      // Ajouter d'autres événements selon les besoins

      default:
        console.log(`Événement non géré : ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Erreur lors du traitement de l'événement ${event.type}:`, error);
    return NextResponse.json(
      { error: `Erreur lors du traitement de l'événement: ${error.message}` },
      { status: 500 }
    );
  }
}

// Gérer les paiements réussis
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { id, metadata, amount } = paymentIntent;

  // Vérifier si une commande existe déjà pour ce paiement
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', id)
    .single();

  // Si une commande existe déjà, mettre à jour son statut si nécessaire
  if (existingOrder) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        status: metadata.paymentType === 'deposit' ? 'paid_deposit' : 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingOrder.id);

    // Ajouter un événement dans l'historique de la commande
    await supabase
      .from('order_events')
      .insert({
        order_id: existingOrder.id,
        event_type: 'payment_success',
        description: 'Paiement confirmé',
        metadata: {
          payment_intent_id: id,
          amount: amount / 100
        }
      });
  } else {
    console.log(`Aucune commande trouvée pour le payment intent ${id}`);
    // Note: La commande est généralement créée dans la route confirm-payment
    // Ce cas ne devrait pas se produire en temps normal, mais nous le gérons quand même
    // pour les cas où le webhook arrive avant la confirmation côté client
  }
}

// Gérer les paiements échoués
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { id, metadata, last_payment_error } = paymentIntent;
  const userId = metadata.userId;

  // Vérifier si une commande existe déjà pour ce paiement
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, user_id')
    .eq('stripe_payment_intent_id', id)
    .single();

  if (existingOrder) {
    // Mettre à jour le statut de la commande
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'payment_failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingOrder.id);

    // Ajouter un événement dans l'historique de la commande
    await supabase
      .from('order_events')
      .insert({
        order_id: existingOrder.id,
        event_type: 'payment_failed',
        description: `Échec du paiement: ${last_payment_error?.message || 'Raison inconnue'}`,
        metadata: {
          payment_intent_id: id,
          error: last_payment_error || {}
        }
      });

    // Envoyer une notification à l'utilisateur (simulé ici)
    console.log(`Notification d'échec envoyée à l'utilisateur ${existingOrder.user_id}`);
  }
}

// Gérer les paiements annulés
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const { id } = paymentIntent;

  // Vérifier si une commande existe déjà pour ce paiement
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', id)
    .single();

  if (existingOrder) {
    // Mettre à jour le statut de la commande
    await supabase
      .from('orders')
      .update({
        payment_status: 'canceled',
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingOrder.id);

    // Ajouter un événement dans l'historique de la commande
    await supabase
      .from('order_events')
      .insert({
        order_id: existingOrder.id,
        event_type: 'payment_canceled',
        description: 'Paiement annulé',
        metadata: {
          payment_intent_id: id
        }
      });
  }
} 
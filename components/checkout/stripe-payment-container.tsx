'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { useCheckoutStore } from '@/lib/store/checkout-store';
import { getStripe, STRIPE_ELEMENTS_OPTIONS, PaymentIntentData, PaymentConfirmationResponse } from '@/lib/stripe/config';
import PaymentForm from '@/components/checkout/payment-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StripePaymentContainerProps {
  customerInfo: any;
  shippingInfo?: any;
}

export default function StripePaymentContainer({ 
  customerInfo, 
  shippingInfo 
}: StripePaymentContainerProps) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { setOrderInfo, orderInfo } = useCheckoutStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentData, setPaymentIntentData] = useState<PaymentIntentData | null>(null);
  
  useEffect(() => {
    // Si le panier est vide, rediriger vers la page panier
    if (!items.length) {
      router.push('/panier');
      return;
    }
    
    // Créer un payment intent
    const createPaymentIntent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            customerInfo,
            paymentType: 'deposit', // Acompte par défaut
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de la création du paiement');
        }
        
        const data = await response.json();
        setPaymentIntentData(data);
      } catch (err: any) {
        console.error('Erreur de paiement:', err);
        setError(err.message || 'Une erreur est survenue lors de la préparation du paiement');
      } finally {
        setLoading(false);
      }
    };
    
    createPaymentIntent();
  }, [items, customerInfo, router]);
  
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Confirmer le paiement côté serveur
      const response = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          customerInfo,
          shippingInfo: shippingInfo || customerInfo, // Utiliser les infos client par défaut
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la confirmation du paiement');
      }
      
      const data = await response.json() as PaymentConfirmationResponse;
      
      // Enregistrer les informations de commande
      setOrderInfo({
        orderId: data.order.id,
        orderNumber: data.order.orderNumber,
        status: data.order.status,
        amount: data.order.depositAmount,
        totalAmount: data.order.totalAmount,
        estimatedCompletionDate: data.order.estimatedCompletionDate
      });
      
      // Vider le panier après paiement réussi
      clearCart();
      
      // Rediriger vers la page de confirmation
      router.push('/checkout/confirmation');
    } catch (err: any) {
      console.error('Erreur lors de la confirmation:', err);
      setError(err.message || 'Une erreur est survenue lors de la finalisation de la commande');
    }
  };
  
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Préparation du paiement...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/30">
        <h3 className="text-lg font-medium text-destructive mb-2">Erreur de paiement</h3>
        <p className="text-sm mb-4">{error}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push('/panier')}>
            Retour au panier
          </Button>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
  
  if (!paymentIntentData || !paymentIntentData.clientSecret) {
    return (
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Impossible de préparer le paiement</h3>
        <p className="text-sm mb-4">Le service de paiement est temporairement indisponible. Veuillez réessayer ultérieurement.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Paiement sécurisé</h2>
      
      <Elements 
        stripe={getStripe()} 
        options={{ 
          clientSecret: paymentIntentData.clientSecret,
          appearance: STRIPE_ELEMENTS_OPTIONS.appearance,
          locale: 'fr'
        }}
      >
        <PaymentForm 
          clientSecret={paymentIntentData.clientSecret}
          amount={paymentIntentData.amount}
          isDeposit={paymentIntentData.depositAmount !== null}
          totalAmount={paymentIntentData.total}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </Elements>
    </div>
  );
} 
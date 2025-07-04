'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { useCheckoutStore } from '@/lib/store/checkout-store';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement
} from '@stripe/react-stripe-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { PaymentStatus } from '@/lib/stripe/config';

// Charger Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  isDeposit?: boolean;
  totalAmount?: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentForm({
  clientSecret,
  amount,
  isDeposit = true,
  totalAmount,
  onPaymentSuccess,
  onPaymentError
}: PaymentFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCartStore();
  const { setOrderInfo } = useCheckoutStore();
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.Initial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Vérifier si le paiement est en cours
  const isProcessing = paymentStatus === PaymentStatus.Processing;

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    // Vérifier l'état du paiement à l'initialisation
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;
      
      switch (paymentIntent.status) {
        case 'succeeded':
          setPaymentStatus(PaymentStatus.Succeeded);
          onPaymentSuccess(paymentIntent.id);
          break;
        case 'processing':
          setPaymentStatus(PaymentStatus.Processing);
          break;
        case 'requires_payment_method':
          setPaymentStatus(PaymentStatus.RequiresPaymentMethod);
          if (paymentIntent.last_payment_error) {
            setErrorMessage(paymentIntent.last_payment_error.message || 'Une erreur est survenue lors du traitement de votre paiement.');
          }
          break;
        default:
          // Autres états possibles: 'requires_confirmation', 'requires_action', 'canceled'
          break;
      }
    });
  }, [stripe, clientSecret, onPaymentSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js n'est pas encore chargé.
      return;
    }

    setPaymentStatus(PaymentStatus.Processing);
    setErrorMessage(null);

    // Confirmer le paiement
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation`,
      },
      redirect: 'if_required'
    });

    if (result.error) {
      // Afficher l'erreur à l'utilisateur
      setErrorMessage(result.error.message || 'Une erreur est survenue lors du traitement de votre paiement.');
      setPaymentStatus(result.error.type === 'card_error' ? PaymentStatus.RequiresPaymentMethod : PaymentStatus.Failed);
      onPaymentError(result.error.message || 'Erreur de paiement');
    } else if (result.paymentIntent) {
      // Le paiement a réussi ou nécessite une authentification supplémentaire
      if (result.paymentIntent.status === 'succeeded') {
        setPaymentStatus(PaymentStatus.Succeeded);
        onPaymentSuccess(result.paymentIntent.id);
      } else if (result.paymentIntent.status === 'requires_action') {
        setPaymentStatus(PaymentStatus.RequiresAction);
        // L'utilisateur doit effectuer une action supplémentaire (3DS)
      }
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Montant à payer */}
      <div className="bg-muted/30 p-4 rounded-lg mb-6">
        <div className="text-sm text-muted-foreground mb-1">Montant à payer</div>
        <div className="text-2xl font-bold">{formatPrice(amount)}</div>
        {isDeposit && totalAmount && (
          <div className="text-sm text-muted-foreground mt-1">
            Acompte de 30% sur un total de {formatPrice(totalAmount)}
            <br />
            Solde de {formatPrice(totalAmount - amount)} à régler après l'intervention
          </div>
        )}
      </div>
      
      {/* Élément de paiement Stripe */}
      <PaymentElement id="payment-element" />
      
      {/* Messages d'erreur */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de paiement</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Message de succès */}
      {paymentStatus === PaymentStatus.Succeeded && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Paiement réussi</AlertTitle>
          <AlertDescription>Votre paiement a été traité avec succès.</AlertDescription>
        </Alert>
      )}
      
      {/* Bouton de paiement */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || paymentStatus === PaymentStatus.Succeeded}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : paymentStatus === PaymentStatus.Succeeded ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Payé avec succès
          </>
        ) : (
          `Payer ${formatPrice(amount)}`
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center">
        <svg className="h-5 w-5 mr-1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#6B7280"
            d="M15.8.347C7.086.347 0 7.433 0 16.147c0 8.714 7.086 15.8 15.8 15.8 8.714 0 15.8-7.086 15.8-15.8 0-8.714-7.086-15.8-15.8-15.8z"
          />
          <path
            fill="#FFF"
            d="M18.114 11.072c-.52-.625-1.242-.936-2.167-.936h-3.314v11.458h2.042v-4.464h1.272c.885 0 1.593-.285 2.126-.854.532-.57.798-1.329.798-2.277 0-.99-.252-1.803-.757-2.43zm-1.302 3.274c-.238.29-.587.436-1.046.436h-1.09v-3.07h1.09c.46 0 .808.142 1.046.424.239.283.358.668.358 1.155 0 .488-.12.765-.358 1.055zm8.308-3.476h-2.061v.897c-.317-.708-.94-1.063-1.857-1.063-.773 0-1.406.292-1.901.875-.495.584-.743 1.335-.743 2.254 0 .92.25 1.67.753 2.254.502.584 1.13.876 1.89.876.456 0 .85-.114 1.184-.341.334-.228.58-.558.738-.993v1.17h2.019c-.7.153-.12.306-.026.459-.9.364-.267.641-.535.828-.268.188-.6.282-.994.282-.307 0-.605-.094-.915-.4a.528.528 0 0 0-.2-.092v1.775c.362.097.716.156 1.056.177.34.022.652.033.938.033.622 0 1.173-.112 1.652-.334.48-.222.855-.54 1.127-.952.271-.413.466-.888.585-1.426.118-.537.178-1.1.178-1.687V11.72c-.001-.205-.3-.566-.088-.85zm-2.061 3.093c0 .404-.109.731-.327.983-.217.251-.497.377-.84.377-.331 0-.599-.129-.803-.385-.205-.258-.307-.585-.307-.984 0-.399.102-.727.307-.984.204-.257.472-.386.803-.386.343 0 .623.124.84.37.218.245.327.577.327.995v.014z"
          />
        </svg>
        Paiement sécurisé par Stripe
      </div>
    </form>
  );
} 
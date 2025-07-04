import { loadStripe, Stripe } from '@stripe/stripe-js';

// Singleton pour s'assurer qu'on ne crée pas plusieurs instances
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Configuration pour Stripe Elements
export const STRIPE_ELEMENTS_OPTIONS = {
  locale: 'fr',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#6366F1',
      colorBackground: '#ffffff',
      colorText: '#171717',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px'
    }
  }
};

// Types pour le checkout
export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  total: number;
  depositAmount: number | null;
  remainingAmount: number;
}

// Interface pour les informations client
export interface CustomerInfo {
  fullName: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  company?: string;
  vatNumber?: string;
}

// Interface pour les informations de livraison/intervention
export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  instructions?: string;
  sameAsCustomer?: boolean;
}

// Etats possibles du paiement
export enum PaymentStatus {
  Initial = 'initial',
  Processing = 'processing',
  Succeeded = 'succeeded',
  RequiresAction = 'requires_action',
  RequiresPaymentMethod = 'requires_payment_method',
  Failed = 'failed',
}

// Interface pour la réponse de confirmation
export interface PaymentConfirmationResponse {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    depositAmount: number;
    remainingAmount: number;
    estimatedCompletionDate: string;
  };
} 
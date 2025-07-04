'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import CartSummary from '@/components/panier/cart-summary';
import { CustomerInfo } from '@/lib/stripe/config';
import CustomerInfoForm from '@/components/checkout/customer-info-form';
import StripePaymentContainer from '@/components/checkout/stripe-payment-container';
import CheckoutStepper from '@/components/checkout/checkout-stepper';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCartStore();
  const [step, setStep] = useState<'customer-info' | 'payment'>('customer-info');
  
  // États pour stocker les informations client
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [shippingInfo, setShippingInfo] = useState<any | null>(null);
  
  // Si le panier est vide, rediriger vers la page panier
  if (typeof window !== 'undefined' && items.length === 0) {
    router.push('/panier');
  }
  
  // Gérer la soumission du formulaire d'informations client
  const handleCustomerInfoSubmit = (info: CustomerInfo, shipping?: any) => {
    setCustomerInfo(info);
    setShippingInfo(shipping || null);
    setStep('payment');
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Paiement</h1>
      
      {/* Stepper pour indiquer l'étape actuelle */}
      <CheckoutStepper currentStep={step} className="mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaires de gauche */}
        <div className="lg:col-span-2 space-y-6">
          {/* Étape 1: Informations client */}
          {step === 'customer-info' && (
            <CustomerInfoForm 
              onSubmit={handleCustomerInfoSubmit} 
              initialValues={{
                fullName: customerInfo?.fullName,
                email: customerInfo?.email,
                phone: customerInfo?.phone,
                address: customerInfo?.address,
                company: customerInfo?.company,
                vatNumber: customerInfo?.vatNumber,
              }}
            />
          )}
          
          {/* Étape 2: Paiement */}
          {step === 'payment' && customerInfo && (
            <StripePaymentContainer 
              customerInfo={customerInfo}
              shippingInfo={shippingInfo} 
            />
          )}
        </div>
        
        {/* Récapitulatif du panier à droite */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <h3 className="text-lg font-medium mb-4">Récapitulatif de la commande</h3>
            <CartSummary />
            
            {/* Explication acompte */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <p className="mb-1 font-medium">Paiement en acompte 30%</p>
              <p>
                Conformément à nos conditions générales de vente, vous ne payez aujourd'hui
                que 30% du montant total. Le solde sera à régler après l'intervention.
              </p>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-4 text-sm">
            <h3 className="text-base font-medium mb-3">Besoin d'aide ?</h3>
            <p className="mb-2">Pour toute question concernant votre commande ou le paiement :</p>
            <ul className="space-y-1 text-sm">
              <li>• Appelez-nous : 01 23 45 67 89</li>
              <li>• Email : support@sitearis.fr</li>
              <li>• Lundi-Vendredi, 9h-18h</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/lib/store/checkout-store';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ConfirmationPage() {
  const router = useRouter();
  const { orderInfo, resetCheckout } = useCheckoutStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Si pas d'informations de commande, rediriger vers la page d'accueil
    if (mounted && !orderInfo) {
      router.push('/');
    }
  }, [orderInfo, router, mounted]);
  
  const handleGoToServices = () => {
    resetCheckout();
    router.push('/services');
  };
  
  const handleGoToAccount = () => {
    resetCheckout();
    router.push('/account/orders');
  };
  
  if (!mounted || !orderInfo) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Confirmation de commande</h1>
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <p>Chargement des informations de votre commande...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-100 text-green-800 rounded-full p-3">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">Merci pour votre commande!</h1>
        <p className="text-center mb-8 text-muted-foreground">
          Votre commande a été confirmée et sera traitée dans les plus brefs délais.
        </p>
        
        <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6 mb-8">
          {/* Résumé de la commande */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Détails de la commande</h2>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/40 rounded-md">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de commande</p>
                <p className="font-medium">{orderInfo.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {orderInfo.status}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acompte payé</p>
                <p className="font-medium">{formatPrice(orderInfo.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="font-medium">{formatPrice(orderInfo.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date estimée</p>
                <p className="font-medium">{formatDate(new Date(orderInfo.estimatedCompletionDate))}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Prochaines étapes</h3>
            <p className="text-sm text-muted-foreground mb-2">
              1. Vous allez recevoir un email de confirmation détaillé.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              2. Notre équipe vous contactera sous 24h pour planifier l'intervention.
            </p>
            <p className="text-sm text-muted-foreground">
              3. Le solde sera à régler après l'intervention.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleGoToServices}
          >
            Découvrir d'autres services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            className="flex-1"
            onClick={handleGoToAccount}
          >
            Suivre ma commande
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 
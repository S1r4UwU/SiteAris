'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import CartItem from '@/components/panier/cart-item';
import CartSummary from '@/components/panier/cart-summary';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function PanierPage() {
  const { items } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Fix pour l'hydratation côté client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Rediriger vers le checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Si le panier est vide
  if (mounted && items.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <h1 className="text-2xl font-semibold mb-8">Votre panier</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag size={64} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-medium mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 mb-6">
            Découvrez nos services et ajoutez-les à votre panier pour continuer
          </p>
          <Button
            onClick={() => router.push('/services')}
            className="mx-auto"
          >
            Voir le catalogue de services
          </Button>
        </div>
      </div>
    );
  }

  // Pendant le chargement côté client
  if (!mounted) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <h1 className="text-2xl font-semibold mb-8">Votre panier</h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-center text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-2">Votre panier</h1>
      <p className="text-gray-500 mb-8">Vérifiez vos services et passez commande</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Liste des articles */}
        <div className="md:col-span-2 space-y-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => router.push('/services')}
            className="mb-2"
          >
            <ArrowLeft size={16} className="mr-2" />
            Continuer mes achats
          </Button>
          
          {items.map(item => (
            <CartItem key={item.serviceId} item={item} />
          ))}
          
          {/* Informations additionnelles */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm mt-6">
            <div className="flex">
              <AlertTriangle size={20} className="text-amber-500 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Informations importantes</p>
                <p className="text-amber-700 mt-1">
                  Les prix affichés sont indicatifs. Un devis détaillé vous sera fourni après validation de votre commande.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Résumé de commande */}
        <div className="md:col-span-1">
          <CartSummary onCheckout={handleCheckout} />
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  className?: string;
}

export default function CartSummary({ 
  showCheckoutButton = true,
  onCheckout,
  className = ''
}: CartSummaryProps) {
  const { subtotal, tax, total, items } = useCartStore();
  
  // Calcul du nombre total d'articles dans le panier
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  if (items.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
        <p className="text-center text-gray-500">Votre panier est vide</p>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
      <h3 className="font-medium text-lg mb-4">Résumé de la commande</h3>
      
      {/* Détails des prix */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Nombre d'articles:</span>
          <span>{totalItems} {totalItems > 1 ? 'articles' : 'article'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Sous-total:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>TVA (20%):</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className="border-t pt-2 mt-2 flex justify-between font-medium">
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      
      {/* Notes additionnelles */}
      <div className="text-xs text-gray-500 mb-4">
        <p>Les prix affichés incluent la TVA.</p>
        <p>Les frais de déplacement peuvent s'appliquer selon la localisation.</p>
      </div>
      
      {/* Bouton de validation */}
      {showCheckoutButton && (
        <Button 
          onClick={onCheckout} 
          className="w-full"
        >
          Passer à la commande
        </Button>
      )}
    </div>
  );
} 
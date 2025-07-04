'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart-store';
import Image from 'next/image';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  // Utiliser le store de panier
  const { 
    items, 
    subtotal, 
    tax, 
    total, 
    removeItem, 
    updateItem,
    getItemCount 
  } = useCartStore();
  
  const itemCount = getItemCount();
  
  // Fermer le drawer avec la touche Echap
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Empêcher le défilement du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  const toggleCart = () => {
    setIsOpen(!isOpen);
  };
  
  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    updateItem(serviceId, { quantity });
  };

  const handleRemoveItem = (serviceId: string) => {
    removeItem(serviceId);
  };

  return (
    <>
      {/* Bouton du panier */}
      <button 
        onClick={toggleCart}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Voir le panier"
      >
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
      
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleCart}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full bg-white z-50 w-full max-w-md transform transition-transform duration-300 ease-in-out shadow-lg flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header du drawer */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-medium text-xl">Votre panier</h2>
          <button 
            onClick={toggleCart}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Fermer le panier"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Contenu du panier */}
        <div className="flex-grow overflow-auto p-4 space-y-4">
          {items.length > 0 ? (
            <>
              {items.map((item) => (
                <div key={item.serviceId} className="flex border-b pb-4">
                  {item.imageUrl && (
                    <div className="w-20 h-20 relative flex-shrink-0 mr-3 overflow-hidden rounded">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                    </div>
                    
                    {/* Options du service */}
                    {item.options.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.options
                          .filter(option => option.value)
                          .map(option => (
                            <span key={option.id} className="mr-2">
                              {option.name}: {
                                typeof option.value === 'boolean' ? (option.value ? 'Oui' : 'Non') : option.value
                              }
                            </span>
                          ))
                        }
                      </div>
                    )}
                    
                    {/* Configuration spécifique */}
                    {item.configuration && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.configuration.postes && <span className="mr-2">Postes: {item.configuration.postes}</span>}
                        {item.configuration.sla && <span className="mr-2">SLA: {item.configuration.sla}</span>}
                        {item.configuration.urgence && <span className="mr-2">Urgence: Oui</span>}
                      </div>
                    )}
                    
                    {/* Contrôle de quantité */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <button
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={() => item.quantity > 1 && handleQuantityChange(item.serviceId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="p-1 rounded-full hover:bg-gray-100"
                          onClick={() => handleQuantityChange(item.serviceId, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(item.serviceId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Votre panier est vide</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false);
                  router.push('/services');
                }}
              >
                Découvrir nos services
              </Button>
            </div>
          )}
        </div>
        
        {/* Résumé et actions */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (20%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-1">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={handleCheckout}>
              Passer commande
            </Button>
          </div>
        )}
      </div>
    </>
  );
} 
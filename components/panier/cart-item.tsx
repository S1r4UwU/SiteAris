'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Trash2, Plus, Minus, Settings } from 'lucide-react';
import { CartItemConfig, useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type CartItemProps = {
  item: CartItemConfig;
  showControls?: boolean;
};

export default function CartItem({ item, showControls = true }: CartItemProps) {
  const { removeItem, updateItem } = useCartStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const incrementQuantity = () => {
    updateItem(item.serviceId, { quantity: item.quantity + 1 });
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      updateItem(item.serviceId, { quantity: item.quantity - 1 });
    }
  };

  // Formatage des options pour l'affichage
  const displayOptions = item.options.map(option => {
    let displayValue;
    
    if (typeof option.value === 'boolean') {
      displayValue = option.value ? 'Oui' : 'Non';
    } else {
      displayValue = option.value;
    }
    
    return { 
      name: option.name, 
      value: displayValue,
      price: option.price || 0
    };
  });

  // Formatage de la configuration pour l'affichage
  const displayConfiguration = [];
  if (item.configuration) {
    if (item.configuration.postes !== undefined) {
      displayConfiguration.push({
        name: 'Nombre de postes',
        value: item.configuration.postes,
        important: true
      });
    }
    
    if (item.configuration.sla) {
      const slaMappings = {
        'standard': 'Standard (72h)',
        'business': 'Business (48h)',
        'premium': 'Premium (24h/7j)'
      };
      displayConfiguration.push({
        name: 'Niveau SLA',
        value: slaMappings[item.configuration.sla as keyof typeof slaMappings] || item.configuration.sla,
        important: item.configuration.sla === 'premium'
      });
    }
    
    if (item.configuration.urgence) {
      displayConfiguration.push({
        name: 'Intervention urgente',
        value: 'Oui (+30%)',
        important: true
      });
    }

    if (item.configuration.extras && item.configuration.extras.length > 0) {
      displayConfiguration.push({
        name: 'Options supplémentaires',
        value: item.configuration.extras.join(', '),
        important: false
      });
    }
  }

  return (
    <div className="flex flex-col border rounded-lg p-4 mb-4 bg-white shadow-sm">
      {/* Header: Image, Nom, Actions */}
      <div className="flex items-start mb-2">
        {/* Image du service */}
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden mr-3">
          {item.imageUrl ? (
            <Image 
              src={item.imageUrl} 
              alt={item.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-xl">?</span>
            </div>
          )}
        </div>
        
        {/* Nom du service et contrôles */}
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <p className="text-sm text-gray-500">Prix unitaire: {formatPrice(item.basePrice)}</p>
          
          {/* Afficher les configurations importantes */}
          {displayConfiguration.filter(config => config.important).map((config, index) => (
            <Badge key={index} variant="outline" className="mr-1 mt-1">
              {config.name}: {config.value}
            </Badge>
          ))}
        </div>
        
        {/* Actions */}
        {showControls && (
          <button 
            onClick={() => removeItem(item.serviceId)}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      {/* Contrôles de quantité et prix */}
      <div className="flex justify-between items-center mb-2">
        {showControls ? (
          <div className="flex items-center border rounded">
            <button 
              onClick={decrementQuantity}
              className="p-1 px-2 hover:bg-gray-100"
              disabled={item.quantity <= 1}
              aria-label="Diminuer la quantité"
            >
              <Minus size={16} />
            </button>
            <span className="px-3 py-1">{item.quantity}</span>
            <button 
              onClick={incrementQuantity}
              className="p-1 px-2 hover:bg-gray-100"
              aria-label="Augmenter la quantité"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <p className="text-sm">Quantité: {item.quantity}</p>
        )}
        
        <p className="font-medium">{formatPrice(item.totalPrice)}</p>
      </div>
      
      {/* Options et configuration */}
      {(displayOptions.length > 0 || displayConfiguration.length > 0) && (
        <div className="mt-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            <Settings size={14} />
            {isExpanded ? "Masquer la configuration" : "Voir la configuration"}
          </button>
          
          {isExpanded && (
            <div className="mt-2 text-sm border-t pt-2">
              {/* Configuration du service */}
              {displayConfiguration.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-medium mb-1">Configuration du service:</h4>
                  <ul className="space-y-1 pl-1">
                    {displayConfiguration.map((config, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{config.name}:</span>
                        <span className={`font-medium ${config.important ? 'text-primary' : ''}`}>
                          {config.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Options additionnelles */}
              {displayOptions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Options additionnelles:</h4>
                  <ul className="space-y-1 pl-1">
                    {displayOptions.map((option, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{option.name}:</span>
                        <span className="font-medium">
                          {option.value}
                          {option.price > 0 && ` (+${formatPrice(option.price)})`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
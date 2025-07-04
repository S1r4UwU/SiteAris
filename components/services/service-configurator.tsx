"use client";

import { useState, useEffect } from 'react';
import { Service, ServiceOption as ServiceOptionType } from '@/types/services';
import { useCartStore, CartItemConfig, ServiceOption } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShoppingCart, FileText, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';

interface ServiceConfiguratorProps {
  service: Service;
  options: ServiceOptionType[];
}

export function ServiceConfigurator({ service, options }: ServiceConfiguratorProps) {
  // État pour les options sélectionnées
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | number | boolean>>({});
  
  // Configuration spécifique pour certains services
  const [configuration, setConfiguration] = useState<{
    postes?: number;
    sla?: string;
    urgence?: boolean;
    extras?: string[];
  }>({});
  
  // État pour le prix calculé
  const [calculatedPrice, setCalculatedPrice] = useState({
    base_price: service.base_price,
    options_price: 0,
    total_price: service.base_price,
    display_price: service.display_price || formatPrice(service.base_price),
    estimated_duration: service.estimated_duration
  });
  
  // Quantité sélectionnée
  const [quantity, setQuantity] = useState(1);
  
  // États d'action
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Hooks
  const { addItem, items } = useCartStore();
  const router = useRouter();

  // Vérifier si le service est déjà dans le panier
  const isInCart = items.some(item => item.serviceId === service.id);

  // Initialiser les options avec leurs valeurs par défaut
  useEffect(() => {
    const defaultOptions: Record<string, string | number | boolean> = {};
    const defaultConfig: typeof configuration = {};
    
    options.forEach(option => {
      if (option.default_value) {
        let value: string | number | boolean = option.default_value;
        
        switch (option.option_type) {
          case 'number':
            value = parseInt(option.default_value, 10);
            // Si c'est l'option nombre de postes, l'ajouter à la configuration
            if (option.option_name.toLowerCase().includes('poste')) {
              defaultConfig.postes = parseInt(option.default_value, 10);
            }
            break;
          case 'boolean':
            value = option.default_value === 'true';
            // Si c'est l'option urgence, l'ajouter à la configuration
            if (option.option_name.toLowerCase().includes('urgence')) {
              defaultConfig.urgence = option.default_value === 'true';
            }
            break;
          case 'select':
            // Si c'est une option SLA, l'ajouter à la configuration
            if (option.option_name.toLowerCase().includes('sla') || 
                option.option_name.toLowerCase().includes('service')) {
              defaultConfig.sla = option.default_value;
            }
            break;
          default:
            value = option.default_value;
        }
        
        defaultOptions[option.option_name] = value;
      }
    });
    
    setSelectedOptions(defaultOptions);
    setConfiguration(defaultConfig);
  }, [options]);

  // Gestionnaire pour le changement d'options
  const handleOptionChange = (optionName: string, value: string | number | boolean) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
    
    // Mettre à jour la configuration spéciale si nécessaire
    const optionNameLower = optionName.toLowerCase();
    
    if (optionNameLower.includes('poste')) {
      setConfiguration(prev => ({ ...prev, postes: value as number }));
    } else if (optionNameLower.includes('urgence')) {
      setConfiguration(prev => ({ ...prev, urgence: value as boolean }));
    } else if (optionNameLower.includes('sla') || optionNameLower.includes('service')) {
      setConfiguration(prev => ({ ...prev, sla: value as string }));
    }
    
    // Reset l'état d'ajout au panier car la configuration a changé
    setAddedToCart(false);
    
    // Simuler un calcul de prix
    simulateCalculatePrice(value, optionName);
  };
  
  // Simuler le calcul de prix en fonction des options sélectionnées
  const simulateCalculatePrice = (newValue?: any, optionName?: string) => {
    setLoading(true);
    
    setTimeout(() => {
      try {
        const options = { ...selectedOptions };
        if (optionName) options[optionName] = newValue;
        
        // Prix de base
        let totalPrice = service.base_price;
        
        // Logique pour les services spécifiques
        const config = { ...configuration };
        if (optionName && optionName.toLowerCase().includes('poste')) {
          config.postes = newValue as number;
        } else if (optionName && optionName.toLowerCase().includes('urgence')) {
          config.urgence = newValue as boolean;
        } else if (optionName && (optionName.toLowerCase().includes('sla') || optionName.toLowerCase().includes('service'))) {
          config.sla = newValue as string;
        }
        
        // Appliquer les règles de tarification spéciales selon le type de service
        if (service.slug === 'securisation-reseau' && config.postes && config.postes > 1) {
          // Ajouter 150€ par poste supplémentaire (premier poste inclus dans le prix de base)
          totalPrice += (config.postes - 1) * 150;
        }
        
        if (service.slug === 'maintenance-informatique' && config.postes) {
          // Prix de base + 15€ par poste par mois
          totalPrice = 350 + (config.postes * 15);
        }
        
        // Options supplémentaires
        let optionsPrice = 0;
        
        // Majoration pour urgence
        if (config.urgence) {
          totalPrice *= 1.3; // +30%
        }
        
        // Majoration pour SLA premium
        if (config.sla === 'premium') {
          totalPrice *= 1.25; // +25%
        }
        
        setCalculatedPrice({
          base_price: service.base_price,
          options_price: optionsPrice,
          total_price: totalPrice,
          display_price: formatPrice(totalPrice),
          estimated_duration: service.estimated_duration
        });
      } catch (error) {
        console.error('Erreur lors du calcul du prix:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Ajouter au panier
  const handleAddToCart = () => {
    // Préparer les options pour le stockage dans le panier
    const cartOptions: ServiceOption[] = options
      .filter(option => selectedOptions[option.option_name] !== undefined)
      .map(option => {
        const value = selectedOptions[option.option_name];
        let price = 0;
        
        // Calculer le prix de l'option
        if (option.price_modifier) {
          if (option.price_multiplier && typeof value === 'number') {
            price = option.price_modifier * value;
          } else if (value) {
            price = option.price_modifier;
          }
        }
        
        return {
          id: option.id,
          name: option.option_name,
          value: value,
          price: price
        };
      });
    
    // Créer l'item du panier
    const cartItem: Omit<CartItemConfig, 'totalPrice'> = {
      serviceId: service.id,
      slug: service.slug,
      name: service.name,
      basePrice: service.base_price,
      quantity: quantity,
      options: cartOptions,
      imageUrl: service.image_url || undefined,
      configuration: { ...configuration }
    };
    
    // Ajouter l'item au panier
    addItem(cartItem);
    
    // Modifier l'état pour montrer que l'item a été ajouté
    setAddedToCart(true);
    toast.success('Service ajouté au panier');
    
    // Réinitialiser après un délai
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };
  
  const goToCart = () => {
    router.push('/panier');
  };

  // Rendu des contrôles d'option
  const renderOptionControl = (option: ServiceOptionType) => {
    const value = selectedOptions[option.option_name];
    
    switch (option.option_type) {
      case 'number':
        return (
          <div className="space-y-2" key={option.id}>
            <div className="flex justify-between items-center">
              <Label htmlFor={`option-${option.id}`}>{option.option_name}</Label>
              <span className="text-sm font-medium">{value || 0}</span>
            </div>
            <Slider
              id={`option-${option.id}`}
              min={option.min_value || 1}
              max={option.max_value || 10}
              step={1}
              value={[value as number || 0]}
              onValueChange={(values) => handleOptionChange(option.option_name, values[0])}
            />
            {option.description && (
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            )}
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-start space-x-2" key={option.id}>
            <Checkbox
              id={`option-${option.id}`}
              checked={value as boolean || false}
              onCheckedChange={(checked) => handleOptionChange(option.option_name, !!checked)}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor={`option-${option.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.option_name}
                {option.price_modifier > 0 && ` (+${formatPrice(option.price_modifier)})`}
              </Label>
              {option.description && (
                <p className="text-xs text-muted-foreground">{option.description}</p>
              )}
            </div>
          </div>
        );
        
      case 'select':
        if (!option.available_values) return null;
        
        const availableOptions = Object.entries(option.available_values).map(([key, label]) => ({
          value: key,
          label: label
        }));
        
        return (
          <div className="space-y-2" key={option.id}>
            <Label>{option.option_name}</Label>
            <RadioGroup
              value={value as string || ''}
              onValueChange={(val) => handleOptionChange(option.option_name, val)}
              className="space-y-2"
            >
              {availableOptions.map((opt) => (
                <div className="flex items-center space-x-2" key={opt.value}>
                  <RadioGroupItem value={opt.value} id={`option-${option.id}-${opt.value}`} />
                  <Label
                    htmlFor={`option-${option.id}-${opt.value}`}
                    className="text-sm font-medium leading-none"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Options de configuration */}
      {options.length > 0 && (
        <div className="space-y-4">
          {options.map(option => renderOptionControl(option))}
        </div>
      )}
      
      {/* Quantité */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantité</Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            className="w-10 p-0"
            disabled={quantity <= 1}
          >
            -
          </Button>
          <Input
            id="quantity"
            type="number"
            className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            min={1}
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 p-0"
          >
            +
          </Button>
        </div>
      </div>
      
      {/* Prix total */}
      <div className="border-t pt-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Prix unitaire:</span>
          <span>{formatPrice(service.base_price)}</span>
        </div>
        {calculatedPrice.options_price > 0 && (
          <div className="flex justify-between text-sm">
            <span>Options:</span>
            <span>+{formatPrice(calculatedPrice.options_price)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-lg pt-1">
          <span>Total:</span>
          <span>{loading ? <Loader2 size={16} className="animate-spin" /> : calculatedPrice.display_price}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {service.estimated_duration && `Durée estimée: ${service.estimated_duration}`}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col space-y-2">
        {isInCart ? (
          <Button
            onClick={goToCart}
            className="w-full"
            variant="secondary"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Voir le panier
          </Button>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="w-full"
            disabled={loading || addedToCart}
          >
            {addedToCart ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Ajouté au panier
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </>
            )}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/contact?service=' + service.slug)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Demander un devis personnalisé
        </Button>
      </div>
    </div>
  );
} 
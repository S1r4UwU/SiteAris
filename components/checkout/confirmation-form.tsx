'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmationSchema, ConfirmationFormValues } from '@/lib/validations/checkout';
import { useCheckoutStore } from '@/lib/store/checkout-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils';

export default function ConfirmationForm() {
  const { confirmation, updateConfirmation, setStep, completeStep } = useCheckoutStore();
  const { items, subtotal, calculateDepositAmount } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculer le montant de l'acompte (30%)
  const depositAmount = calculateDepositAmount();
  const remainingAmount = subtotal - depositAmount;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ConfirmationFormValues>({
    resolver: zodResolver(confirmationSchema),
    defaultValues: {
      terms_accepted: confirmation.terms_accepted || false,
      privacy_accepted: confirmation.privacy_accepted || false,
      marketing_opt_in: confirmation.marketing_opt_in || false,
    },
  });
  
  const onSubmit = async (data: ConfirmationFormValues) => {
    setIsSubmitting(true);
    try {
      // Sauvegarder les données dans le store
      updateConfirmation(data);
      
      // Marquer l'étape comme complétée
      completeStep('confirmation');
      
      // Passer à l'étape suivante
      setStep('payment');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Récapitulatif de votre commande</h2>
        
        {/* Récapitulatif des services */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">Services sélectionnés</h3>
          <div className="border rounded-md divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.options && item.options.length > 0 && (
                    <ul className="text-sm text-gray-600 mt-1">
                      {item.options.map((option) => (
                        <li key={option.id}>{option.name}: {option.value}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="font-medium">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Détail des montants */}
        <div className="mb-6 border-t border-b py-4">
          <div className="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2 font-medium">
            <span>Acompte à payer maintenant (30%)</span>
            <span>{formatPrice(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Solde à payer après intervention</span>
            <span>{formatPrice(remainingAmount)}</span>
          </div>
        </div>
        
        {/* Informations importantes */}
        <div className="mb-6 bg-blue-50 p-4 rounded-md text-sm">
          <h3 className="font-medium text-blue-800 mb-2">Informations importantes</h3>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>Un acompte de 30% est requis pour confirmer votre commande</li>
            <li>Le solde sera à régler après l'intervention</li>
            <li>Vous recevrez une confirmation par email avec les détails</li>
            <li>Un technicien vous contactera pour finaliser le rendez-vous</li>
          </ul>
        </div>
        
        {/* Acceptation des conditions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms_accepted" 
              {...register('terms_accepted')}
            />
            <Label htmlFor="terms_accepted" className="text-sm">
              J'accepte les <a href="/terms" className="text-primary underline">conditions générales de vente</a>
            </Label>
          </div>
          {errors.terms_accepted && (
            <p className="text-sm text-red-500 ml-6">{errors.terms_accepted.message}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="privacy_accepted" 
              {...register('privacy_accepted')}
            />
            <Label htmlFor="privacy_accepted" className="text-sm">
              J'accepte la <a href="/privacy" className="text-primary underline">politique de confidentialité</a>
            </Label>
          </div>
          {errors.privacy_accepted && (
            <p className="text-sm text-red-500 ml-6">{errors.privacy_accepted.message}</p>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="marketing_opt_in" 
              {...register('marketing_opt_in')}
            />
            <Label htmlFor="marketing_opt_in" className="text-sm">
              Je souhaite recevoir des informations sur les services et promotions
            </Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('scheduling')}
        >
          Retour
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Chargement...' : 'Procéder au paiement'}
        </Button>
      </div>
    </form>
  );
} 
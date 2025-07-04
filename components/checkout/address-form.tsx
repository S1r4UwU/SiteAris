'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressesSchema, AddressesFormValues } from '@/lib/validations/checkout';
import { useCheckoutStore } from '@/lib/store/checkout-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

export default function AddressForm() {
  const { addresses, updateAddresses, setStep, completeStep } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AddressesFormValues>({
    resolver: zodResolver(addressesSchema),
    defaultValues: {
      billing_address: addresses.billing_address || {
        street: '',
        city: '',
        postal_code: '',
        country: 'France',
      },
      use_same_address: addresses.use_same_address !== undefined ? addresses.use_same_address : true,
      intervention_address: addresses.intervention_address || {
        street: '',
        city: '',
        postal_code: '',
        country: 'France',
      },
      intervention_type: addresses.intervention_type || 'on_site',
      intervention_notes: addresses.intervention_notes || '',
    },
  });
  
  const useSameAddress = watch('use_same_address');
  const interventionType = watch('intervention_type');
  
  const onSubmit = async (data: AddressesFormValues) => {
    setIsSubmitting(true);
    try {
      // Si même adresse, copier l'adresse de facturation
      if (data.use_same_address) {
        data.intervention_address = data.billing_address;
      }
      
      // Sauvegarder les données dans le store
      updateAddresses(data);
      
      // Marquer l'étape comme complétée
      completeStep('address');
      
      // Passer à l'étape suivante
      setStep('scheduling');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Adresse de facturation</h2>
        
        {/* Adresse de facturation */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="billing_address.street">Rue et numéro</Label>
            <Input
              id="billing_address.street"
              placeholder="123 rue de Paris"
              {...register('billing_address.street')}
              className={errors.billing_address?.street ? 'border-red-500' : ''}
            />
            {errors.billing_address?.street && (
              <p className="mt-1 text-sm text-red-500">{errors.billing_address.street.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="billing_address.city">Ville</Label>
            <Input
              id="billing_address.city"
              placeholder="Paris"
              {...register('billing_address.city')}
              className={errors.billing_address?.city ? 'border-red-500' : ''}
            />
            {errors.billing_address?.city && (
              <p className="mt-1 text-sm text-red-500">{errors.billing_address.city.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="billing_address.postal_code">Code postal</Label>
            <Input
              id="billing_address.postal_code"
              placeholder="75001"
              {...register('billing_address.postal_code')}
              className={errors.billing_address?.postal_code ? 'border-red-500' : ''}
            />
            {errors.billing_address?.postal_code && (
              <p className="mt-1 text-sm text-red-500">{errors.billing_address.postal_code.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="billing_address.country">Pays</Label>
            <Input
              id="billing_address.country"
              defaultValue="France"
              {...register('billing_address.country')}
              className={errors.billing_address?.country ? 'border-red-500' : ''}
            />
            {errors.billing_address?.country && (
              <p className="mt-1 text-sm text-red-500">{errors.billing_address.country.message}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Adresse d'intervention</h2>
        
        {/* Type d'intervention */}
        <div className="mb-6">
          <Label className="text-base mb-2 block">Type d'intervention</Label>
          <RadioGroup 
            defaultValue={interventionType}
            className="grid grid-cols-3 gap-4"
            onValueChange={(value: string) => setValue('intervention_type', value as 'on_site' | 'remote' | 'mixed')}
          >
            <div>
              <RadioGroupItem 
                value="on_site" 
                id="on_site" 
                className="peer sr-only" 
                {...register('intervention_type')}
              />
              <Label
                htmlFor="on_site"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Sur site</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="remote" 
                id="remote" 
                className="peer sr-only" 
                {...register('intervention_type')}
              />
              <Label
                htmlFor="remote"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>À distance</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="mixed" 
                id="mixed" 
                className="peer sr-only" 
                {...register('intervention_type')}
              />
              <Label
                htmlFor="mixed"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Mixte</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Option même adresse */}
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="use_same_address" 
            checked={useSameAddress}
            onCheckedChange={(checked) => setValue('use_same_address', !!checked)}
            {...register('use_same_address')}
          />
          <Label htmlFor="use_same_address" className="text-sm">
            L'adresse d'intervention est identique à l'adresse de facturation
          </Label>
        </div>
        
        {/* Adresse d'intervention (si différente) */}
        {!useSameAddress && (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="intervention_address.street">Rue et numéro</Label>
              <Input
                id="intervention_address.street"
                placeholder="123 rue de Paris"
                {...register('intervention_address.street')}
                className={errors.intervention_address?.street ? 'border-red-500' : ''}
              />
              {errors.intervention_address?.street && (
                <p className="mt-1 text-sm text-red-500">{errors.intervention_address.street.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="intervention_address.city">Ville</Label>
              <Input
                id="intervention_address.city"
                placeholder="Paris"
                {...register('intervention_address.city')}
                className={errors.intervention_address?.city ? 'border-red-500' : ''}
              />
              {errors.intervention_address?.city && (
                <p className="mt-1 text-sm text-red-500">{errors.intervention_address.city.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="intervention_address.postal_code">Code postal</Label>
              <Input
                id="intervention_address.postal_code"
                placeholder="75001"
                {...register('intervention_address.postal_code')}
                className={errors.intervention_address?.postal_code ? 'border-red-500' : ''}
              />
              {errors.intervention_address?.postal_code && (
                <p className="mt-1 text-sm text-red-500">{errors.intervention_address.postal_code.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="intervention_address.country">Pays</Label>
              <Input
                id="intervention_address.country"
                defaultValue="France"
                {...register('intervention_address.country')}
                className={errors.intervention_address?.country ? 'border-red-500' : ''}
              />
              {errors.intervention_address?.country && (
                <p className="mt-1 text-sm text-red-500">{errors.intervention_address.country.message}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Notes d'intervention */}
        <div className="mt-4">
          <Label htmlFor="intervention_notes">Notes d'intervention (accès, particularités, etc.)</Label>
          <Textarea
            id="intervention_notes"
            placeholder="Informations complémentaires pour l'intervention..."
            {...register('intervention_notes')}
            className={errors.intervention_notes ? 'border-red-500' : ''}
          />
          {errors.intervention_notes && (
            <p className="mt-1 text-sm text-red-500">{errors.intervention_notes.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('customer')}
        >
          Retour
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Chargement...' : 'Continuer'}
        </Button>
      </div>
    </form>
  );
} 
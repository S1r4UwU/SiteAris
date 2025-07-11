'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { isValidEmail } from '@/lib/utils';
import { CustomerInfo } from '@/lib/stripe/config';

// Schéma de validation pour les informations du client
const customerInfoSchema = z.object({
  fullName: z.string().min(3, 'Le nom complet est requis (min. 3 caractères)'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  address: z.object({
    street: z.string().min(5, 'Adresse requise'),
    postalCode: z.string().min(5, 'Code postal requis'),
    city: z.string().min(2, 'Ville requise'),
    country: z.string().min(2, 'Pays requis').default('France'),
  }),
  company: z.string().optional(),
  vatNumber: z.string().optional(),
  useSameAddressForShipping: z.boolean().default(true),
  shippingAddress: z.object({
    fullName: z.string().min(3, 'Nom complet requis pour l\'adresse de livraison'),
    phone: z.string().min(10, 'Numéro de téléphone requis pour l\'adresse de livraison'),
    street: z.string().min(5, 'Adresse requise'),
    postalCode: z.string().min(5, 'Code postal requis'),
    city: z.string().min(2, 'Ville requise'),
    country: z.string().min(2, 'Pays requis').default('France'),
    instructions: z.string().optional(),
  }).optional(),
});

type CustomerInfoFormValues = z.infer<typeof customerInfoSchema>;

interface CustomerInfoFormProps {
  onSubmit: (customerInfo: CustomerInfo, shippingInfo?: any) => void;
  isLoading?: boolean;
  initialValues?: Partial<CustomerInfoFormValues>;
}

export default function CustomerInfoForm({
  onSubmit,
  isLoading = false,
  initialValues = {}
}: CustomerInfoFormProps) {
  const [useSameAddress, setUseSameAddress] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
  } = useForm<CustomerInfoFormValues>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      ...initialValues,
      useSameAddressForShipping: true,
    },
    mode: 'onChange',
  });
  
  const handleFormSubmit = (data: CustomerInfoFormValues) => {
    const customerInfo: CustomerInfo = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      address: data.address,
      company: data.company,
      vatNumber: data.vatNumber,
    };
    
    let shippingInfo;
    if (!data.useSameAddressForShipping && data.shippingAddress) {
      shippingInfo = {
        ...data.shippingAddress,
        address: {
          street: data.shippingAddress.street,
          postalCode: data.shippingAddress.postalCode,
          city: data.shippingAddress.city,
          country: data.shippingAddress.country,
        }
      };
    }
    
    onSubmit(customerInfo, shippingInfo);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vos coordonnées</h2>
        
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              placeholder="Jean Dupont"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="jean.dupont@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              placeholder="06 12 34 56 78"
              {...register('phone')}
              error={errors.phone?.message}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Entreprise (facultatif)</Label>
            <Input
              id="company"
              placeholder="Nom de votre entreprise"
              {...register('company')}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vatNumber">Numéro TVA (facultatif)</Label>
          <Input
            id="vatNumber"
            placeholder="FR12345678901"
            {...register('vatNumber')}
          />
        </div>
      </div>
      
      {/* Adresse de facturation */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Adresse de facturation</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address.street">Adresse <span className="text-red-500">*</span></Label>
          <Input
            id="address.street"
            placeholder="123 rue des Exemples"
            {...register('address.street')}
            error={errors.address?.street?.message}
          />
          {errors.address?.street && (
            <p className="text-sm text-red-500">{errors.address.street.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address.postalCode">Code postal <span className="text-red-500">*</span></Label>
            <Input
              id="address.postalCode"
              placeholder="75000"
              {...register('address.postalCode')}
              error={errors.address?.postalCode?.message}
            />
            {errors.address?.postalCode && (
              <p className="text-sm text-red-500">{errors.address.postalCode.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address.city">Ville <span className="text-red-500">*</span></Label>
            <Input
              id="address.city"
              placeholder="Paris"
              {...register('address.city')}
              error={errors.address?.city?.message}
            />
            {errors.address?.city && (
              <p className="text-sm text-red-500">{errors.address.city.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address.country">Pays <span className="text-red-500">*</span></Label>
          <Input
            id="address.country"
            placeholder="France"
            defaultValue="France"
            {...register('address.country')}
            error={errors.address?.country?.message}
          />
          {errors.address?.country && (
            <p className="text-sm text-red-500">{errors.address.country.message}</p>
          )}
        </div>
      </div>
      
      {/* Option d'adresse de livraison/intervention */}
      <div className="pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useSameAddressForShipping"
            checked={useSameAddress}
            onCheckedChange={(checked) => {
              setUseSameAddress(!!checked);
              setValue('useSameAddressForShipping', !!checked);
            }}
          />
          <Label htmlFor="useSameAddressForShipping">
            L'adresse d'intervention est identique à l'adresse de facturation
          </Label>
        </div>
      </div>
      
      {/* Adresse d'intervention */}
      {!useSameAddress && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Adresse d'intervention</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress.fullName">Nom du contact <span className="text-red-500">*</span></Label>
              <Input
                id="shippingAddress.fullName"
                placeholder="Jean Dupont"
                {...register('shippingAddress.fullName')}
                error={errors.shippingAddress?.fullName?.message}
              />
              {errors.shippingAddress?.fullName && (
                <p className="text-sm text-red-500">{errors.shippingAddress.fullName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippingAddress.phone">Téléphone du contact <span className="text-red-500">*</span></Label>
              <Input
                id="shippingAddress.phone"
                placeholder="06 12 34 56 78"
                {...register('shippingAddress.phone')}
                error={errors.shippingAddress?.phone?.message}
              />
              {errors.shippingAddress?.phone && (
                <p className="text-sm text-red-500">{errors.shippingAddress.phone.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shippingAddress.street">Adresse <span className="text-red-500">*</span></Label>
            <Input
              id="shippingAddress.street"
              placeholder="123 rue des Exemples"
              {...register('shippingAddress.street')}
              error={errors.shippingAddress?.street?.message}
            />
            {errors.shippingAddress?.street && (
              <p className="text-sm text-red-500">{errors.shippingAddress.street.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shippingAddress.postalCode">Code postal <span className="text-red-500">*</span></Label>
              <Input
                id="shippingAddress.postalCode"
                placeholder="75000"
                {...register('shippingAddress.postalCode')}
                error={errors.shippingAddress?.postalCode?.message}
              />
              {errors.shippingAddress?.postalCode && (
                <p className="text-sm text-red-500">{errors.shippingAddress.postalCode.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippingAddress.city">Ville <span className="text-red-500">*</span></Label>
              <Input
                id="shippingAddress.city"
                placeholder="Paris"
                {...register('shippingAddress.city')}
                error={errors.shippingAddress?.city?.message}
              />
              {errors.shippingAddress?.city && (
                <p className="text-sm text-red-500">{errors.shippingAddress.city.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shippingAddress.country">Pays <span className="text-red-500">*</span></Label>
            <Input
              id="shippingAddress.country"
              placeholder="France"
              defaultValue="France"
              {...register('shippingAddress.country')}
              error={errors.shippingAddress?.country?.message}
            />
            {errors.shippingAddress?.country && (
              <p className="text-sm text-red-500">{errors.shippingAddress.country.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shippingAddress.instructions">Instructions spéciales (facultatif)</Label>
            <Textarea
              id="shippingAddress.instructions"
              placeholder="Informations utiles pour l'intervention (code d'accès, étage, etc.)"
              {...register('shippingAddress.instructions')}
            />
          </div>
        </div>
      )}
      
      {/* Boutons */}
      <div className="pt-6 flex justify-between">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Retour au panier
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading || !isValid}>
          {isLoading || isSubmitting ? 'Chargement...' : 'Continuer vers le paiement'}
        </Button>
      </div>
    </form>
  );
} 
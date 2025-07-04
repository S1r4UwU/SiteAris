'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schedulingSchema, SchedulingFormValues } from '@/lib/validations/checkout';
import { useCheckoutStore } from '@/lib/store/checkout-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';

export default function SchedulingForm() {
  const { scheduling, updateScheduling, setStep, completeStep } = useCheckoutStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SchedulingFormValues>({
    resolver: zodResolver(schedulingSchema),
    defaultValues: {
      desired_date: scheduling.desired_date || '',
      desired_time_slot: scheduling.desired_time_slot || 'flexible',
      urgency_level: scheduling.urgency_level || 'normal',
      additional_notes: scheduling.additional_notes || '',
    },
  });
  
  const urgencyLevel = watch('urgency_level');
  const timeSlot = watch('desired_time_slot');
  
  const onSubmit = async (data: SchedulingFormValues) => {
    setIsSubmitting(true);
    try {
      // Sauvegarder les données dans le store
      updateScheduling(data);
      
      // Marquer l'étape comme complétée
      completeStep('scheduling');
      
      // Passer à l'étape suivante
      setStep('confirmation');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Planification de l'intervention</h2>
        
        {/* Date souhaitée */}
        <div className="mb-4">
          <Label htmlFor="desired_date">Date souhaitée</Label>
          <div className="relative">
            <Input
              id="desired_date"
              type="date"
              {...register('desired_date')}
              className={errors.desired_date ? 'border-red-500 pr-10' : 'pr-10'}
              min={new Date().toISOString().split('T')[0]}
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          {errors.desired_date && (
            <p className="mt-1 text-sm text-red-500">{errors.desired_date.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Nous vous contacterons pour confirmer la disponibilité
          </p>
        </div>
        
        {/* Créneau souhaité */}
        <div className="mb-6">
          <Label className="text-base mb-2 block">Créneau horaire</Label>
          <RadioGroup 
            defaultValue={timeSlot}
            className="grid grid-cols-2 gap-4"
            onValueChange={(value: string) => setValue('desired_time_slot', value as 'morning' | 'afternoon' | 'all_day' | 'flexible')}
          >
            <div>
              <RadioGroupItem 
                value="morning" 
                id="morning" 
                className="peer sr-only" 
                {...register('desired_time_slot')}
              />
              <Label
                htmlFor="morning"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Matin (8h-12h)</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="afternoon" 
                id="afternoon" 
                className="peer sr-only" 
                {...register('desired_time_slot')}
              />
              <Label
                htmlFor="afternoon"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Après-midi (13h-17h)</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="all_day" 
                id="all_day" 
                className="peer sr-only" 
                {...register('desired_time_slot')}
              />
              <Label
                htmlFor="all_day"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Journée complète</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="flexible" 
                id="flexible" 
                className="peer sr-only" 
                {...register('desired_time_slot')}
              />
              <Label
                htmlFor="flexible"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Flexible</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* Niveau d'urgence */}
        <div className="mb-6">
          <Label className="text-base mb-2 block">Niveau d'urgence</Label>
          <RadioGroup 
            defaultValue={urgencyLevel}
            className="grid grid-cols-3 gap-4"
            onValueChange={(value: string) => setValue('urgency_level', value as 'normal' | 'high' | 'critical')}
          >
            <div>
              <RadioGroupItem 
                value="normal" 
                id="normal" 
                className="peer sr-only" 
                {...register('urgency_level')}
              />
              <Label
                htmlFor="normal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Standard</span>
                <span className="text-xs text-gray-500 mt-1">Délai normal</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="high" 
                id="high" 
                className="peer sr-only" 
                {...register('urgency_level')}
              />
              <Label
                htmlFor="high"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Prioritaire</span>
                <span className="text-xs text-gray-500 mt-1">+15% sur le tarif</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem 
                value="critical" 
                id="critical" 
                className="peer sr-only" 
                {...register('urgency_level')}
              />
              <Label
                htmlFor="critical"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>Urgence</span>
                <span className="text-xs text-gray-500 mt-1">+30% sur le tarif</span>
              </Label>
            </div>
          </RadioGroup>
          {urgencyLevel !== 'normal' && (
            <p className="mt-2 text-sm text-amber-600">
              {urgencyLevel === 'high' 
                ? 'Intervention prioritaire sous 48h avec supplément de 15%.' 
                : 'Intervention d\'urgence sous 24h avec supplément de 30%.'}
            </p>
          )}
        </div>
        
        {/* Notes supplémentaires */}
        <div className="mt-4">
          <Label htmlFor="additional_notes">Notes supplémentaires</Label>
          <Textarea
            id="additional_notes"
            placeholder="Informations complémentaires pour la planification..."
            {...register('additional_notes')}
            className={errors.additional_notes ? 'border-red-500' : ''}
          />
          {errors.additional_notes && (
            <p className="mt-1 text-sm text-red-500">{errors.additional_notes.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('address')}
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
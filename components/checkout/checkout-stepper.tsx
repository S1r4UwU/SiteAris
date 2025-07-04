'use client';

import { Check, CreditCard, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

type CheckoutStep = 'customer-info' | 'payment';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  className?: string;
}

export default function CheckoutStepper({
  currentStep,
  className,
}: CheckoutStepperProps) {
  const steps = [
    {
      id: 'customer-info',
      name: 'Informations client',
      icon: UserRound,
    },
    {
      id: 'payment',
      name: 'Paiement',
      icon: CreditCard,
    },
  ];
  
  return (
    <div className={cn('w-full', className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isComplete = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <li 
              key={step.id} 
              className={cn(
                "flex items-center",
                index !== steps.length - 1 ? "w-full" : ""
              )}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete && "bg-green-500 text-white",
                    !isActive && !isComplete && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "ml-3 text-sm font-medium",
                  isActive && "text-primary",
                  isComplete && "text-green-700",
                  !isActive && !isComplete && "text-muted-foreground"
                )}>
                  {step.name}
                </span>
              </div>
              
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div className={cn(
                  "flex-1 ml-4 mr-4 h-0.5 border-t",
                  isComplete ? "border-green-500" : "border-muted"
                )} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
} 
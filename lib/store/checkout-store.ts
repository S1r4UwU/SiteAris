import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CustomerInfoFormValues,
  AddressesFormValues,
  SchedulingFormValues,
  ConfirmationFormValues
} from '@/lib/validations/checkout';

type CheckoutStep = 'customer-info' | 'shipping' | 'payment' | 'confirmation';

interface OrderInfo {
  orderId: string;
  orderNumber: string;
  status: string;
  amount: number;
  totalAmount: number;
  estimatedCompletionDate: string;
}

interface CheckoutStore {
  // Étape actuelle du checkout
  currentStep: CheckoutStep;
  setStep: (step: CheckoutStep) => void;
  
  // Informations sur la commande
  orderInfo: OrderInfo | null;
  setOrderInfo: (orderInfo: OrderInfo) => void;
  
  // Réinitialisation du store
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      // État par défaut
      currentStep: 'customer-info',
      orderInfo: null,
      
      // Actions
      setStep: (step) => set({ currentStep: step }),
      setOrderInfo: (orderInfo) => set({ orderInfo }),
      resetCheckout: () => set({ 
        currentStep: 'customer-info', 
        orderInfo: null
      })
    }),
    {
      name: 'checkout-store',
      // Ne persister que les informations de commande, pas l'étape actuelle
      partialize: (state) => ({ orderInfo: state.orderInfo })
    }
  )
); 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { Service } from '@/types/services';
import { supabaseClient } from '@/lib/supabase/client';

export type ServiceOption = {
  id: string;
  name: string; 
  value: string | number | boolean;
  price?: number;
};

export type CartItemConfig = {
  serviceId: string;
  slug: string;
  name: string;
  basePrice: number;
  quantity: number;
  options: ServiceOption[];
  totalPrice: number;
  imageUrl?: string;
  configuration?: {
    postes?: number;
    sla?: string;
    urgence?: boolean;
    extras?: string[];
  };
};

interface CartStore {
  items: CartItemConfig[];
  subtotal: number;
  tax: number;
  total: number;
  isInitialized: boolean;
  
  // Actions
  addItem: (item: Omit<CartItemConfig, 'totalPrice'>) => void;
  updateItem: (serviceId: string, updates: Partial<CartItemConfig>) => void;
  removeItem: (serviceId: string) => void;
  clearCart: () => void;
  syncWithUser: (userId?: string) => Promise<void>;
  
  // Calculations
  calculateItemTotal: (item: Omit<CartItemConfig, 'totalPrice'>) => number;
  calculateDepositAmount: () => number;
  recalculateCart: () => void;
  getItemCount: () => number;
}

// TVA française standard
const TVA_RATE = 0.2;
// Pourcentage d'acompte
const DEPOSIT_PERCENTAGE = 0.3;

// Règles de tarification spécifiques par type de service
const PRICING_RULES = {
  // Prix par poste supplémentaire pour la sécurisation réseau
  'securisation-reseau': {
    basePostes: 1,
    extraPostePrice: 150
  },
  // Prix par poste pour la maintenance
  'maintenance-informatique': {
    basePostePrice: 350,
    extraPostePrice: 15
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      isInitialized: false,

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      calculateItemTotal: (item) => {
        const { basePrice, quantity, options, configuration, slug } = item;
        
        // Prix de base multiplié par la quantité
        let totalPrice = basePrice * quantity;
        
        // Appliquer les règles de tarification spéciales selon le type de service
        if (configuration && slug) {
          // Règle pour la sécurisation réseau - prix par poste supplémentaire
          if (slug === 'securisation-reseau' && configuration.postes) {
            const rule = PRICING_RULES['securisation-reseau'];
            const extraPostes = Math.max(0, configuration.postes - rule.basePostes);
            totalPrice += extraPostes * rule.extraPostePrice * quantity;
          }
          
          // Règle pour la maintenance - prix par poste
          if (slug === 'maintenance-informatique' && configuration.postes) {
            const rule = PRICING_RULES['maintenance-informatique'];
            totalPrice = (rule.basePostePrice + (configuration.postes * rule.extraPostePrice)) * quantity;
          }
          
          // Majoration pour urgence si applicable
          if (configuration.urgence) {
            totalPrice *= 1.3; // +30%
          }
          
          // Majoration pour SLA premium
          if (configuration.sla === 'premium') {
            totalPrice *= 1.25; // +25%
          }
        }
        
        // Ajouter le prix des options si elles existent
        if (options) {
          options.forEach(option => {
            if (option.price) {
              totalPrice += option.price * quantity;
            }
          });
        }
        
        return totalPrice;
      },
      
      calculateDepositAmount: () => {
        // Calculer l'acompte de 30% du sous-total
        return Math.round(get().subtotal * DEPOSIT_PERCENTAGE);
      },
      
      recalculateCart: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const tax = subtotal * TVA_RATE;
        const total = subtotal + tax;
        
        set({ subtotal, tax, total });
      },
      
      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(i => i.serviceId === item.serviceId);
        
        // Calculer le prix total pour cet article
        const totalPrice = get().calculateItemTotal(item);
        const newItem = { ...item, totalPrice };
        
        if (existingItemIndex >= 0) {
          // Mettre à jour l'article existant
          const updatedItems = [...items];
          updatedItems[existingItemIndex] = { 
            ...updatedItems[existingItemIndex],
            ...newItem,
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
          };
          
          set({ items: updatedItems });
          toast.success('Quantité mise à jour dans votre panier');
        } else {
          // Ajouter un nouvel article
          set({ items: [...items, newItem] });
          toast.success('Service ajouté à votre panier');
        }
        
        get().recalculateCart();
        
        // Synchronisation avec Supabase si l'utilisateur est connecté
        const syncCart = async () => {
          try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
              await get().syncWithUser(user.id);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation du panier:', error);
          }
        };
        syncCart();
      },
      
      updateItem: (serviceId, updates) => {
        const { items } = get();
        const updatedItems = items.map(item => {
          if (item.serviceId === serviceId) {
            const updatedItem = { ...item, ...updates };
            // Si la quantité, les options ou la configuration ont changé, recalculer le prix total
            if (updates.quantity !== undefined || updates.options !== undefined || 
                updates.basePrice !== undefined || updates.configuration !== undefined) {
              updatedItem.totalPrice = get().calculateItemTotal({
                serviceId: updatedItem.serviceId,
                slug: updatedItem.slug,
                name: updatedItem.name,
                basePrice: updatedItem.basePrice,
                quantity: updatedItem.quantity,
                options: updatedItem.options,
                imageUrl: updatedItem.imageUrl,
                configuration: updatedItem.configuration
              });
            }
            return updatedItem;
          }
          return item;
        });
        
        set({ items: updatedItems });
        get().recalculateCart();
        toast.success('Panier mis à jour');
        
        // Synchronisation avec Supabase si l'utilisateur est connecté
        const syncCart = async () => {
          try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
              await get().syncWithUser(user.id);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation du panier:', error);
          }
        };
        syncCart();
      },
      
      removeItem: (serviceId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.serviceId !== serviceId);
        
        set({ items: updatedItems });
        get().recalculateCart();
        toast.success('Service retiré du panier');
        
        // Synchronisation avec Supabase si l'utilisateur est connecté
        const syncCart = async () => {
          try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
              await get().syncWithUser(user.id);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation du panier:', error);
          }
        };
        syncCart();
      },
      
      clearCart: () => {
        set({ items: [], subtotal: 0, tax: 0, total: 0 });
        toast.success('Votre panier a été vidé');
        
        // Synchronisation avec Supabase si l'utilisateur est connecté
        const syncCart = async () => {
          try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (user) {
              await supabaseClient.from('carts').delete().eq('user_id', user.id);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation du panier:', error);
          }
        };
        syncCart();
      },
      
      syncWithUser: async (userId) => {
        if (!userId) {
          // Si pas d'userId, on récupère l'utilisateur courant
          const { data: { user } } = await supabaseClient.auth.getUser();
          userId = user?.id;
        }
        
        if (!userId) return; // Pas d'utilisateur connecté
        
        const { items } = get();
        
        // Si panier vide mais utilisateur connecté, récupérer le panier depuis Supabase
        if (items.length === 0 && !get().isInitialized) {
          const { data: cartData } = await supabaseClient
            .from('carts')
            .select('cart_items')
            .eq('user_id', userId)
            .single();
            
          if (cartData && cartData.cart_items?.length > 0) {
            set({ items: cartData.cart_items, isInitialized: true });
            get().recalculateCart();
            return;
          }
        }
        
        // Si panier local, sauvegarder dans Supabase
        if (items.length > 0) {
          // Vérifier si le panier existe déjà
          const { data: existingCart } = await supabaseClient
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single();
            
          if (existingCart) {
            // Mettre à jour le panier existant
            await supabaseClient
              .from('carts')
              .update({ cart_items: items, updated_at: new Date().toISOString() })
              .eq('user_id', userId);
          } else {
            // Créer un nouveau panier
            await supabaseClient
              .from('carts')
              .insert({ 
                user_id: userId,
                cart_items: items,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
        }
        
        set({ isInitialized: true });
      }
    }),
    {
      name: 'sitearis-cart', // nom pour localStorage
      partialize: (state) => ({ items: state.items, subtotal: state.subtotal, tax: state.tax, total: state.total }),
    }
  )
); 
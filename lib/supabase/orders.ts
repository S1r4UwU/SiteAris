import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import type { Database } from '@/types/supabase';
import { CartItemConfig } from '@/lib/store/cart-store';

export type OrderForm = {
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  billing_address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  intervention_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  desired_date?: string;
  notes?: string;
};

export type CreateOrderParams = {
  items: CartItemConfig[];
  total_amount: number;
  deposit_amount: number;
  orderForm: OrderForm;
};

export type Order = {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_amount: number;
  deposit_amount: number;
  payment_status: 'awaiting_payment' | 'deposit_paid' | 'fully_paid' | 'refunded';
  created_at: string;
};

export const orderClient = {
  // Créer une nouvelle commande
  async create(params: CreateOrderParams): Promise<{ orderId: string; orderNumber: string } | null> {
    try {
      const supabase = createClientComponentClient<Database>();
      
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { items, total_amount, deposit_amount, orderForm } = params;
      
      // Créer la commande principale
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount,
          deposit_amount,
          status: 'pending',
          payment_status: 'awaiting_payment',
          client_name: orderForm.client_name,
          client_email: orderForm.client_email,
          client_phone: orderForm.client_phone,
          client_company: orderForm.client_company,
          billing_address: orderForm.billing_address,
          intervention_address: orderForm.intervention_address || orderForm.billing_address,
          desired_date: orderForm.desired_date ? new Date(orderForm.desired_date).toISOString() : null,
          notes: orderForm.notes
        })
        .select('id, order_number')
        .single();
      
      if (orderError || !order) {
        console.error('Erreur lors de la création de la commande:', orderError);
        return null;
      }
      
      // Ajouter les éléments de commande
      const orderItems = items.map(item => ({
        order_id: order.id,
        service_id: item.serviceId,
        quantity: item.quantity,
        unit_price: item.basePrice,
        total_price: item.totalPrice,
        configuration: item.options
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Erreur lors de l\'ajout des éléments de commande:', itemsError);
        return null;
      }
      
      return { orderId: order.id, orderNumber: order.order_number };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return null;
    }
  },
  
  // Obtenir une commande par son ID
  async getById(id: string): Promise<Order | null> {
    try {
      const supabase = createClientComponentClient<Database>();
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        return null;
      }
      
      return data as unknown as Order;
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return null;
    }
  },
  
  // Obtenir les commandes de l'utilisateur courant
  async getCurrentUserOrders(): Promise<Order[] | null> {
    try {
      const supabase = createClientComponentClient<Database>();
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        return null;
      }
      
      return data as unknown as Order[];
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return null;
    }
  }
}; 
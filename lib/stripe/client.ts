import Stripe from 'stripe';

// Vérifier que la clé API Stripe est définie
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('La variable d\'environnement STRIPE_SECRET_KEY est requise');
}

// Client Stripe pour les API Routes côté serveur
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Dernière version de l'API Stripe
  appInfo: {
    name: 'SiteAris',
    version: '1.0.0',
  },
});

// Constantes pour les webhooks
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Helper pour formater les montants pour Stripe (en centimes)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper pour formater les montants depuis Stripe (en euros)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Helper pour calculer le montant de l'acompte (30% par défaut)
export const calculateDepositAmount = (total: number, depositRate = 0.3): number => {
  return Math.round(total * depositRate * 100) / 100;
};

// Helper pour définir le taux d'acompte selon le type de service
export const getDepositRateByServiceType = (serviceSlug: string): number => {
  // Règles spécifiques par type de service
  switch (serviceSlug) {
    case 'formation-sensibilisation-phishing':
    case 'formation-securite':
      return 0.5; // 50% pour les formations
    case 'maintenance-informatique':
    case 'support-technique':
      return 1.0; // 100% pour le premier mois de maintenance
    default:
      return 0.3; // 30% par défaut pour les autres services
  }
};

// Type pour la création d'un intent de paiement
export type CreatePaymentIntentParams = {
  amount: number; // Montant en euros (sera converti en centimes)
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  isDeposit?: boolean;
  metadata?: Record<string, string>;
};

// Client Stripe pour les opérations de paiement
export const stripeClient = {
  // Créer un intent de paiement
  async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const { 
        amount, 
        orderId, 
        orderNumber, 
        customerEmail, 
        customerName, 
        isDeposit = false, 
        metadata = {} 
      } = params;

      // Convertir le montant en centimes
      const amountInCents = Math.round(amount * 100);
      
      // Description du paiement
      const description = isDeposit 
        ? `Acompte pour la commande ${orderNumber}`
        : `Paiement pour la commande ${orderNumber}`;
      
      // Créer un customer ou le récupérer s'il existe déjà
      const { id: customerId } = await this.getOrCreateCustomer(customerEmail, customerName);
      
      // Créer l'intent de paiement
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        customer: customerId,
        description,
        receipt_email: customerEmail,
        metadata: {
          orderId,
          orderNumber,
          isDeposit: isDeposit ? 'true' : 'false',
          ...metadata
        },
        payment_method_types: ['card'],
        setup_future_usage: 'off_session',
        // France spécifique
        payment_method_options: {
          card: {
            installments: {
              enabled: true
            },
          },
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Erreur lors de la création du payment intent:', error);
      throw error;
    }
  },

  // Récupérer un intent de paiement
  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Erreur lors de la récupération du payment intent:', error);
      throw error;
    }
  },

  // Créer ou récupérer un client Stripe
  async getOrCreateCustomer(email: string, name: string) {
    try {
      // Rechercher le client par email
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });

      // Si le client existe, le retourner
      if (customers.data.length > 0) {
        return customers.data[0];
      }

      // Sinon, créer un nouveau client
      return await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'SiteAris Platform'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération ou création du client Stripe:', error);
      throw error;
    }
  }
}; 
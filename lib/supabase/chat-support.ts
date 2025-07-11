"use client";

import { createClient } from './client';

// Types pour le chat de support
export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'USER' | 'SUPPORT';
  content: string;
  created_at: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  status: 'OPEN' | 'CLOSED' | 'PENDING';
  subject: string;
  last_message?: string;
  unread_count?: number;
  created_at: string;
  updated_at: string;
}

// Client mock pour le chat de support
export const chatClient = {
  // Récupérer les conversations de l'utilisateur
  getUserConversations: async (): Promise<ChatConversation[]> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retourner des conversations mock
    return [
      {
        id: 'conv-1',
        user_id: 'user-1',
        status: 'OPEN',
        subject: 'Problème avec ma commande',
        last_message: 'Bonjour, je n\'ai toujours pas reçu de confirmation pour ma commande #12345',
        unread_count: 1,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'conv-2',
        user_id: 'user-1',
        status: 'CLOSED',
        subject: 'Question sur vos services',
        last_message: 'Merci pour votre réponse !',
        unread_count: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
      }
    ];
  },
  
  // Récupérer les messages d'une conversation
  getConversationMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retourner des messages mock
    return [
      {
        id: 'msg-1',
        conversation_id: conversationId,
        sender_id: 'user-1',
        sender_type: 'USER',
        content: 'Bonjour, je n\'ai toujours pas reçu de confirmation pour ma commande #12345',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: true
      },
      {
        id: 'msg-2',
        conversation_id: conversationId,
        sender_id: 'support-1',
        sender_type: 'SUPPORT',
        content: 'Bonjour, merci de nous avoir contactés. Je vérifie cela immédiatement.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        read: true
      },
      {
        id: 'msg-3',
        conversation_id: conversationId,
        sender_id: 'support-1',
        sender_type: 'SUPPORT',
        content: 'Je viens de vérifier, votre commande a bien été enregistrée. Vous devriez recevoir un email de confirmation dans les prochaines minutes.',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false
      }
    ];
  },
  
  // Envoyer un nouveau message
  sendMessage: async (conversationId: string, content: string): Promise<ChatMessage> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler l'envoi d'un message
    return {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: 'user-1',
      sender_type: 'USER',
      content,
      created_at: new Date().toISOString(),
      read: false
    };
  },
  
  // Créer une nouvelle conversation
  createConversation: async (subject: string, initialMessage: string): Promise<ChatConversation> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler la création d'une conversation
    const conversationId = `conv-${Date.now()}`;
    
    // Simuler l'envoi du message initial
    await chatClient.sendMessage(conversationId, initialMessage);
    
    // Retourner la nouvelle conversation
    return {
      id: conversationId,
      user_id: 'user-1',
      status: 'OPEN',
      subject,
      last_message: initialMessage,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },
  
  // Marquer une conversation comme lue
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dans un environnement réel, on mettrait à jour la base de données
    console.log(`Conversation ${conversationId} marquée comme lue`);
  }
};

// Fonction pour obtenir un client chat côté serveur
export function getServerChatClient() {
  return {
    getAllConversations: async () => {
      // Simuler des conversations pour tous les utilisateurs
      return [
        {
          id: 'conv-1',
          user_id: 'user-1',
          status: 'OPEN',
          subject: 'Problème avec ma commande',
          last_message: 'Bonjour, je n\'ai toujours pas reçu de confirmation pour ma commande #12345',
          unread_count: 1,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 'conv-2',
          user_id: 'user-1',
          status: 'CLOSED',
          subject: 'Question sur vos services',
          last_message: 'Merci pour votre réponse !',
          unread_count: 0,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
        },
        {
          id: 'conv-3',
          user_id: 'user-2',
          status: 'PENDING',
          subject: 'Demande de devis',
          last_message: 'Pouvez-vous me donner plus d\'informations sur vos tarifs ?',
          unread_count: 2,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
        }
      ];
    },
    
    // Autres méthodes nécessaires pour l'administration...
  };
}

// Créer un client Supabase pour le chat
const supabase = createClient();

// Hook d'authentification simplifié
export const useAuth = () => {
  return {
    user: { id: 'mock-user-id', email: 'user@example.com' },
    isLoading: false
  };
}; 
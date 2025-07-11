/**
 * Service de chat support en temps réel avec Supabase Realtime - Côté serveur
 * Fonctionnalités accessibles uniquement depuis les Server Components
 */

import { createServerComponentClient } from './helpers';
import { cookies } from 'next/headers';
import { ChatConversation, ChatMessage } from './chat-support';

// Fonction pour récupérer toutes les conversations côté serveur
export async function getServerConversations(): Promise<ChatConversation[]> {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return [];
  }
  
  // Simuler la récupération des conversations
  return [
    {
      id: 'conv-1',
      user_id: session.user.id,
      status: 'OPEN',
      subject: 'Problème avec ma commande',
      last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: 'conv-2',
      user_id: session.user.id,
      status: 'CLOSED',
      subject: 'Question sur le service d\'audit',
      last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
    }
  ];
}

// Fonction pour récupérer les messages d'une conversation côté serveur
export async function getServerMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return [];
  }
  
  // Simuler la récupération des messages
  return [
    {
      id: 'msg-1',
      conversation_id: conversationId,
      user_id: session.user.id,
      is_admin: false,
      content: 'Bonjour, j\'ai un problème avec ma commande #ORD-123456. Je n\'ai pas reçu de confirmation par email.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: 'msg-2',
      conversation_id: conversationId,
      user_id: 'admin-id',
      is_admin: true,
      content: 'Bonjour, merci de nous avoir contactés. Je vérifie immédiatement votre commande.',
      created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
    },
    {
      id: 'msg-3',
      conversation_id: conversationId,
      user_id: 'admin-id',
      is_admin: true,
      content: 'J\'ai vérifié votre commande et je vois que l\'email de confirmation a bien été envoyé à votre adresse. Pourriez-vous vérifier votre dossier spam ?',
      created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString()
    },
    {
      id: 'msg-4',
      conversation_id: conversationId,
      user_id: session.user.id,
      is_admin: false,
      content: 'Vous avez raison, je l\'ai trouvé dans mon dossier spam. Merci beaucoup pour votre aide !',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
  ].filter(message => message.conversation_id === conversationId);
}

// Créer un client pour le chat de support côté serveur
export const serverChatClient = {
  getServerConversations,
  getServerMessages
}; 
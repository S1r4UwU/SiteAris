// Helpers pour les clients Supabase
import { createClient } from './client';

// Type pour la session utilisateur
export interface UserSession {
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

// Fonction pour créer un client Supabase pour les composants côté serveur
export function createServerComponentClient({ cookies }: { cookies: any }) {
  // On réutilise le client mock de client.ts
  const client = createClient();
  
  // On surcharge la méthode getSession pour retourner une session simulée avec un ID utilisateur valide
  const authWithSession = {
    ...client.auth,
    getSession: () => Promise.resolve({ 
      data: { 
        session: { 
          user: { 
            id: 'mock-user-id',
            email: 'user@example.com',
            role: 'USER'
          } 
        } 
      },
      error: null
    })
  };
  
  return {
    ...client,
    auth: authWithSession
  };
}

// Fonction pour créer un client Supabase pour les composants côté client
export function createClientComponentClient() {
  return createClient();
}

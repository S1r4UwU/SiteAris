"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // S'abonner aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    checkUser();

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { error: error as Error };
    }
  };

  // Fonction d'inscription
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      return { error };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { error: error as Error };
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction de réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { error: error as Error };
    }
  };

  // Pour le développement en mode mock, on peut simuler un utilisateur connecté
  if (process.env.NODE_ENV === 'development' && !user) {
    return {
      user: { 
        id: 'mock-user-id', 
        email: 'user@example.com',
        user_metadata: { full_name: 'Utilisateur Test' }
      } as User,
      isLoading: false,
      signIn,
      signUp,
      signOut,
      resetPassword,
    };
  }

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
} 
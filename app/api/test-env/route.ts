import { NextResponse } from 'next/server';
import { supabaseConfig } from '@/lib/supabase/config';

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    const envCheck = {
      supabaseUrl: supabaseConfig.supabaseUrl,
      supabaseKey: supabaseConfig.supabaseKey ? 'Présent (masqué)' : 'Manquant',
      processEnvNextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Manquant',
      processEnvNextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Présent (masqué)' : 'Manquant',
    };

    return NextResponse.json({ 
      status: 'success', 
      message: 'Test des variables d\'environnement',
      data: envCheck
    });
  } catch (error) {
    console.error('Erreur lors du test des variables d\'environnement:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erreur lors du test des variables d\'environnement',
      error: String(error)
    }, { status: 500 });
  }
} 
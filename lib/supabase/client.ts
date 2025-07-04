import { createBrowserClient } from '@supabase/ssr'
import { supabaseConfig } from './config'

// Utilise les valeurs de configuration au lieu des variables d'environnement
export const createClient = () =>
  createBrowserClient(
    supabaseConfig.supabaseUrl,
    supabaseConfig.supabaseKey
  )

// Client préconfiguré pour une utilisation facile dans les composants
export const supabaseClient = createBrowserClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseKey
) 
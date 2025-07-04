import { createClientComponentClient as originalCreateClientComponentClient, createServerComponentClient as originalCreateServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabaseConfig } from './config';
import { Database } from '@/types/supabase';

// Wrapper pour createClientComponentClient qui utilise la configuration codée en dur
export function createClientComponentClient<T = Database>() {
  return originalCreateClientComponentClient<T>({
    supabaseUrl: supabaseConfig.supabaseUrl,
    supabaseKey: supabaseConfig.supabaseKey
  } as any);
}

// Wrapper pour createServerComponentClient qui utilise la configuration codée en dur
export function createServerComponentClient<T = Database>(options: { cookies: any }) {
  return originalCreateServerComponentClient<T>({
    cookies: options.cookies,
    supabaseUrl: supabaseConfig.supabaseUrl,
    supabaseKey: supabaseConfig.supabaseKey
  } as any);
} 
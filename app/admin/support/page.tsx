import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';

// Importer le composant client avec dynamic pour éviter les erreurs SSR
const SupportChatDashboard = dynamic(
  () => import('@/components/admin/support-chat-dashboard').then(mod => mod.SupportChatDashboard),
  { ssr: false }
);

export default async function SupportPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté et a un rôle administrateur
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Support Client</h1>
      <SupportChatDashboard />
    </div>
  );
} 
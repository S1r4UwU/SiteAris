import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { ReportDashboard } from '@/components/admin/report-dashboard';
import { reportingClient } from '@/lib/supabase/reporting';

export default async function ReportsPage() {
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
  
  // Charger les données pour les rapports
  const templates = await reportingClient.getReportTemplates();
  const savedReports = await reportingClient.getSavedReports();
  const dashboards = await reportingClient.getDashboards();
  
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Rapports & Analyses</h1>
      
      <ReportDashboard 
        initialData={{
          templates,
          savedReports,
          dashboards,
          recentResults: []
        }} 
      />
    </div>
  );
} 
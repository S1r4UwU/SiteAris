import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importer les composants client avec dynamic pour éviter les erreurs SSR
const AdminStatsOverview = dynamic(() => import('@/components/admin/admin-stats-overview'), { ssr: false });
const SLADashboard = dynamic(() => import('@/components/admin/sla-dashboard'), { ssr: false });

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  monthlyRevenue: number;
  monthlyChange: number;
  ordersChange: number;
}

export default async function StatsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté et a les droits d'admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Récupérer les informations sur l'utilisateur pour vérifier son rôle
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (!userData || userData.role !== 'ADMIN') {
    redirect('/account');
  }
  
  // Données des 6 derniers mois pour le graphique de revenus
  const revenueData = getLast6Months().map((month) => {
    return {
      name: month.label,
      total: month.revenue
    };
  });
  
  // Données des 6 derniers mois pour le graphique des commandes
  const ordersData = getLast6Months().map((month) => {
    return {
      name: month.label,
      total: month.orders
    };
  });
  
  // Statistiques globales
  const stats: StatsData = {
    totalRevenue: 156700,
    totalOrders: 234,
    totalUsers: 178,
    pendingOrders: 24,
    averageOrderValue: 670,
    conversionRate: 3.2,
    monthlyRevenue: 24500,
    monthlyChange: 8.5,
    ordersChange: 12.3
  };
  
  // Alertes
  const alerts = {
    pendingOrdersCount: 8,
    lowStockCount: 3,
    issuesCount: 5
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Statistiques et Performance</h1>
      
      <div className="space-y-10">
        {/* Vue d'ensemble des statistiques */}
        <AdminStatsOverview 
          revenueData={revenueData}
          ordersData={ordersData}
          stats={stats}
          alerts={alerts}
        />
        
        {/* Dashboard des SLA */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Performance des SLA</h2>
          <SLADashboard />
        </div>
        
        {/* Métriques de performance du site */}
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Performance du site</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Temps de chargement moyen</span>
                <span className="text-2xl font-bold">1.2s</span>
                <span className="text-green-600 text-xs">-15% vs mois précédent</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">First Contentful Paint</span>
                <span className="text-2xl font-bold">0.8s</span>
                <span className="text-green-600 text-xs">-5% vs mois précédent</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">Cumulative Layout Shift</span>
                <span className="text-2xl font-bold">0.03</span>
                <span className="text-green-600 text-xs">Stable</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Pages les plus performantes</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">URL</th>
                    <th className="text-right py-2">Chargement</th>
                    <th className="text-right py-2">FCP</th>
                    <th className="text-right py-2">LCP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">/</td>
                    <td className="text-right py-2">0.9s</td>
                    <td className="text-right py-2">0.7s</td>
                    <td className="text-right py-2">1.2s</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">/services</td>
                    <td className="text-right py-2">1.1s</td>
                    <td className="text-right py-2">0.8s</td>
                    <td className="text-right py-2">1.4s</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">/account</td>
                    <td className="text-right py-2">1.3s</td>
                    <td className="text-right py-2">1.0s</td>
                    <td className="text-right py-2">1.6s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction pour générer des données de test pour les 6 derniers mois
const getLast6Months = () => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = month.toLocaleDateString('fr-FR', { month: 'short' });
    const year = month.getFullYear();
    
    months.push({
      date: month,
      label: `${monthName} ${year}`,
      revenue: Math.floor(Math.random() * 20000) + 10000,
      orders: Math.floor(Math.random() * 40) + 20
    });
  }
  
  return months;
}; 
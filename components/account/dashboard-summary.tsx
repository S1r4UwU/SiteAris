'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Package2, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

interface DashboardSummaryProps {
  userId: string;
}

interface Metrics {
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  upcomingServices: number;
  lastUpdateTime: string;
}

export default function DashboardSummary({ userId }: DashboardSummaryProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    upcomingServices: 0,
    lastUpdateTime: new Date().toISOString()
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        // Dans une implémentation réelle, vous feriez un appel API
        // mais pour l'instant nous simulons les données
        const response = await fetch(`/api/account/metrics?userId=${userId}`);
        
        if (!response.ok) {
          // Données simulées en cas d'erreur
          setTimeout(() => {
            setMetrics({
              activeOrders: 2,
              completedOrders: 5,
              totalSpent: 2750.00,
              upcomingServices: 1,
              lastUpdateTime: new Date().toISOString()
            });
            setLoading(false);
          }, 500);
          return;
        }
        
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des métriques:', error);
        // Données simulées en cas d'erreur
        setMetrics({
          activeOrders: 2,
          completedOrders: 5,
          totalSpent: 2750.00,
          upcomingServices: 1,
          lastUpdateTime: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardMetrics();
  }, [userId]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commandes actives</CardTitle>
          <Package2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : metrics.activeOrders}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.activeOrders === 1 ? '1 commande en cours' : `${metrics.activeOrders} commandes en cours`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Services complétés</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : metrics.completedOrders}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.completedOrders === 0 ? 'Aucun service' : metrics.completedOrders === 1 ? '1 service terminé' : `${metrics.completedOrders} services terminés`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total investi</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : formatPrice(metrics.totalSpent)}</div>
          <p className="text-xs text-muted-foreground">
            En services informatiques et sécurité
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Services à venir</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : metrics.upcomingServices}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.upcomingServices === 0 ? 'Aucune intervention prévue' : metrics.upcomingServices === 1 ? '1 intervention planifiée' : `${metrics.upcomingServices} interventions planifiées`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 
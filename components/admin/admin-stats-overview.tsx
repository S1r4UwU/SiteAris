"use client";

import React from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Users, 
  Package2, 
  Calendar, 
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Importer le composant de graphique avec dynamic pour éviter les erreurs SSR
const AdminStatsChart = dynamic(() => import('@/components/admin/stats-chart'), { ssr: false });

interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description: string;
}

interface AdminStatsOverviewProps {
  revenueData: { name: string; total: number }[];
  ordersData: { name: string; total: number }[];
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    pendingOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    monthlyRevenue: number;
    monthlyChange: number;
    ordersChange: number;
  };
  alerts: {
    pendingOrdersCount: number;
    lowStockCount: number;
    issuesCount: number;
  };
}

export default function AdminStatsOverview({
  revenueData,
  ordersData,
  stats,
  alerts
}: AdminStatsOverviewProps) {
  const statCards: StatCard[] = [
    {
      title: "Chiffre d'affaires mensuel",
      value: formatPrice(stats.monthlyRevenue),
      change: stats.monthlyChange,
      icon: <CreditCard className="h-8 w-8 text-muted-foreground opacity-50" />,
      description: `${stats.monthlyChange >= 0 ? '+' : ''}${stats.monthlyChange.toFixed(1)}% vs mois précédent`
    },
    {
      title: "Commandes",
      value: stats.totalOrders,
      change: stats.ordersChange,
      icon: <Package2 className="h-8 w-8 text-muted-foreground opacity-50" />,
      description: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}% vs mois précédent`
    },
    {
      title: "Clients",
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8 text-muted-foreground opacity-50" />,
      description: "Clients actifs"
    },
    {
      title: "Panier moyen",
      value: formatPrice(stats.averageOrderValue),
      icon: <TrendingUp className="h-8 w-8 text-muted-foreground opacity-50" />,
      description: "Par commande"
    },
    {
      title: "Taux de conversion",
      value: `${stats.conversionRate}%`,
      icon: <Percent className="h-8 w-8 text-muted-foreground opacity-50" />,
      description: "Visiteurs → Clients"
    },
    {
      title: "Commandes en attente",
      value: stats.pendingOrders,
      icon: <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />,
      description: "À traiter"
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.change !== undefined && (
                <div className="flex items-center pt-1 text-xs">
                  {card.change > 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{card.change.toFixed(1)}%</span>
                    </>
                  ) : card.change < 0 ? (
                    <>
                      <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                      <span className="text-red-500">{card.change.toFixed(1)}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Stable</span>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires</CardTitle>
            <CardDescription>
              Évolution sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <AdminStatsChart data={revenueData} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes</CardTitle>
            <CardDescription>
              Évolution sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <AdminStatsChart data={ordersData} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(alerts.pendingOrdersCount > 0 || alerts.lowStockCount > 0 || alerts.issuesCount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.pendingOrdersCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package2 className="mr-2 h-5 w-5 text-amber-500" />
                    <span>{alerts.pendingOrdersCount} commande(s) en attente</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              )}
              
              {alerts.lowStockCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    <span>{alerts.lowStockCount} produit(s) en stock faible</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              )}
              
              {alerts.issuesCount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-blue-500" />
                    <span>{alerts.issuesCount} problème(s) technique(s) signalé(s)</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
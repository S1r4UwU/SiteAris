'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Users, 
  Package2, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Importer le composant de graphique si disponible
import AdminStatsChart from '@/components/admin/stats-chart';

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
  const [periodFilter, setPeriodFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Cartes de statistiques principales
  const mainStats: StatCard[] = [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats.totalRevenue),
      change: stats.monthlyChange,
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
      description: `${formatPrice(stats.monthlyRevenue)} ce mois-ci`
    },
    {
      title: 'Commandes',
      value: stats.totalOrders,
      change: stats.ordersChange,
      icon: <Package2 className="h-5 w-5 text-muted-foreground" />,
      description: `${stats.pendingOrders} en attente`
    },
    {
      title: 'Clients',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      description: 'Total utilisateurs'
    },
    {
      title: 'Panier moyen',
      value: formatPrice(stats.averageOrderValue),
      icon: <BarChart3 className="h-5 w-5 text-muted-foreground" />,
      description: `Taux de conversion: ${stats.conversionRate}%`
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== undefined && (
                <div className="flex items-center pt-1 text-xs">
                  {stat.change > 0 ? (
                    <>
                      <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{stat.change.toFixed(1)}%</span>
                    </>
                  ) : stat.change < 0 ? (
                    <>
                      <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                      <span className="text-red-500">{stat.change.toFixed(1)}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Stable</span>
                  )}
                  <span className="text-muted-foreground ml-1">vs mois précédent</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="revenue">Chiffre d'affaires</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button 
              variant={periodFilter === 'day' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setPeriodFilter('day')}
            >
              Jour
            </Button>
            <Button 
              variant={periodFilter === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setPeriodFilter('week')}
            >
              Semaine
            </Button>
            <Button 
              variant={periodFilter === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setPeriodFilter('month')}
            >
              Mois
            </Button>
            <Button 
              variant={periodFilter === 'year' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setPeriodFilter('year')}
            >
              Année
            </Button>
          </div>
        </div>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>
                Analyse du chiffre d'affaires sur les 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {AdminStatsChart ? (
                <AdminStatsChart data={revenueData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Chargement du graphique...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Dernière mise à jour: {new Date().toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/stats">
                  Statistiques détaillées
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des commandes</CardTitle>
              <CardDescription>
                Nombre de commandes sur les 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {AdminStatsChart ? (
                <AdminStatsChart data={ordersData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Chargement du graphique...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Dernière mise à jour: {new Date().toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">
                  Voir toutes les commandes
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taux de conversion</CardTitle>
              <CardDescription>
                Analyse du taux de conversion et performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-5xl font-bold mb-4">{stats.conversionRate}%</div>
                <p className="text-muted-foreground mb-6">Taux de conversion moyen</p>
                <div className="w-full max-w-md grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <p className="text-sm text-muted-foreground">Commandes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatPrice(stats.averageOrderValue)}</div>
                    <p className="text-sm text-muted-foreground">Panier moyen</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertes et actions requises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Actions requises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.pendingOrdersCount > 0 && (
              <div className="flex items-start">
                <Clock className="mr-2 h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">{alerts.pendingOrdersCount} commande(s) en attente</p>
                  <p className="text-sm text-muted-foreground">
                    Des commandes nécessitent votre attention
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/admin/orders?status=PENDING">
                      Traiter les commandes
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            {alerts.lowStockCount > 0 && (
              <div className="flex items-start">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">{alerts.lowStockCount} service(s) à configurer</p>
                  <p className="text-sm text-muted-foreground">
                    Des services nécessitent une configuration
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/admin/services">
                      Gérer les services
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            {alerts.issuesCount > 0 && (
              <div className="flex items-start">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">{alerts.issuesCount} problème(s) signalé(s)</p>
                  <p className="text-sm text-muted-foreground">
                    Des problèmes ont été signalés et nécessitent votre attention
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/admin/issues">
                      Voir les problèmes
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            {alerts.pendingOrdersCount === 0 && alerts.lowStockCount === 0 && alerts.issuesCount === 0 && (
              <div className="flex items-start">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Tout est à jour</p>
                  <p className="text-sm text-muted-foreground">
                    Aucune action requise pour le moment
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
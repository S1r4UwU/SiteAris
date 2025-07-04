import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { formatPrice } from '@/lib/utils';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Calendar, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ArrowRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStatsChart from '@/components/admin/stats-chart';

export default async function StatsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Récupérer les données des commandes
  const { data: orderData } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at');
    
  // Récupérer les données des utilisateurs
  const { data: userData } = await supabase
    .from('users')
    .select('id, role, created_at');
    
  // Récupérer les données des services
  const { data: serviceData } = await supabase
    .from('services')
    .select('id, name, price, category');
  
  // Fonction pour obtenir les données des 12 derniers mois
  const getLast12Months = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString('fr-FR', { month: 'short' }),
        year: date.getFullYear(),
        date: date,
      };
    }).reverse();
  };
  
  // Données pour les 12 derniers mois
  const last12Months = getLast12Months();
  
  // Calculer les revenus mensuels
  const monthlyRevenue = last12Months.map(month => {
    const startOfMonth = new Date(month.date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(month.date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const monthlyOrders = orderData?.filter(
      order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startOfMonth && orderDate <= endOfMonth && order.status !== 'CANCELLED';
      }
    ) || [];
    
    const revenue = monthlyOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    return {
      name: `${month.month} ${month.year}`,
      total: revenue,
    };
  });
  
  // Calculer les commandes mensuelles
  const monthlyOrders = last12Months.map(month => {
    const startOfMonth = new Date(month.date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(month.date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const monthlyOrders = orderData?.filter(
      order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startOfMonth && orderDate <= endOfMonth;
      }
    ) || [];
    
    return {
      name: `${month.month} ${month.year}`,
      total: monthlyOrders.length,
    };
  });
  
  // Calculer les inscriptions mensuelles
  const monthlySignups = last12Months.map(month => {
    const startOfMonth = new Date(month.date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date(month.date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const monthlyUsers = userData?.filter(
      user => {
        const userDate = new Date(user.created_at);
        return userDate >= startOfMonth && userDate <= endOfMonth;
      }
    ) || [];
    
    return {
      name: `${month.month} ${month.year}`,
      total: monthlyUsers.length,
    };
  });
  
  // Calculer les revenus par catégorie de service
  const revenueByCategory = {};
  orderData?.forEach(order => {
    const service = serviceData?.find(s => s.id === order.service_id);
    if (service && order.status !== 'CANCELLED') {
      const category = service.category || 'Non catégorisé';
      revenueByCategory[category] = (revenueByCategory[category] || 0) + Number(order.total_amount);
    }
  });
  
  const categoryRevenueData = Object.entries(revenueByCategory).map(([category, revenue]) => ({
    name: category,
    total: Number(revenue),
  })).sort((a, b) => b.total - a.total);
  
  // Calculer les KPI
  const totalRevenue = orderData?.reduce(
    (sum, order) => order.status !== 'CANCELLED' ? sum + Number(order.total_amount) : sum, 0
  ) || 0;
  
  const totalOrders = orderData?.length || 0;
  const completedOrders = orderData?.filter(order => order.status === 'COMPLETED').length || 0;
  const conversionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  
  const totalUsers = userData?.length || 0;
  const clientUsers = userData?.filter(user => user.role === 'USER').length || 0;
  
  // Calculer les variations par rapport au mois précédent
  const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1].total;
  const previousMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2].total;
  const revenueChange = previousMonthRevenue !== 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0;
    
  const currentMonthOrders = monthlyOrders[monthlyOrders.length - 1].total;
  const previousMonthOrders = monthlyOrders[monthlyOrders.length - 2].total;
  const ordersChange = previousMonthOrders !== 0 
    ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
    : 0;
    
  const currentMonthSignups = monthlySignups[monthlySignups.length - 1].total;
  const previousMonthSignups = monthlySignups[monthlySignups.length - 2].total;
  const signupsChange = previousMonthSignups !== 0 
    ? ((currentMonthSignups - previousMonthSignups) / previousMonthSignups) * 100
    : 0;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Statistiques et Analyses</h1>
          <p className="text-muted-foreground">
            Analyse détaillée des performances commerciales
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline" asChild>
            <a href="/api/admin/stats/export">
              <Download className="mr-2 h-4 w-4" />
              Exporter les données
            </a>
          </Button>
        </div>
      </div>
      
      {/* KPI principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'affaires
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <div className="flex items-center pt-1 text-xs">
              {revenueChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{revenueChange.toFixed(1)}%</span>
                </>
              ) : revenueChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{revenueChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <Minus className="mr-1 h-3 w-3 text-gray-500" />
                  <span className="text-muted-foreground">Stable</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs mois précédent</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center pt-1 text-xs">
              {ordersChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{ordersChange.toFixed(1)}%</span>
                </>
              ) : ordersChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{ordersChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <Minus className="mr-1 h-3 w-3 text-gray-500" />
                  <span className="text-muted-foreground">Stable</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs mois précédent</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de conversion
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground pt-1">
              {completedOrders} commandes terminées sur {totalOrders}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nouveaux clients
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthSignups}</div>
            <div className="flex items-center pt-1 text-xs">
              {signupsChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{signupsChange.toFixed(1)}%</span>
                </>
              ) : signupsChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{signupsChange.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <Minus className="mr-1 h-3 w-3 text-gray-500" />
                  <span className="text-muted-foreground">Stable</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs mois précédent</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Graphiques */}
      <Tabs defaultValue="revenue" className="mb-6">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="revenue">Chiffre d'affaires</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>
                Chiffre d'affaires mensuel sur les 12 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminStatsChart data={monthlyRevenue} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des commandes</CardTitle>
              <CardDescription>
                Nombre de commandes mensuelles sur les 12 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminStatsChart data={monthlyOrders} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des inscriptions</CardTitle>
              <CardDescription>
                Nombre d'inscriptions mensuelles sur les 12 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminStatsChart data={monthlySignups} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Répartition par catégorie */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Répartition du chiffre d'affaires par catégorie</CardTitle>
          <CardDescription>
            Analyse des ventes par catégorie de service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryRevenueData.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm font-medium">{formatPrice(category.total)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(category.total / totalRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Métriques supplémentaires */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Panier moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Montant moyen par commande
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientUsers}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Nombre total de clients enregistrés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Taux de complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Pourcentage de commandes terminées
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
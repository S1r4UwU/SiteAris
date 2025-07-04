import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Users, 
  Package2, 
  Calendar, 
  CreditCard,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminStatsChart from '@/components/admin/stats-chart';
import AdminRecentOrders from '@/components/admin/recent-orders';
import AdminRecentUsers from '@/components/admin/recent-users';

export default async function AdminDashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  // Récupérer les statistiques des commandes
  const { data: orderStats } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at')
    .order('created_at', { ascending: false });
    
  // Récupérer les statistiques des utilisateurs
  const { data: userStats } = await supabase
    .from('users')
    .select('id, role, created_at')
    .order('created_at', { ascending: false });
    
  // Récupérer les statistiques des interventions
  const { data: interventionStats } = await supabase
    .from('interventions')
    .select('id, status, scheduled_date')
    .order('created_at', { ascending: false });
  
  // Calculer les KPI
  const totalOrders = orderStats?.length || 0;
  const totalUsers = userStats?.length || 0;
  const totalRevenue = orderStats?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  
  // Commandes récentes (30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = orderStats?.filter(order => new Date(order.created_at) >= thirtyDaysAgo) || [];
  const recentRevenue = recentOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  
  // Utilisateurs récents (30 derniers jours)
  const recentUsers = userStats?.filter(user => new Date(user.created_at) >= thirtyDaysAgo) || [];
  
  // Interventions planifiées
  const upcomingInterventions = interventionStats?.filter(
    intervention => intervention.status === 'SCHEDULED' && new Date(intervention.scheduled_date) >= new Date()
  ) || [];
  
  // Commandes par statut
  const ordersByStatus = {
    pending: orderStats?.filter(order => order.status === 'PENDING').length || 0,
    inProgress: orderStats?.filter(order => ['PAID_DEPOSIT', 'IN_PROGRESS'].includes(order.status)).length || 0,
    completed: orderStats?.filter(order => order.status === 'COMPLETED').length || 0,
    cancelled: orderStats?.filter(order => order.status === 'CANCELLED').length || 0,
  };
  
  // Données pour les graphiques
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleString('fr-FR', { month: 'short' }),
      year: date.getFullYear(),
      date: date,
    };
  }).reverse();
  
  const revenueData = last6Months.map(month => {
    const startOfMonth = new Date(month.date);
    startOfMonth.setDate(1);
    
    const endOfMonth = new Date(month.date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    
    const monthlyOrders = orderStats?.filter(
      order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startOfMonth && orderDate <= endOfMonth;
      }
    ) || [];
    
    const revenue = monthlyOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    
    return {
      name: `${month.month} ${month.year}`,
      total: revenue,
    };
  });
  
  const ordersData = last6Months.map(month => {
    const startOfMonth = new Date(month.date);
    startOfMonth.setDate(1);
    
    const endOfMonth = new Date(month.date);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    
    const monthlyOrders = orderStats?.filter(
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
  
  // Calculer les variations par rapport au mois précédent
  const currentMonthRevenue = revenueData[revenueData.length - 1].total;
  const previousMonthRevenue = revenueData[revenueData.length - 2].total;
  const revenueChange = previousMonthRevenue !== 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0;
    
  const currentMonthOrders = ordersData[ordersData.length - 1].total;
  const previousMonthOrders = ordersData[ordersData.length - 2].total;
  const ordersChange = previousMonthOrders !== 0 
    ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
    : 0;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des performances et activités
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders">
              Gérer les commandes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/stats">
              Statistiques détaillées
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* KPI principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'affaires total
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <div className="flex items-center pt-1 text-xs">
              {revenueChange > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{revenueChange.toFixed(1)}%</span>
                </>
              ) : revenueChange < 0 ? (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{revenueChange.toFixed(1)}%</span>
                </>
              ) : (
                <span className="text-muted-foreground">Stable</span>
              )}
              <span className="text-muted-foreground ml-1">vs mois précédent</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes totales
            </CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center pt-1 text-xs">
              {ordersChange > 0 ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{ordersChange.toFixed(1)}%</span>
                </>
              ) : ordersChange < 0 ? (
                <>
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">{ordersChange.toFixed(1)}%</span>
                </>
              ) : (
                <span className="text-muted-foreground">Stable</span>
              )}
              <span className="text-muted-foreground ml-1">vs mois précédent</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground pt-1">
              {recentUsers.length} nouveaux ce mois-ci
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interventions planifiées
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingInterventions.length}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Interventions à venir
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Statistiques détaillées */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Chiffre d'affaires (6 derniers mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminStatsChart data={revenueData} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Statut des commandes</CardTitle>
            <CardDescription>Répartition des commandes par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">En attente</span>
                    <span className="text-sm font-medium">{ordersByStatus.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${(ordersByStatus.pending / totalOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">En cours</span>
                    <span className="text-sm font-medium">{ordersByStatus.inProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(ordersByStatus.inProgress / totalOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Terminées</span>
                    <span className="text-sm font-medium">{ordersByStatus.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(ordersByStatus.completed / totalOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Annulées</span>
                    <span className="text-sm font-medium">{ordersByStatus.cancelled}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(ordersByStatus.cancelled / totalOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Commandes et utilisateurs récents */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>Les 5 dernières commandes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AdminRecentOrders orders={orderStats?.slice(0, 5) || []} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Utilisateurs récents</CardTitle>
              <CardDescription>Les 5 derniers utilisateurs inscrits</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <AdminRecentUsers users={userStats?.slice(0, 5) || []} />
          </CardContent>
        </Card>
      </div>
      
      {/* Alertes et tâches */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            Actions requises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordersByStatus.pending > 0 && (
              <div className="flex items-start">
                <Clock className="mr-2 h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">{ordersByStatus.pending} commande(s) en attente</p>
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
            
            {upcomingInterventions.length > 0 && (
              <div className="flex items-start">
                <Calendar className="mr-2 h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">{upcomingInterventions.length} intervention(s) planifiée(s)</p>
                  <p className="text-sm text-muted-foreground">
                    Interventions à venir nécessitant une préparation
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/admin/interventions">
                      Voir les interventions
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            {ordersByStatus.pending === 0 && upcomingInterventions.length === 0 && (
              <p className="text-muted-foreground">Aucune action requise pour le moment</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
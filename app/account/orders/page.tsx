import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Filter, Search } from 'lucide-react';

export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: { status?: string; period?: string; q?: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Construire la requête avec les filtres
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  
  // Filtre par statut
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status.toUpperCase());
  }
  
  // Filtre par période
  if (searchParams.period) {
    const now = new Date();
    let startDate;
    
    switch (searchParams.period) {
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
  }
  
  // Recherche par numéro de commande
  if (searchParams.q) {
    query = query.ilike('order_number', `%${searchParams.q}%`);
  }
  
  // Exécuter la requête
  const { data: orders, error } = await query;
  
  // Récupérer les métriques
  const { data: metrics } = await supabase
    .from('orders')
    .select('status, total_amount')
    .eq('user_id', session.user.id);
    
  // Calculer les statistiques
  const totalOrders = metrics?.length || 0;
  const totalSpent = metrics?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  const pendingOrders = metrics?.filter(order => ['PENDING', 'PAID_DEPOSIT', 'IN_PROGRESS'].includes(order.status)).length || 0;
  const completedOrders = metrics?.filter(order => order.status === 'COMPLETED').length || 0;
  
  // Statuts disponibles pour le filtre
  const statuses = [
    { value: 'all', label: 'Tous' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID_DEPOSIT', label: 'Acompte payé' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminé' },
    { value: 'CANCELLED', label: 'Annulé' },
  ];
  
  // Périodes disponibles pour le filtre
  const periods = [
    { value: 'all', label: 'Toutes les périodes' },
    { value: '30days', label: '30 derniers jours' },
    { value: '90days', label: '90 derniers jours' },
    { value: '6months', label: '6 derniers mois' },
    { value: '1year', label: 'Dernière année' },
  ];
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mes commandes</h1>
        <p className="text-muted-foreground">
          Consultez et gérez l'historique de vos commandes
        </p>
      </div>
      
      {/* Métriques */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commandes en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commandes terminées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSpent)}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filtrer les commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher par n° commande..."
                defaultValue={searchParams.q || ''}
                className="w-full rounded-md border border-input pl-8 pr-3 py-2 text-sm"
              />
            </div>
            
            {/* Filtre par statut */}
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="rounded-md border border-input px-3 py-2 text-sm"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            {/* Filtre par période */}
            <select
              name="period"
              defaultValue={searchParams.period || 'all'}
              className="rounded-md border border-input px-3 py-2 text-sm"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit">Appliquer les filtres</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des commandes</CardTitle>
          <CardDescription>
            {orders?.length || 0} commande{orders?.length !== 1 ? 's' : ''} trouvée{orders?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Services</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{formatDate(new Date(order.created_at))}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order.order_items?.length || 0} service{order.order_items?.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>{formatPrice(order.total_amount)}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          order.status === 'PAID_DEPOSIT' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'COMPLETED' ? 'Terminé' :
                           order.status === 'CANCELLED' ? 'Annulé' :
                           order.status === 'PAID_DEPOSIT' ? 'Acompte payé' :
                           order.status === 'IN_PROGRESS' ? 'En cours' :
                           order.status === 'PAID' ? 'Payé' :
                           'En attente'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/account/orders/${order.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
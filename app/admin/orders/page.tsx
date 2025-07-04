import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { 
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Search,
  Filter,
  Download,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface OrdersPageProps {
  searchParams?: {
    status?: string;
    sort?: string;
    query?: string;
    page?: string;
  };
}

interface OrderUser {
  id: string;
  email: string;
  full_name: string | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  users: OrderUser;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // Paramètres de filtrage et tri
  const status = searchParams?.status || '';
  const sort = searchParams?.sort || 'created_at:desc';
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 10;
  
  // Construire la requête
  let ordersQuery = supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      created_at,
      users (
        id,
        email,
        full_name
      )
    `);
  
  // Appliquer les filtres
  if (status) {
    ordersQuery = ordersQuery.eq('status', status);
  }
  
  // Appliquer la recherche
  if (query) {
    ordersQuery = ordersQuery.or(`id.ilike.%${query}%, users.email.ilike.%${query}%, users.full_name.ilike.%${query}%`);
  }
  
  // Appliquer le tri
  const [sortField, sortDirection] = sort.split(':');
  ordersQuery = ordersQuery.order(sortField, { ascending: sortDirection === 'asc' });
  
  // Appliquer la pagination
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  ordersQuery = ordersQuery.range(from, to);
  
  // Exécuter la requête
  const { data, error, count } = await ordersQuery;
  
  // Typage sûr des données
  const orders: Order[] = data as Order[] || [];
  
  // Récupérer le nombre total de commandes pour la pagination
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true });
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil((totalOrders || 0) / pageSize);
  
  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'PAID_DEPOSIT':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PAID_DEPOSIT':
        return 'Acompte payé';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes les commandes clients
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/admin/orders/export">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Rechercher par ID, email ou nom client..."
                name="query"
                defaultValue={query}
                className="w-full pr-10"
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select name="status" defaultValue={status}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="PAID_DEPOSIT">Acompte payé</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select name="sort" defaultValue={sort}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at:desc">Date (récent)</SelectItem>
                  <SelectItem value="created_at:asc">Date (ancien)</SelectItem>
                  <SelectItem value="total_amount:desc">Montant (élevé)</SelectItem>
                  <SelectItem value="total_amount:asc">Montant (faible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              <Filter className="mr-2 h-4 w-4" />
              Filtrer
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Tableau des commandes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {order.users?.full_name || order.users?.email || 'Client inconnu'}
                    </TableCell>
                    <TableCell>
                      <div>{format(new Date(order.created_at), 'dd/MM/yyyy')}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-center space-x-2 py-4 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              asChild
            >
              <Link 
                href={{
                  pathname: '/admin/orders',
                  query: {
                    ...searchParams,
                    page: currentPage - 1,
                  },
                }}
              >
                Précédent
              </Link>
            </Button>
            <div className="text-sm">
              Page {currentPage} sur {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              asChild
            >
              <Link 
                href={{
                  pathname: '/admin/orders',
                  query: {
                    ...searchParams,
                    page: currentPage + 1,
                  },
                }}
              >
                Suivant
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 
import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowRight,
  Search,
  Filter,
  Download,
  Eye,
  Pencil,
  UserPlus,
  Mail,
  Phone,
  Shield
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UsersPageProps {
  searchParams?: {
    role?: string;
    sort?: string;
    query?: string;
    page?: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  created_at: string;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // Paramètres de filtrage et tri
  const role = searchParams?.role || '';
  const sort = searchParams?.sort || 'created_at:desc';
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 10;
  
  // Construire la requête
  let usersQuery = supabase
    .from('users')
    .select('id, email, full_name, role, phone, created_at');
  
  // Appliquer les filtres
  if (role) {
    usersQuery = usersQuery.eq('role', role);
  }
  
  // Appliquer la recherche
  if (query) {
    usersQuery = usersQuery.or(`email.ilike.%${query}%, full_name.ilike.%${query}%, phone.ilike.%${query}%`);
  }
  
  // Appliquer le tri
  const [sortField, sortDirection] = sort.split(':');
  usersQuery = usersQuery.order(sortField, { ascending: sortDirection === 'asc' });
  
  // Appliquer la pagination
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  usersQuery = usersQuery.range(from, to);
  
  // Exécuter la requête
  const { data, error } = await usersQuery;
  
  // Typage sûr des données
  const users: User[] = data as User[] || [];
  
  // Récupérer le nombre total d'utilisateurs pour la pagination
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil((totalUsers || 0) / pageSize);
  
  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'USER':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'STAFF':
        return 'Personnel';
      case 'USER':
        return 'Client';
      default:
        return role;
    }
  };
  
  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = (fullName: string | null, email: string) => {
    if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button asChild>
            <Link href="/admin/users/create">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
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
                placeholder="Rechercher par email, nom ou téléphone..."
                name="query"
                defaultValue={query}
                className="w-full pr-10"
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select name="role" defaultValue={role}>
                <SelectTrigger>
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                  <SelectItem value="USER">Utilisateur</SelectItem>
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
                  <SelectItem value="full_name:asc">Nom (A-Z)</SelectItem>
                  <SelectItem value="full_name:desc">Nom (Z-A)</SelectItem>
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
      
      {/* Tableau des utilisateurs */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{getUserInitials(user.full_name, user.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || 'Utilisateur sans nom'}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className={getRoleColor(user.role)}>
                          <Shield className="h-3 w-3 mr-1" />
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{format(new Date(user.created_at), 'dd/MM/yyyy')}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>
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
                  <TableCell colSpan={5} className="text-center py-6">
                    Aucun utilisateur trouvé
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
                  pathname: '/admin/users',
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
                  pathname: '/admin/users',
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
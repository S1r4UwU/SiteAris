import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit, 
  Eye, 
  Copy, 
  Archive, 
  Tag,
  Layers,
  Clock
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServicesPageProps {
  searchParams?: {
    category?: string;
    sort?: string;
    query?: string;
    page?: string;
    status?: string;
  };
}

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  base_price: number;
  display_price: string;
  category_id: number;
  estimated_duration: number;
  complexity_level: string;
  is_featured: boolean;
  is_published: boolean;
  features: string[];
  icon: string;
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  service_options?: {
    id: number;
    name: string;
    price_modifier: number;
  }[];
  service_tags?: {
    tags: {
      id: number;
      name: string;
    };
  }[];
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // Paramètres de filtrage et tri
  const categoryId = searchParams?.category || '';
  const sort = searchParams?.sort || 'name:asc';
  const query = searchParams?.query || '';
  const status = searchParams?.status || 'all';
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 10;
  
  // Récupérer toutes les catégories pour le filtre
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, slug, color')
    .order('name');
  
  // Construire la requête
  let servicesQuery = supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*),
      service_options(*),
      service_tags(tags(*))
    `);
  
  // Appliquer les filtres
  if (categoryId) {
    servicesQuery = servicesQuery.eq('category_id', categoryId);
  }
  
  if (status === 'published') {
    servicesQuery = servicesQuery.eq('is_published', true);
  } else if (status === 'draft') {
    servicesQuery = servicesQuery.eq('is_published', false);
  }
  
  // Appliquer la recherche
  if (query) {
    servicesQuery = servicesQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`);
  }
  
  // Appliquer le tri
  const [sortField, sortDirection] = sort.split(':');
  servicesQuery = servicesQuery.order(sortField, { ascending: sortDirection === 'asc' });
  
  // Appliquer la pagination
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  servicesQuery = servicesQuery.range(from, to);
  
  // Exécuter la requête
  const { data: services, error } = await servicesQuery;
  
  // Récupérer le nombre total de services pour la pagination
  const { count: totalServices } = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true });
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil((totalServices || 0) / pageSize);
  
  // Fonction pour obtenir la couleur du badge selon le niveau de complexité
  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'SIMPLE':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'COMPLEX':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'EXPERT':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Fonction pour obtenir le libellé du niveau de complexité
  const getComplexityLabel = (level: string) => {
    switch (level) {
      case 'SIMPLE':
        return 'Simple';
      case 'MEDIUM':
        return 'Intermédiaire';
      case 'COMPLEX':
        return 'Complexe';
      case 'EXPERT':
        return 'Expert';
      default:
        return level;
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Services</h1>
          <p className="text-muted-foreground">
            Créez et gérez les services proposés sur la plateforme
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button asChild>
            <Link href="/admin/services/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau service
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
                placeholder="Rechercher par nom, description..."
                name="query"
                defaultValue={query}
                className="w-full pr-10"
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select name="category" defaultValue={categoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select name="status" defaultValue={status}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select name="sort" defaultValue={sort}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name:asc">Nom (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Nom (Z-A)</SelectItem>
                  <SelectItem value="base_price:asc">Prix (croissant)</SelectItem>
                  <SelectItem value="base_price:desc">Prix (décroissant)</SelectItem>
                  <SelectItem value="created_at:desc">Plus récents</SelectItem>
                  <SelectItem value="created_at:asc">Plus anciens</SelectItem>
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
      
      {/* Onglets */}
      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="grid">Grille</TabsTrigger>
        </TabsList>
        
        {/* Vue liste */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Complexité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services && services.length > 0 ? (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {service.short_description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              backgroundColor: `${service.category?.color}20`,
                              color: service.category?.color,
                              borderColor: `${service.category?.color}40`
                            }}
                          >
                            {service.category?.name || 'Non catégorisé'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(service.base_price)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getComplexityColor(service.complexity_level)}>
                            {getComplexityLabel(service.complexity_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.is_published ? 'default' : 'secondary'}>
                            {service.is_published ? 'Publié' : 'Brouillon'}
                          </Badge>
                          {service.is_featured && (
                            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                              Mis en avant
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/services/${service.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/services/${service.slug}`} target="_blank">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Voir</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/services/${service.id}/duplicate`}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Dupliquer</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Aucun service trouvé
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
                      pathname: '/admin/services',
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
                      pathname: '/admin/services',
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
        </TabsContent>
        
        {/* Vue grille */}
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services && services.length > 0 ? (
              services.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {service.short_description}
                        </CardDescription>
                      </div>
                      <Badge variant={service.is_published ? 'default' : 'secondary'}>
                        {service.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: `${service.category?.color}20`,
                            color: service.category?.color,
                            borderColor: `${service.category?.color}40`
                          }}
                          className="flex items-center"
                        >
                          <Layers className="h-3 w-3 mr-1" />
                          {service.category?.name || 'Non catégorisé'}
                        </Badge>
                        <div className="font-medium text-primary">
                          {formatPrice(service.base_price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getComplexityColor(service.complexity_level)}>
                          {getComplexityLabel(service.complexity_level)}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.estimated_duration} min
                        </div>
                        {service.is_featured && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            Mis en avant
                          </Badge>
                        )}
                      </div>
                      {service.service_tags && service.service_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {service.service_tags.map((tagRelation) => (
                            <div key={tagRelation.tags.id} className="flex items-center text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1">
                              <Tag className="h-3 w-3 mr-1" />
                              {tagRelation.tags.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-3 border-t">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/services/${service.slug}`} target="_blank">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Link>
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/services/${service.id}/duplicate`}>
                          <Copy className="h-4 w-4 mr-1" />
                          Dupliquer
                        </Link>
                      </Button>
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/admin/services/${service.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Aucun service trouvé</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                asChild
              >
                <Link 
                  href={{
                    pathname: '/admin/services',
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
                    pathname: '/admin/services',
                    query: {
                      ...searchParams,
                      page: currentPage + 1,
                    },
                  }}
                >
                  Suivant
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Actions en masse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions en masse</CardTitle>
          <CardDescription>
            Appliquer des actions à plusieurs services à la fois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sélectionner une action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Publier</SelectItem>
                <SelectItem value="unpublish">Dépublier</SelectItem>
                <SelectItem value="feature">Mettre en avant</SelectItem>
                <SelectItem value="unfeature">Retirer de la mise en avant</SelectItem>
                <SelectItem value="change-category">Changer de catégorie</SelectItem>
                <SelectItem value="delete">Supprimer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Appliquer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
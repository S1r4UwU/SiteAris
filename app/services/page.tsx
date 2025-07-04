import { Suspense } from 'react';
import { Metadata } from 'next';
import { serviceServer } from '@/lib/supabase/server-services';
import { ServiceCatalog } from './service-catalog';
import { ServicesSkeleton } from '@/components/services/services-skeleton';

export const metadata: Metadata = {
  title: 'Services informatiques et cybersécurité | SiteAris',
  description: 'Découvrez notre catalogue complet de services informatiques et cybersécurité pour entreprises: audit, sécurisation réseau, maintenance, formation et plus.',
  openGraph: {
    title: 'Services informatiques et cybersécurité | SiteAris',
    description: 'Découvrez notre catalogue complet de services informatiques et cybersécurité pour entreprises: audit, sécurisation réseau, maintenance, formation et plus.',
    url: '/services',
    type: 'website',
  },
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Récupérer les catégories et tags pour les filtres
  const categories = await serviceServer.getCategories();
  const tags = await serviceServer.getServiceTags();
  
  // Préparer les filtres à partir des paramètres d'URL
  const filters = {
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    minPrice: typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined,
    maxPrice: typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined,
    complexity: typeof searchParams.complexity === 'string' 
      ? searchParams.complexity.split(',') as ('faible' | 'moyen' | 'élevé')[]
      : undefined,
    tags: typeof searchParams.tags === 'string' 
      ? searchParams.tags.split(',')
      : undefined,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    sort: typeof searchParams.sort === 'string' 
      ? searchParams.sort as 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'
      : 'name_asc',
    page: typeof searchParams.page === 'string' ? Number(searchParams.page) : 1,
    limit: typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 9
  };

  // Récupérer les services filtrés
  const services = await serviceServer.getServices(filters);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Services informatiques et cybersécurité</h1>
        <p className="text-muted-foreground">
          Découvrez notre catalogue complet de services pour sécuriser et optimiser votre infrastructure informatique
        </p>
      </div>

      <Suspense fallback={<ServicesSkeleton />}>
        <ServiceCatalog 
          initialServices={services} 
          categories={categories}
          tags={tags}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  );
} 
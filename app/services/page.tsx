import { Suspense } from 'react';
import { Metadata } from 'next';
import { serviceServer } from '@/lib/supabase/server-services';
import { ServiceCatalog } from './service-catalog';
import { ServicesSkeleton } from '@/components/services/services-skeleton';

// Revalidation toutes les 6h
export const revalidate = 21600; // 6h en secondes

export const metadata: Metadata = {
  title: 'Services informatiques et cybersécurité | SiteAris',
  description: 'Découvrez notre catalogue complet de services informatiques et cybersécurité pour entreprises: audit, sécurisation réseau, maintenance, formation et plus.',
  openGraph: {
    title: 'Services informatiques et cybersécurité | SiteAris',
    description: 'Découvrez notre catalogue complet de services informatiques et cybersécurité pour entreprises: audit, sécurisation réseau, maintenance, formation et plus.',
    url: '/services',
    type: 'website',
    images: ['/images/services-og.jpg'],
  },
  alternates: {
    canonical: '/services',
  },
  keywords: 'services informatiques, cybersécurité, audit sécurité, maintenance informatique, sécurisation réseau, IT services',
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Récupérer les catégories et tags pour les filtres
  const [categories, tags] = await Promise.all([
    serviceServer.getCategories(),
    serviceServer.getServiceTags()
  ]);
  
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

  // Récupérer les services filtrés (avec gestion de cache optimisée)
  const services = await serviceServer.getServices(filters);

  // Dynamiser le titre en fonction des filtres
  let pageTitle = "Services informatiques et cybersécurité";
  if (filters.category) {
    const category = categories.find(c => c.slug === filters.category);
    if (category) {
      pageTitle = `Services ${category.name}`;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
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
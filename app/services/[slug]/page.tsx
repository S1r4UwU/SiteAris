import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { serviceServer } from '@/lib/supabase/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceConfigurator } from '@/components/services/service-configurator';
import { ServiceRecommendations } from '@/components/services/service-recommendations';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

// Revalidation toutes les 24h
export const revalidate = 86400; // 24h en secondes

// Pré-générer les pages de services statiquement
export async function generateStaticParams() {
  // Récupérer tous les slugs de services
  const supabase = createServerComponentClient({ cookies });
  const { data: services } = await supabase
    .from('services')
    .select('slug')
    .eq('is_active', true);
  
  return services?.map((service) => ({
    slug: service.slug,
  })) || [];
}

// Générer les métadonnées dynamiquement
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const service = await serviceServer.getServiceBySlug(params.slug);
  
  if (!service) {
    return {
      title: 'Service non trouvé | SiteAris',
      description: 'Le service demandé n\'existe pas ou n\'est plus disponible.',
    };
  }
  
  return {
    title: `${service.name} | Services SiteAris`,
    description: service.short_description,
    openGraph: {
      title: `${service.name} | Services SiteAris`,
      description: service.short_description,
      url: `/services/${service.slug}`,
      type: 'website',
      images: [service.image_url ? [{ url: service.image_url }] : []].flat(),
    },
    alternates: {
      canonical: `/services/${service.slug}`,
    }
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  // Récupérer les détails du service
  const service = await serviceServer.getServiceBySlug(params.slug);
  
  // Si le service n'existe pas, afficher une page 404
  if (!service) {
    notFound();
  }

  // Récupérer les services recommandés (de la même catégorie)
  const recommendedServices = await serviceServer.getServices({
    category: service.category?.slug,
    limit: 3,
    exclude: [service.id]
  });

  // Icône par défaut si aucune n'est spécifiée
  const iconSrc = service.icon 
    ? `/icons/${service.icon}.svg` 
    : '/icons/computer.svg';
  
  // Couleur de la catégorie
  const categoryColor = service.category?.color || '#1e88e5';
  
  // Indicateur de complexité
  const complexityMap = {
    'faible': { label: 'Simple', color: 'bg-green-100 text-green-800' },
    'moyen': { label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
    'élevé': { label: 'Complexe', color: 'bg-red-100 text-red-800' }
  };
  
  const complexityInfo = service.complexity_level 
    ? complexityMap[service.complexity_level] 
    : { label: '', color: '' };

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Accueil
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href="/services" className="text-muted-foreground hover:text-foreground">
          Services
        </Link>
        {service.category && (
          <>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link 
              href={`/services?category=${service.category.slug}`} 
              className="text-muted-foreground hover:text-foreground"
            >
              {service.category.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Détails du service */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: `${categoryColor}20` }}>
              <Image 
                src={iconSrc} 
                alt={service.name} 
                width={32} 
                height={32}
                priority // Priorité de chargement pour améliorer le LCP
              />
            </div>
            {service.category && (
              <Badge variant="outline" style={{ color: categoryColor, borderColor: `${categoryColor}50` }}>
                {service.category.name}
              </Badge>
            )}
            {service.complexity_level && (
              <span className={`text-xs px-2 py-1 rounded-full ${complexityInfo.color}`}>
                {complexityInfo.label}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            {service.short_description}
          </p>

          {/* Description détaillée */}
          {service.description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p>{service.description}</p>
            </div>
          )}

          {/* Caractéristiques */}
          {service.features && service.features.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Ce service comprend</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary text-lg">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {service.tags.map((tag) => (
                <Link key={tag.id} href={`/services?tags=${tag.name}`}>
                  <Badge variant="secondary" className="cursor-pointer">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Configurateur et prix */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Configurez votre service</h2>
            
            {/* Afficher le prix de base */}
            <div className="mb-6">
              <div className="text-sm text-muted-foreground mb-1">Prix de base</div>
              <div className="text-2xl font-bold">{service.display_price}</div>
              {service.estimated_duration && (
                <div className="text-sm text-muted-foreground mt-1">
                  Durée estimée: {service.estimated_duration}
                </div>
              )}
            </div>
            
            {/* Configurateur d'options */}
            {service.options && service.options.length > 0 ? (
              <ServiceConfigurator 
                service={service}
                options={service.options}
              />
            ) : (
              <div className="mb-6">
                <Button className="w-full">
                  Demander un devis
                </Button>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Nous vous contacterons pour discuter de vos besoins spécifiques
                </p>
              </div>
            )}
            
            {/* Contact et support */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Besoin d'aide pour choisir ?</span>
              </div>
              <Link href="/contact">
                <Button variant="outline" className="w-full">
                  Contacter un expert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services recommandés */}
      {recommendedServices.data.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Services similaires</h2>
          <ServiceRecommendations services={recommendedServices.data} />
        </div>
      )}
    </div>
  );
} 
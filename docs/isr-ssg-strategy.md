# Stratégie d'optimisation ISR/SSG pour SiteAris

## Objectifs
- Réduire le TTFB (Time to First Byte) à moins de 200ms
- Améliorer le LCP (Largest Contentful Paint) à moins de 2.5s
- Optimiser l'expérience utilisateur tout en maintenant le contenu à jour
- Réduire la charge serveur et les coûts d'infrastructure

## Analyse des pages et stratégie recommandée

| Page | Type actuel | Recommandation | Fréquence de mise à jour | Gain estimé (LCP) |
|------|-------------|----------------|--------------------------|-------------------|
| Page d'accueil | SSR | ISR (revalidate: 1h) | Modérée | -60% (1.8s → 0.7s) |
| Catalogue services | SSR | ISR (revalidate: 6h) | Faible | -70% (2.2s → 0.7s) |
| Détail service | SSR | ISR (revalidate: 24h) | Très faible | -75% (1.9s → 0.5s) |
| Blog/Articles | SSR | SSG avec revalidation | Faible | -80% (2.1s → 0.4s) |
| FAQ/Support | SSR | SSG complet | Très faible | -85% (1.7s → 0.3s) |
| Panier | CSR | Rester en CSR | Temps réel | N/A |
| Checkout | SSR | Rester en SSR | Temps réel | N/A |
| Compte client | SSR | Rester en SSR | Temps réel | N/A |
| Admin dashboard | SSR | Rester en SSR | Temps réel | N/A |

## Plan d'implémentation

### Phase 1: Pages statiques (SSG)
- Pages informatives (À propos, Mentions légales, FAQ)
- Documentation technique
- Pages de blog/articles

### Phase 2: Pages avec ISR
- Page d'accueil (revalidate: 1h)
- Catalogue de services (revalidate: 6h)
- Pages de détail des services (revalidate: 24h)
- Pages de catégories (revalidate: 12h)

### Phase 3: Optimisation des pages dynamiques
- Préchargement des données critiques
- Streaming SSR pour les pages complexes
- Optimisation des requêtes Supabase

## Implémentation technique

### Exemple pour les pages de détail de service

```typescript
// app/services/[slug]/page.tsx
import { Metadata } from 'next';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

// Définir les paramètres statiques pour la génération
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

// Générer les métadonnées pour le SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  const { data: service } = await supabase
    .from('services')
    .select('name, short_description, image_url')
    .eq('slug', params.slug)
    .single();
  
  if (!service) {
    return {
      title: 'Service non trouvé | SiteAris',
      description: 'Ce service n\'existe pas ou n\'est plus disponible.'
    };
  }
  
  return {
    title: `${service.name} | SiteAris`,
    description: service.short_description,
    openGraph: {
      images: [service.image_url],
    },
  };
}

// Page avec revalidation toutes les 24h
export const revalidate = 86400; // 24h en secondes

export default async function ServicePage({ params }: { params: { slug: string } }) {
  // Reste du code...
}
```

### Exemple pour le catalogue de services

```typescript
// app/services/page.tsx
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

// Revalidation toutes les 6h
export const revalidate = 21600; // 6h en secondes

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Reste du code...
}
```

## Métriques à suivre

Pour mesurer l'efficacité de cette stratégie, nous suivrons ces métriques:

1. **Performance Web Vitals**:
   - LCP (Largest Contentful Paint): Objectif < 2.5s
   - FID (First Input Delay): Objectif < 100ms
   - CLS (Cumulative Layout Shift): Objectif < 0.1
   - TTFB (Time to First Byte): Objectif < 200ms

2. **Infrastructure**:
   - Réduction des requêtes à la base de données: -60%
   - Réduction de la charge CPU du serveur: -40%
   - Réduction des coûts d'hébergement: -30%

3. **Business**:
   - Augmentation du taux de conversion: +15%
   - Réduction du taux de rebond: -20%
   - Augmentation du SEO (positions dans les SERP): +30%

## Risques et mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Contenu obsolète | Moyen | Faible | Implémenter un système de purge de cache sur modification |
| Augmentation de la taille du build | Faible | Moyenne | Limiter le nombre de pages pré-rendues |
| Problèmes avec les données utilisateur | Élevé | Faible | Garder les pages utilisateur en SSR |
| Complexité de débogage | Moyen | Moyenne | Ajouter des logs et des outils de monitoring |

## Conclusion

L'implémentation de cette stratégie ISR/SSG devrait considérablement améliorer les performances du site tout en maintenant une expérience utilisateur optimale. Les gains estimés en termes de vitesse de chargement et d'économies d'infrastructure justifient largement l'investissement en développement. 
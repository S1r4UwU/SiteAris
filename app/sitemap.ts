import { MetadataRoute } from 'next';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

/**
 * Génère un sitemap dynamique pour le site
 * @returns Sitemap au format XML
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sitearis.com';
  
  // Connexion à Supabase
  const supabase = createServerComponentClient({ cookies });
  
  // Récupérer tous les services actifs
  const { data: services } = await supabase
    .from('services')
    .select('slug, updated_at')
    .eq('is_active', true);
  
  // Récupérer toutes les catégories
  const { data: categories } = await supabase
    .from('service_categories')
    .select('slug, updated_at');
  
  // Récupérer tous les articles de blog (si existants)
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true)
    .catch(() => ({ data: null })); // Gérer le cas où la table n'existe pas
  
  // Pages statiques
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
  
  // Pages de services
  const servicePages = services?.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];
  
  // Pages de catégories
  const categoryPages = categories?.map((category) => ({
    url: `${baseUrl}/services?category=${category.slug}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || [];
  
  // Pages de blog (si existantes)
  const blogPages = blogPosts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  })) || [];
  
  // Combiner toutes les pages
  return [...staticPages, ...servicePages, ...categoryPages, ...blogPages];
} 
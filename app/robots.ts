import { MetadataRoute } from 'next';

/**
 * Génère un fichier robots.txt dynamique pour le site
 * @returns Configuration robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sitearis.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/account/',
        '/auth/',
        '/checkout/',
        '/panier/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 
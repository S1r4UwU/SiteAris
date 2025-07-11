/**
 * Utilitaire pour mesurer et enregistrer les métriques de performance
 * Utilisé pour l'audit initial et le suivi des améliorations
 */

import { NextApiResponse } from 'next';

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte (ms)
  fcp: number; // First Contentful Paint (ms)
  loadTime: number; // Page Load Time (ms)
  resourceCount: number; // Nombre de ressources chargées
  resourceSize: number; // Taille totale des ressources (KB)
  url: string; // URL de la page analysée
  timestamp: number; // Timestamp de la mesure
  userAgent?: string; // User Agent du client
  connection?: string; // Type de connexion (4G, WiFi, etc.)
}

/**
 * Enregistre les métriques de performance dans Supabase
 * @param metrics Métriques de performance à enregistrer
 */
export async function recordPerformanceMetrics(metrics: PerformanceMetrics) {
  try {
    // En production, enregistrer dans Supabase ou un autre service
    console.log('Performance metrics recorded:', metrics);
    
    // Exemple d'envoi à une API
    const response = await fetch('/api/metrics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to record performance metrics:', error);
    return false;
  }
}

/**
 * Middleware pour collecter les métriques de performance côté serveur
 * À utiliser avec les API routes Next.js
 */
export function withPerformanceTracking(handler: any) {
  return async (req: any, res: NextApiResponse) => {
    const startTime = process.hrtime();
    
    // Exécuter le handler original
    const result = await handler(req, res);
    
    // Calculer le temps d'exécution
    const diff = process.hrtime(startTime);
    const executionTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // Enregistrer les métriques côté serveur
    console.log(`API ${req.url} execution time: ${executionTime}ms`);
    
    return result;
  };
}

/**
 * Script à injecter dans les pages pour collecter les métriques Web Vitals
 * côté client et les envoyer au serveur
 */
export const webVitalsScript = `
  <script>
    (function() {
      let LCP = 0;
      let FID = 0;
      let CLS = 0;
      
      // Observe LCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        LCP = lastEntry.startTime;
      }).observe({type: 'largest-contentful-paint', buffered: true});
      
      // Observe FID
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstInput = entries[0];
        FID = firstInput.processingStart - firstInput.startTime;
      }).observe({type: 'first-input', buffered: true});
      
      // Observe CLS
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        CLS = clsValue;
      }).observe({type: 'layout-shift', buffered: true});
      
      // Send metrics when page unloads
      window.addEventListener('beforeunload', () => {
        const metrics = {
          lcp: LCP,
          fid: FID,
          cls: CLS,
          ttfb: performance.getEntriesByType('navigation')[0].responseStart,
          fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          loadTime: performance.getEntriesByType('navigation')[0].loadEventEnd,
          resourceCount: performance.getEntriesByType('resource').length,
          resourceSize: performance.getEntriesByType('resource').reduce((total, entry) => total + entry.transferSize, 0) / 1024,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          connection: navigator.connection ? navigator.connection.effectiveType : undefined
        };
        
        // Use sendBeacon to ensure the request is sent even if the page is unloading
        navigator.sendBeacon('/api/metrics/performance', JSON.stringify(metrics));
      });
    })();
  </script>
`;

/**
 * Génère un rapport d'audit de performance basé sur les métriques collectées
 * @param metrics Liste des métriques de performance
 */
export function generatePerformanceReport(metrics: PerformanceMetrics[]): string {
  const avgLCP = metrics.reduce((sum, m) => sum + m.lcp, 0) / metrics.length;
  const avgFID = metrics.reduce((sum, m) => sum + m.fid, 0) / metrics.length;
  const avgCLS = metrics.reduce((sum, m) => sum + m.cls, 0) / metrics.length;
  const avgTTFB = metrics.reduce((sum, m) => sum + m.ttfb, 0) / metrics.length;
  
  return `
# Rapport d'audit de performance

## Métriques Web Vitals moyennes
- LCP (Largest Contentful Paint): ${avgLCP.toFixed(2)}ms ${avgLCP < 2500 ? '✅' : '❌'}
- FID (First Input Delay): ${avgFID.toFixed(2)}ms ${avgFID < 100 ? '✅' : '❌'}
- CLS (Cumulative Layout Shift): ${avgCLS.toFixed(3)} ${avgCLS < 0.1 ? '✅' : '❌'}
- TTFB (Time to First Byte): ${avgTTFB.toFixed(2)}ms ${avgTTFB < 600 ? '✅' : '❌'}

## Pages les plus lentes (LCP)
${metrics
  .sort((a, b) => b.lcp - a.lcp)
  .slice(0, 5)
  .map((m, i) => `${i + 1}. ${m.url}: ${m.lcp.toFixed(2)}ms`)
  .join('\n')}

## Pages avec le plus de ressources
${metrics
  .sort((a, b) => b.resourceCount - a.resourceCount)
  .slice(0, 5)
  .map((m, i) => `${i + 1}. ${m.url}: ${m.resourceCount} ressources (${m.resourceSize.toFixed(2)} KB)`)
  .join('\n')}

## Recommandations
- Optimiser les images sur les pages avec un LCP élevé
- Implémenter le chargement différé (lazy loading) pour les ressources non critiques
- Utiliser la génération statique (SSG/ISR) pour les pages à contenu relativement stable
- Minimiser les scripts tiers qui bloquent le rendu
- Optimiser le TTFB en utilisant le cache et en optimisant les requêtes à la base de données
`;
} 
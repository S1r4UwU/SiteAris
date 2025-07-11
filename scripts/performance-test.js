/**
 * Script de test de performance pour SiteAris
 * Utilise Lighthouse pour mesurer les performances des pages principales
 * 
 * Usage: node scripts/performance-test.js
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../reports/lighthouse');
const PAGES_TO_TEST = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services' },
  { name: 'service-detail', path: '/services/audit-securite' },
  { name: 'checkout', path: '/checkout' },
  { name: 'account', path: '/account' },
];
const DEVICE_TYPES = ['mobile', 'desktop'];

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Formater la date pour le nom de fichier
const getFormattedDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
};

// Exécuter Lighthouse pour une page
async function runLighthouse(url, opts, config = null) {
  return lighthouse(url, opts, config);
}

// Lancer les tests pour toutes les pages
async function runAllTests() {
  const dateStr = getFormattedDate();
  const summaryData = {
    date: new Date().toISOString(),
    results: [],
  };

  try {
    // Lancer Chrome
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const opts = {
      port: chrome.port,
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    console.log('🚀 Démarrage des tests de performance...');

    // Tester chaque page sur chaque type d'appareil
    for (const device of DEVICE_TYPES) {
      console.log(`\n📱 Tests pour appareil: ${device}`);
      
      // Configurer les options pour le type d'appareil
      const deviceOpts = { ...opts };
      if (device === 'mobile') {
        deviceOpts.emulatedFormFactor = 'mobile';
      } else {
        deviceOpts.emulatedFormFactor = 'desktop';
      }
      
      for (const page of PAGES_TO_TEST) {
        const pageUrl = `${BASE_URL}${page.path}`;
        console.log(`\n🔍 Test de ${page.name} (${pageUrl})`);
        
        try {
          // Exécuter Lighthouse
          const { lhr, report } = await runLighthouse(pageUrl, deviceOpts);
          
          // Enregistrer le rapport HTML
          const reportPath = path.join(OUTPUT_DIR, `${dateStr}_${device}_${page.name}.html`);
          fs.writeFileSync(reportPath, report);
          
          // Extraire les métriques clés
          const { performance, accessibility, 'best-practices': bestPractices, seo } = lhr.categories;
          const metrics = {
            lcp: lhr.audits['largest-contentful-paint'].numericValue,
            fid: lhr.audits['max-potential-fid'].numericValue,
            cls: lhr.audits['cumulative-layout-shift'].numericValue,
            ttfb: lhr.audits['server-response-time'].numericValue,
            speedIndex: lhr.audits['speed-index'].numericValue,
          };
          
          // Ajouter au résumé
          summaryData.results.push({
            page: page.name,
            url: pageUrl,
            device,
            scores: {
              performance: performance.score * 100,
              accessibility: accessibility.score * 100,
              bestPractices: bestPractices.score * 100,
              seo: seo.score * 100,
            },
            metrics,
          });
          
          // Afficher les résultats
          console.log(`✅ Performance: ${Math.round(performance.score * 100)}/100`);
          console.log(`   LCP: ${Math.round(metrics.lcp)}ms | FID: ${Math.round(metrics.fid)}ms | CLS: ${metrics.cls.toFixed(3)}`);
          console.log(`   Rapport enregistré: ${reportPath}`);
        } catch (error) {
          console.error(`❌ Erreur lors du test de ${page.name}:`, error);
          summaryData.results.push({
            page: page.name,
            url: pageUrl,
            device,
            error: error.message,
          });
        }
      }
    }

    // Enregistrer le résumé au format JSON
    const summaryPath = path.join(OUTPUT_DIR, `${dateStr}_summary.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2));
    console.log(`\n📊 Résumé des tests enregistré: ${summaryPath}`);

    // Générer un rapport de comparaison si des rapports précédents existent
    generateComparisonReport(summaryData, dateStr);

    // Fermer Chrome
    await chrome.kill();
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  }
}

// Générer un rapport de comparaison avec les tests précédents
function generateComparisonReport(currentData, dateStr) {
  try {
    // Trouver le dernier rapport de résumé (hors le rapport actuel)
    const files = fs.readdirSync(OUTPUT_DIR)
      .filter(file => file.endsWith('_summary.json') && !file.startsWith(dateStr))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('\n⚠️ Aucun rapport précédent trouvé pour la comparaison');
      return;
    }
    
    const previousFile = files[0];
    const previousData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, previousFile)));
    
    console.log(`\n📈 Comparaison avec le rapport précédent: ${previousFile}`);
    
    // Comparer les résultats
    const comparison = {
      date: new Date().toISOString(),
      previousDate: previousData.date,
      changes: [],
    };
    
    for (const currentResult of currentData.results) {
      const previousResult = previousData.results.find(
        r => r.page === currentResult.page && r.device === currentResult.device
      );
      
      if (!previousResult || previousResult.error || currentResult.error) {
        continue;
      }
      
      const performanceChange = currentResult.scores.performance - previousResult.scores.performance;
      const lcpChange = previousResult.metrics.lcp - currentResult.metrics.lcp;
      const fidChange = previousResult.metrics.fid - currentResult.metrics.fid;
      const clsChange = previousResult.metrics.cls - currentResult.metrics.cls;
      
      comparison.changes.push({
        page: currentResult.page,
        device: currentResult.device,
        performance: {
          before: previousResult.scores.performance,
          after: currentResult.scores.performance,
          change: performanceChange,
        },
        lcp: {
          before: previousResult.metrics.lcp,
          after: currentResult.metrics.lcp,
          change: lcpChange,
        },
        fid: {
          before: previousResult.metrics.fid,
          after: currentResult.metrics.fid,
          change: fidChange,
        },
        cls: {
          before: previousResult.metrics.cls,
          after: currentResult.metrics.cls,
          change: clsChange,
        },
      });
      
      // Afficher les changements
      console.log(`\n📊 ${currentResult.page} (${currentResult.device}):`);
      console.log(`   Performance: ${Math.round(previousResult.scores.performance)} → ${Math.round(currentResult.scores.performance)} (${performanceChange > 0 ? '+' : ''}${performanceChange.toFixed(1)})`);
      console.log(`   LCP: ${Math.round(previousResult.metrics.lcp)}ms → ${Math.round(currentResult.metrics.lcp)}ms (${lcpChange > 0 ? '-' : '+'}${Math.abs(lcpChange).toFixed(0)}ms)`);
      console.log(`   FID: ${Math.round(previousResult.metrics.fid)}ms → ${Math.round(currentResult.metrics.fid)}ms (${fidChange > 0 ? '-' : '+'}${Math.abs(fidChange).toFixed(0)}ms)`);
      console.log(`   CLS: ${previousResult.metrics.cls.toFixed(3)} → ${currentResult.metrics.cls.toFixed(3)} (${clsChange > 0 ? '-' : '+'}${Math.abs(clsChange).toFixed(3)})`);
    }
    
    // Enregistrer le rapport de comparaison
    const comparisonPath = path.join(OUTPUT_DIR, `${dateStr}_comparison.json`);
    fs.writeFileSync(comparisonPath, JSON.stringify(comparison, null, 2));
    console.log(`\n📊 Rapport de comparaison enregistré: ${comparisonPath}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport de comparaison:', error);
  }
}

// Exécuter les tests
runAllTests(); 
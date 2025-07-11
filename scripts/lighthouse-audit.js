const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { exec } = require('child_process');

// Pages à tester
const pagesToTest = [
  { name: 'home', url: 'http://localhost:3000/' },
  { name: 'services', url: 'http://localhost:3000/services' },
  { name: 'service-detail', url: 'http://localhost:3000/services/audit-securite' },
  { name: 'checkout', url: 'http://localhost:3000/checkout' },
  { name: 'account', url: 'http://localhost:3000/account' },
];

// Configuration Lighthouse
const config = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
  },
};

// Vérifier si le serveur de développement est en cours d'exécution
function checkServerRunning() {
  return new Promise((resolve) => {
    exec('lsof -i :3000', (error, stdout) => {
      if (error || !stdout) {
        console.log('⚠️ Serveur local non détecté sur le port 3000. Démarrage du serveur...');
        exec('npm run dev', { detached: true });
        
        // Attendre que le serveur démarre
        setTimeout(() => {
          console.log('Serveur démarré, démarrage des tests...');
          resolve();
        }, 10000);
      } else {
        console.log('✅ Serveur local détecté sur le port 3000');
        resolve();
      }
    });
  });
}

// Créer le dossier pour les rapports s'il n'existe pas
const reportsDir = path.join(__dirname, '../lighthouse-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Fonction pour exécuter Lighthouse
async function runLighthouse(url, options, config) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  options.port = chrome.port;
  
  try {
    const results = await lighthouse(url, options, config);
    await chrome.kill();
    return results;
  } catch (error) {
    console.error(`Erreur lors de l'audit de ${url}:`, error);
    await chrome.kill();
    return null;
  }
}

// Fonction principale
async function main() {
  await checkServerRunning();
  
  console.log('🚀 Démarrage des audits Lighthouse...');
  
  const summary = {
    date: new Date().toISOString(),
    results: [],
  };
  
  for (const page of pagesToTest) {
    console.log(`\n📋 Audit de la page: ${page.name} (${page.url})`);
    
    const results = await runLighthouse(page.url, { logLevel: 'error' }, config);
    
    if (!results) {
      console.log(`❌ Échec de l'audit pour ${page.name}`);
      continue;
    }
    
    // Extraire les métriques principales
    const { lhr } = results;
    const performanceScore = lhr.categories.performance.score * 100;
    const accessibilityScore = lhr.categories.accessibility.score * 100;
    const bestPracticesScore = lhr.categories.['best-practices'].score * 100;
    const seoScore = lhr.categories.seo.score * 100;
    
    // Extraire les Core Web Vitals
    const lcpValue = lhr.audits['largest-contentful-paint'].numericValue;
    const fidValue = lhr.audits['max-potential-fid'].numericValue;
    const clsValue = lhr.audits['cumulative-layout-shift'].numericValue;
    
    // Afficher les résultats
    console.log(`\n📊 Résultats pour ${page.name}:`);
    console.log(`Performance: ${performanceScore.toFixed(0)}/100`);
    console.log(`Accessibilité: ${accessibilityScore.toFixed(0)}/100`);
    console.log(`Bonnes pratiques: ${bestPracticesScore.toFixed(0)}/100`);
    console.log(`SEO: ${seoScore.toFixed(0)}/100`);
    console.log(`\nCore Web Vitals:`);
    console.log(`LCP: ${(lcpValue / 1000).toFixed(2)}s ${lcpValue < 2500 ? '✅' : '❌'}`);
    console.log(`FID: ${fidValue.toFixed(0)}ms ${fidValue < 100 ? '✅' : '❌'}`);
    console.log(`CLS: ${clsValue.toFixed(3)} ${clsValue < 0.1 ? '✅' : '❌'}`);
    
    // Sauvegarder le rapport HTML
    const htmlReport = results.report;
    const reportPath = path.join(reportsDir, `${page.name}-report.html`);
    fs.writeFileSync(reportPath, htmlReport);
    console.log(`\n💾 Rapport HTML sauvegardé: ${reportPath}`);
    
    // Ajouter au résumé
    summary.results.push({
      page: page.name,
      url: page.url,
      scores: {
        performance: performanceScore,
        accessibility: accessibilityScore,
        bestPractices: bestPracticesScore,
        seo: seoScore,
      },
      coreWebVitals: {
        lcp: lcpValue,
        fid: fidValue,
        cls: clsValue,
      },
      passes: {
        lcp: lcpValue < 2500,
        fid: fidValue < 100,
        cls: clsValue < 0.1,
      },
    });
  }
  
  // Sauvegarder le résumé en JSON
  const summaryPath = path.join(reportsDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`\n📑 Résumé sauvegardé: ${summaryPath}`);
  
  // Générer un rapport de synthèse
  const failedMetrics = summary.results
    .flatMap(result => {
      const failed = [];
      if (!result.passes.lcp) failed.push(`LCP sur ${result.page}`);
      if (!result.passes.fid) failed.push(`FID sur ${result.page}`);
      if (!result.passes.cls) failed.push(`CLS sur ${result.page}`);
      return failed;
    });
  
  if (failedMetrics.length > 0) {
    console.log('\n⚠️ Métriques à améliorer:');
    failedMetrics.forEach(metric => console.log(`- ${metric}`));
  } else {
    console.log('\n✅ Toutes les métriques Core Web Vitals sont bonnes!');
  }
  
  console.log('\n🏁 Audits Lighthouse terminés!');
}

main().catch(error => {
  console.error('Erreur lors de l\'exécution des audits:', error);
  process.exit(1);
}); 
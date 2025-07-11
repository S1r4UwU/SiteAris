const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration de l'audit
const config = {
  projectRoot: path.join(__dirname, '..'),
  outputDir: path.join(__dirname, '../rgpd-reports'),
  supabaseDir: path.join(__dirname, '../lib/supabase'),
  dbDir: path.join(__dirname, '../lib/db'),
  apiDir: path.join(__dirname, '../app/api'),
};

// Créer le dossier de rapports s'il n'existe pas
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Modèles de données sensibles à vérifier
const sensitiveDataPatterns = [
  {
    name: 'Email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    severity: 'HIGH',
  },
  {
    name: 'Numéro de téléphone français',
    pattern: /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g,
    severity: 'MEDIUM',
  },
  {
    name: 'Adresse postale',
    pattern: /\b\d{1,4}\s+[\w\s]{1,20}(?:avenue|rue|boulevard|impasse|allée|place|route|voie)\s+[\w\s]{1,20}\b/gi,
    severity: 'MEDIUM',
  },
  {
    name: 'Numéro de carte bancaire',
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    severity: 'CRITICAL',
  },
  {
    name: 'Numéro de sécurité sociale français',
    pattern: /\b[12]\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b/g,
    severity: 'CRITICAL',
  },
];

// Points de vérification RGPD
const rgpdChecklist = [
  {
    id: 'consent',
    name: 'Consentement explicite',
    description: 'Vérifier que le consentement est explicitement demandé pour la collecte des données',
    filePatterns: ['**/auth/**', '**/components/ui/**', '**/app/auth/**'],
  },
  {
    id: 'data_minimization',
    name: 'Minimisation des données',
    description: 'Vérifier que seules les données nécessaires sont collectées',
    filePatterns: ['**/schema.prisma', '**/supabase.sql', '**/types/**'],
  },
  {
    id: 'retention',
    name: 'Durée de conservation',
    description: 'Vérifier que les durées de conservation des données sont définies',
    filePatterns: ['**/supabase/**', '**/db/**'],
  },
  {
    id: 'security',
    name: 'Sécurité des données',
    description: 'Vérifier que les données sont sécurisées (chiffrement, RLS, etc.)',
    filePatterns: ['**/supabase/**', '**/middleware.ts'],
  },
  {
    id: 'data_subject_rights',
    name: 'Droits des personnes concernées',
    description: 'Vérifier que les utilisateurs peuvent accéder, modifier et supprimer leurs données',
    filePatterns: ['**/account/**', '**/api/**'],
  },
  {
    id: 'breach_notification',
    name: 'Notification de violation',
    description: 'Vérifier que des mécanismes de détection et notification de violation sont en place',
    filePatterns: ['**/middleware.ts', '**/lib/utils/**'],
  },
];

// Fonction pour rechercher des données sensibles dans les fichiers
function scanForSensitiveData(directory, patterns) {
  const findings = [];
  
  // Commande pour trouver tous les fichiers texte dans le répertoire
  const files = execSync(`find ${directory} -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.sql"`, { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      for (const { name, pattern, severity } of patterns) {
        const matches = content.match(pattern);
        
        if (matches) {
          findings.push({
            file,
            dataType: name,
            severity,
            occurrences: matches.length,
            // Ne pas inclure les données sensibles elles-mêmes dans le rapport
          });
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la lecture du fichier ${file}:`, error.message);
    }
  }
  
  return findings;
}

// Fonction pour vérifier les politiques RLS dans Supabase
function checkRLSPolicies() {
  const findings = {
    tablesWithRLS: [],
    tablesWithoutRLS: [],
    policiesFound: [],
  };
  
  try {
    // Lire le fichier SQL de Supabase
    const sqlContent = fs.readFileSync(path.join(config.projectRoot, 'supabase.sql'), 'utf-8');
    
    // Trouver toutes les tables
    const tableMatches = sqlContent.match(/CREATE TABLE (\w+)/g) || [];
    const tables = tableMatches.map(match => match.replace('CREATE TABLE ', ''));
    
    // Vérifier les politiques RLS
    for (const table of tables) {
      const rlsPattern = new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, 'i');
      const policyPattern = new RegExp(`CREATE POLICY .+ ON ${table}`, 'gi');
      
      if (sqlContent.match(rlsPattern)) {
        findings.tablesWithRLS.push(table);
      } else {
        findings.tablesWithoutRLS.push(table);
      }
      
      const policies = sqlContent.match(policyPattern) || [];
      policies.forEach(policy => {
        findings.policiesFound.push({
          table,
          policy: policy.trim(),
        });
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des politiques RLS:', error.message);
  }
  
  return findings;
}

// Fonction pour vérifier les mécanismes de consentement
function checkConsentMechanisms() {
  const findings = {
    consentComponents: [],
    missingConsent: [],
  };
  
  try {
    // Rechercher les composants liés au consentement
    const authFiles = execSync(`find ${config.projectRoot}/app/auth -type f -name "*.tsx"`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean);
    
    for (const file of authFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Vérifier les mécanismes de consentement
      const hasCheckbox = content.includes('<Checkbox') || content.includes('type="checkbox"');
      const hasConsentText = content.includes('consent') || 
                            content.includes('accepte') || 
                            content.includes('conditions') ||
                            content.includes('politique');
      
      if (hasCheckbox && hasConsentText) {
        findings.consentComponents.push({
          file,
          hasExplicitConsent: true,
        });
      } else {
        findings.missingConsent.push({
          file,
          reason: !hasCheckbox ? 'Pas de case à cocher' : 'Texte de consentement non trouvé',
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des mécanismes de consentement:', error.message);
  }
  
  return findings;
}

// Fonction pour vérifier les durées de conservation des données
function checkDataRetention() {
  const findings = {
    definedRetention: [],
    missingRetention: [],
  };
  
  try {
    // Vérifier les fichiers SQL et de configuration
    const dbFiles = [
      ...execSync(`find ${config.dbDir} -type f -name "*.sql"`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean),
      ...execSync(`find ${config.supabaseDir} -type f -name "*.ts"`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean),
    ];
    
    for (const file of dbFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Rechercher des mentions de durée de conservation
      const hasRetention = content.includes('retention') || 
                          content.includes('expire') || 
                          content.includes('TTL') ||
                          content.includes('DELETE FROM') && content.includes('WHERE') && (content.includes('created_at') || content.includes('timestamp'));
      
      if (hasRetention) {
        findings.definedRetention.push({
          file,
          hasRetentionPolicy: true,
        });
      } else {
        findings.missingRetention.push({
          file,
          tables: (content.match(/CREATE TABLE (\w+)/g) || []).map(m => m.replace('CREATE TABLE ', '')),
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des durées de conservation:', error.message);
  }
  
  return findings;
}

// Fonction principale
async function main() {
  console.log('🔍 Démarrage de l\'audit RGPD...');
  
  const report = {
    timestamp: new Date().toISOString(),
    project: 'SiteAris',
    summary: {
      sensitiveDataFindings: 0,
      rlsIssues: 0,
      consentIssues: 0,
      retentionIssues: 0,
      overallRisk: 'UNKNOWN',
    },
    details: {
      sensitiveData: null,
      rlsPolicies: null,
      consentMechanisms: null,
      dataRetention: null,
    },
    recommendations: [],
  };
  
  // 1. Scanner pour les données sensibles
  console.log('\n📊 Recherche de données sensibles...');
  const sensitiveFindings = scanForSensitiveData(config.projectRoot, sensitiveDataPatterns);
  report.details.sensitiveData = sensitiveFindings;
  report.summary.sensitiveDataFindings = sensitiveFindings.length;
  
  if (sensitiveFindings.length > 0) {
    console.log(`⚠️ Trouvé ${sensitiveFindings.length} occurrences de données potentiellement sensibles`);
    report.recommendations.push(
      'Vérifier que les données sensibles identifiées sont correctement protégées ou pseudonymisées'
    );
  } else {
    console.log('✅ Aucune donnée sensible non protégée trouvée');
  }
  
  // 2. Vérifier les politiques RLS
  console.log('\n📊 Vérification des politiques RLS...');
  const rlsFindings = checkRLSPolicies();
  report.details.rlsPolicies = rlsFindings;
  report.summary.rlsIssues = rlsFindings.tablesWithoutRLS.length;
  
  if (rlsFindings.tablesWithoutRLS.length > 0) {
    console.log(`⚠️ Trouvé ${rlsFindings.tablesWithoutRLS.length} tables sans RLS activé`);
    report.recommendations.push(
      'Activer RLS sur toutes les tables contenant des données personnelles'
    );
  } else {
    console.log('✅ Toutes les tables ont RLS activé');
  }
  
  // 3. Vérifier les mécanismes de consentement
  console.log('\n📊 Vérification des mécanismes de consentement...');
  const consentFindings = checkConsentMechanisms();
  report.details.consentMechanisms = consentFindings;
  report.summary.consentIssues = consentFindings.missingConsent.length;
  
  if (consentFindings.missingConsent.length > 0) {
    console.log(`⚠️ Trouvé ${consentFindings.missingConsent.length} formulaires sans mécanisme de consentement explicite`);
    report.recommendations.push(
      'Ajouter des mécanismes de consentement explicite à tous les formulaires de collecte de données'
    );
  } else {
    console.log('✅ Mécanismes de consentement en place');
  }
  
  // 4. Vérifier les durées de conservation
  console.log('\n📊 Vérification des durées de conservation...');
  const retentionFindings = checkDataRetention();
  report.details.dataRetention = retentionFindings;
  report.summary.retentionIssues = retentionFindings.missingRetention.length;
  
  if (retentionFindings.missingRetention.length > 0) {
    console.log(`⚠️ Trouvé ${retentionFindings.missingRetention.length} fichiers sans politique de conservation définie`);
    report.recommendations.push(
      'Définir des durées de conservation pour toutes les données personnelles'
    );
  } else {
    console.log('✅ Politiques de conservation définies');
  }
  
  // Évaluer le risque global
  const totalIssues = report.summary.sensitiveDataFindings + 
                      report.summary.rlsIssues + 
                      report.summary.consentIssues + 
                      report.summary.retentionIssues;
                      
  if (totalIssues === 0) {
    report.summary.overallRisk = 'LOW';
  } else if (totalIssues < 5) {
    report.summary.overallRisk = 'MEDIUM';
  } else {
    report.summary.overallRisk = 'HIGH';
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(config.outputDir, 'rgpd-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Générer un rapport HTML simple
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Rapport d'audit RGPD - SiteAris</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .risk-LOW { color: green; }
    .risk-MEDIUM { color: orange; }
    .risk-HIGH { color: red; }
    .recommendations { background: #e9f7fe; padding: 15px; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Rapport d'audit RGPD - SiteAris</h1>
  <p>Date: ${new Date().toLocaleDateString()}</p>
  
  <div class="summary">
    <h2>Résumé</h2>
    <p><strong>Risque global:</strong> <span class="risk-${report.summary.overallRisk}">${report.summary.overallRisk}</span></p>
    <ul>
      <li>Données sensibles non protégées: ${report.summary.sensitiveDataFindings}</li>
      <li>Tables sans RLS: ${report.summary.rlsIssues}</li>
      <li>Problèmes de consentement: ${report.summary.consentIssues}</li>
      <li>Problèmes de rétention: ${report.summary.retentionIssues}</li>
    </ul>
  </div>
  
  <div class="recommendations">
    <h2>Recommandations</h2>
    <ul>
      ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
  
  <h2>Détails</h2>
  
  <h3>Données sensibles</h3>
  <table>
    <tr>
      <th>Fichier</th>
      <th>Type de données</th>
      <th>Sévérité</th>
      <th>Occurrences</th>
    </tr>
    ${report.details.sensitiveData.map(finding => `
      <tr>
        <td>${finding.file}</td>
        <td>${finding.dataType}</td>
        <td>${finding.severity}</td>
        <td>${finding.occurrences}</td>
      </tr>
    `).join('')}
  </table>
  
  <h3>Politiques RLS</h3>
  <p>Tables avec RLS: ${report.details.rlsPolicies.tablesWithRLS.length}</p>
  <p>Tables sans RLS: ${report.details.rlsPolicies.tablesWithoutRLS.length}</p>
  
  <h3>Mécanismes de consentement</h3>
  <p>Formulaires avec consentement: ${report.details.consentMechanisms.consentComponents.length}</p>
  <p>Formulaires sans consentement: ${report.details.consentMechanisms.missingConsent.length}</p>
  
  <h3>Durées de conservation</h3>
  <p>Fichiers avec politique de rétention: ${report.details.dataRetention.definedRetention.length}</p>
  <p>Fichiers sans politique de rétention: ${report.details.dataRetention.missingRetention.length}</p>
</body>
</html>
  `;
  
  const htmlReportPath = path.join(config.outputDir, 'rgpd-audit-report.html');
  fs.writeFileSync(htmlReportPath, htmlReport);
  
  console.log(`\n📑 Rapport sauvegardé: ${reportPath}`);
  console.log(`📑 Rapport HTML sauvegardé: ${htmlReportPath}`);
  console.log(`\n🏁 Audit RGPD terminé! Risque global: ${report.summary.overallRisk}`);
}

main().catch(error => {
  console.error('Erreur lors de l\'audit RGPD:', error);
  process.exit(1);
}); 
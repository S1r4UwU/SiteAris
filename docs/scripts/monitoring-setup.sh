#!/bin/bash

# Script de configuration du monitoring pour SiteAris en production
# Ce script configure Sentry, UptimeRobot et les alertes Vercel

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
  print_error "npm n'est pas installé"
  exit 1
fi

print_message "Configuration du monitoring pour SiteAris en production"

# Demander les informations nécessaires
read -p "URL du site (ex: https://sitearis.com): " SITE_URL
read -p "Email pour les alertes: " ALERT_EMAIL
read -p "Clé API UptimeRobot (optionnel): " UPTIMEROBOT_API_KEY
read -p "DSN Sentry (optionnel): " SENTRY_DSN
read -p "Token Vercel (optionnel): " VERCEL_TOKEN
read -p "ID du projet Vercel (optionnel): " VERCEL_PROJECT_ID
read -p "ID de l'organisation Vercel (optionnel): " VERCEL_ORG_ID

# Créer un répertoire pour les configurations
CONFIG_DIR="monitoring-config"
mkdir -p "$CONFIG_DIR"
print_message "Répertoire de configuration créé: $CONFIG_DIR"

# Configuration de Sentry
if [ ! -z "$SENTRY_DSN" ]; then
  print_message "Configuration de Sentry"
  
  # Installer le SDK Sentry
  npm install @sentry/nextjs --save
  
  # Créer le fichier de configuration Sentry
  cat > sentry.client.config.js << EOF
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "${SENTRY_DSN}",
  tracesSampleRate: 0.5,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: "production",
});
EOF

  cat > sentry.server.config.js << EOF
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "${SENTRY_DSN}",
  tracesSampleRate: 0.5,
  environment: "production",
});
EOF

  cat > sentry.edge.config.js << EOF
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: "${SENTRY_DSN}",
  tracesSampleRate: 0.5,
  environment: "production",
});
EOF

  # Créer le fichier de configuration Sentry pour Next.js
  cat > next.config.sentry.js << EOF
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // Votre configuration Next.js existante
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
EOF

  print_message "Configuration Sentry créée"
  print_message "Pour l'intégrer, renommez next.config.js en next.config.original.js et next.config.sentry.js en next.config.js"
else
  print_warning "Sentry DSN non fourni, configuration Sentry ignorée"
fi

# Configuration d'UptimeRobot
if [ ! -z "$UPTIMEROBOT_API_KEY" ]; then
  print_message "Configuration d'UptimeRobot"
  
  # Créer un moniteur pour le site principal
  MONITOR_PAYLOAD="{\"api_key\":\"${UPTIMEROBOT_API_KEY}\",\"friendly_name\":\"SiteAris - Site Principal\",\"url\":\"${SITE_URL}\",\"type\":1,\"alert_contacts\":\"${ALERT_EMAIL}\"}"
  
  # Enregistrer la configuration pour une utilisation ultérieure
  echo "$MONITOR_PAYLOAD" > "${CONFIG_DIR}/uptimerobot_main_site.json"
  
  # Créer un moniteur pour l'API
  API_MONITOR_PAYLOAD="{\"api_key\":\"${UPTIMEROBOT_API_KEY}\",\"friendly_name\":\"SiteAris - API\",\"url\":\"${SITE_URL}/api/services\",\"type\":1,\"alert_contacts\":\"${ALERT_EMAIL}\"}"
  
  # Enregistrer la configuration pour une utilisation ultérieure
  echo "$API_MONITOR_PAYLOAD" > "${CONFIG_DIR}/uptimerobot_api.json"
  
  print_message "Configuration UptimeRobot créée"
  print_message "Pour créer les moniteurs, exécutez:"
  print_message "curl -X POST -H \"Content-Type: application/json\" -d @${CONFIG_DIR}/uptimerobot_main_site.json https://api.uptimerobot.com/v2/newMonitor"
  print_message "curl -X POST -H \"Content-Type: application/json\" -d @${CONFIG_DIR}/uptimerobot_api.json https://api.uptimerobot.com/v2/newMonitor"
else
  print_warning "Clé API UptimeRobot non fournie, configuration UptimeRobot ignorée"
fi

# Configuration des alertes Vercel
if [ ! -z "$VERCEL_TOKEN" ] && [ ! -z "$VERCEL_PROJECT_ID" ] && [ ! -z "$VERCEL_ORG_ID" ]; then
  print_message "Configuration des alertes Vercel"
  
  # Créer un fichier de configuration pour les alertes Vercel
  cat > "${CONFIG_DIR}/vercel_alerts.json" << EOF
{
  "name": "Performance Alerts",
  "threshold": {
    "type": "absolute",
    "value": 2500
  },
  "metric": "webVitals",
  "webVitalsMetric": "lcp",
  "statusFilter": "degraded",
  "destinations": [
    {
      "type": "email",
      "email": "${ALERT_EMAIL}"
    }
  ]
}
EOF

  print_message "Configuration des alertes Vercel créée"
  print_message "Pour créer les alertes, exécutez:"
  print_message "curl -X POST -H \"Authorization: Bearer ${VERCEL_TOKEN}\" -H \"Content-Type: application/json\" -d @${CONFIG_DIR}/vercel_alerts.json https://api.vercel.com/v1/projects/${VERCEL_PROJECT_ID}/alerts"
else
  print_warning "Informations Vercel incomplètes, configuration des alertes Vercel ignorée"
fi

# Créer un script de vérification de santé
print_message "Création d'un script de vérification de santé"

cat > "${CONFIG_DIR}/health-check.js" << EOF
const https = require('https');
const fs = require('fs');

const url = '${SITE_URL}';
const apiUrl = '${SITE_URL}/api/services';
const logFile = './health-check.log';

function checkEndpoint(endpoint, name) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    https.get(endpoint, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (res.statusCode === 200) {
        resolve({ name, status: 'OK', code: res.statusCode, time: responseTime });
      } else {
        resolve({ name, status: 'ERROR', code: res.statusCode, time: responseTime });
      }
    }).on('error', (err) => {
      resolve({ name, status: 'ERROR', error: err.message, time: null });
    });
  });
}

async function runHealthCheck() {
  const timestamp = new Date().toISOString();
  const results = [];
  
  try {
    results.push(await checkEndpoint(url, 'Main Site'));
    results.push(await checkEndpoint(apiUrl, 'API'));
    
    const logEntry = {
      timestamp,
      results
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\\n');
    
    // Afficher les résultats
    console.log(\`Health Check: \${timestamp}\`);
    results.forEach(result => {
      console.log(\`\${result.name}: \${result.status} (\${result.code || 'N/A'}) - \${result.time}ms\`);
    });
    
    // Vérifier si des erreurs sont présentes
    const hasErrors = results.some(result => result.status === 'ERROR');
    if (hasErrors) {
      console.error('Des erreurs ont été détectées lors de la vérification de santé');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de santé:', error);
    process.exit(1);
  }
}

runHealthCheck();
EOF

print_message "Script de vérification de santé créé: ${CONFIG_DIR}/health-check.js"
print_message "Pour l'exécuter: node ${CONFIG_DIR}/health-check.js"

# Créer un script cron pour exécuter la vérification de santé
print_message "Création d'un exemple de configuration cron"

cat > "${CONFIG_DIR}/health-check-cron.txt" << EOF
# Exécuter la vérification de santé toutes les 5 minutes
*/5 * * * * cd /chemin/vers/sitearis && node ${CONFIG_DIR}/health-check.js >> /var/log/sitearis-health.log 2>&1
EOF

print_message "Exemple de configuration cron créé: ${CONFIG_DIR}/health-check-cron.txt"
print_message "Pour l'installer: crontab -e et copiez le contenu du fichier"

# Créer un script pour configurer Sentry dans l'environnement Vercel
if [ ! -z "$SENTRY_DSN" ] && [ ! -z "$VERCEL_TOKEN" ] && [ ! -z "$VERCEL_PROJECT_ID" ]; then
  print_message "Création d'un script pour configurer Sentry dans Vercel"
  
  cat > "${CONFIG_DIR}/vercel-sentry-config.json" << EOF
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "environmentVariables": [
    {
      "key": "NEXT_PUBLIC_SENTRY_DSN",
      "value": "${SENTRY_DSN}",
      "target": ["production"]
    },
    {
      "key": "SENTRY_AUTH_TOKEN",
      "value": "VOTRE_TOKEN_SENTRY",
      "target": ["production"]
    },
    {
      "key": "SENTRY_PROJECT",
      "value": "sitearis",
      "target": ["production"]
    },
    {
      "key": "SENTRY_ORG",
      "value": "votre-organisation",
      "target": ["production"]
    }
  ]
}
EOF

  print_message "Configuration Sentry pour Vercel créée: ${CONFIG_DIR}/vercel-sentry-config.json"
  print_message "Pour l'appliquer, modifiez les valeurs manquantes puis exécutez:"
  print_message "curl -X PATCH -H \"Authorization: Bearer ${VERCEL_TOKEN}\" -H \"Content-Type: application/json\" -d @${CONFIG_DIR}/vercel-sentry-config.json https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}"
fi

print_message "Configuration du monitoring terminée"
print_message "Les fichiers de configuration se trouvent dans le répertoire: ${CONFIG_DIR}"

print_message "Prochaines étapes:"
print_message "1. Intégrez Sentry en suivant les instructions ci-dessus"
print_message "2. Créez les moniteurs UptimeRobot en utilisant les commandes fournies"
print_message "3. Configurez les alertes Vercel en utilisant les commandes fournies"
print_message "4. Configurez la vérification de santé en utilisant cron"
print_message "5. Testez chaque système de monitoring"

exit 0 
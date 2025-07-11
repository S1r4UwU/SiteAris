#!/bin/bash

# Script de configuration de l'environnement Vercel Production pour SiteAris
# Ce script doit être exécuté après avoir installé la CLI Vercel et s'être connecté

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

# Vérifier si la CLI Vercel est installée
if ! command -v vercel &> /dev/null; then
  print_error "Vercel CLI n'est pas installée. Veuillez l'installer avec 'npm i -g vercel'"
  exit 1
fi

# Vérifier si l'utilisateur est connecté à Vercel
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
  print_error "Vous n'êtes pas connecté à Vercel. Veuillez vous connecter avec 'vercel login'"
  exit 1
fi

print_message "Configuration de l'environnement Vercel Production pour SiteAris"

# Vérifier si le projet existe déjà
PROJECT_NAME="sitearis"
vercel projects ls | grep -q "$PROJECT_NAME"
if [ $? -eq 0 ]; then
  print_warning "Le projet '$PROJECT_NAME' existe déjà sur Vercel"
else
  print_message "Création du projet '$PROJECT_NAME' sur Vercel"
  vercel projects create "$PROJECT_NAME" --confirm
fi

# Lier le projet local au projet Vercel
print_message "Liaison du projet local au projet Vercel"
vercel link --project "$PROJECT_NAME"

# Configuration des variables d'environnement
print_message "Configuration des variables d'environnement"

# Demander les valeurs des variables d'environnement
read -p "URL Supabase Production: " SUPABASE_URL
read -p "Clé anonyme Supabase Production: " SUPABASE_ANON_KEY
read -p "Clé secrète Supabase Production: " SUPABASE_SERVICE_ROLE_KEY
read -p "URL du site (ex: https://sitearis.com): " SITE_URL
read -p "Clé secrète Stripe: " STRIPE_SECRET_KEY
read -p "Clé webhook Stripe: " STRIPE_WEBHOOK_SECRET
read -p "Domaine personnalisé (ex: sitearis.com): " CUSTOM_DOMAIN

# Ajouter les variables d'environnement au projet Vercel
print_message "Ajout des variables d'environnement au projet Vercel"
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
vercel env add NEXT_PUBLIC_SITE_URL production <<< "$SITE_URL"
vercel env add STRIPE_SECRET_KEY production <<< "$STRIPE_SECRET_KEY"
vercel env add STRIPE_WEBHOOK_SECRET production <<< "$STRIPE_WEBHOOK_SECRET"

# Configuration du domaine personnalisé
if [ ! -z "$CUSTOM_DOMAIN" ]; then
  print_message "Configuration du domaine personnalisé: $CUSTOM_DOMAIN"
  vercel domains add "$PROJECT_NAME" "$CUSTOM_DOMAIN"
fi

# Configuration des paramètres du projet
print_message "Configuration des paramètres du projet"

# Activer les analyses Vercel
vercel analytics enable

# Configuration des paramètres de build
vercel project update --build-command "npm run build" \
                      --output-directory ".next" \
                      --install-command "npm ci" \
                      --framework nextjs

# Configuration des paramètres de déploiement
vercel project update --public-source false \
                      --serverless-function-region cdg1 \
                      --edge-config '{"images":{"sizes":[640,750,828,1080,1200,1920],"domains":["sitearis.com"]}}'

# Configuration des redirections
print_message "Configuration des redirections"
cat > vercel.json << EOF
{
  "version": 2,
  "redirects": [
    { "source": "/connexion", "destination": "/auth", "permanent": true },
    { "source": "/inscription", "destination": "/auth?signup=true", "permanent": true },
    { "source": "/mon-compte", "destination": "/account", "permanent": true },
    { "source": "/catalogue", "destination": "/services", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self)"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF

print_message "Fichier vercel.json créé avec succès"

# Déploiement initial
print_message "Déploiement initial du projet"
vercel deploy --prod

# Vérifier le statut du déploiement
if [ $? -eq 0 ]; then
  print_message "Configuration et déploiement terminés avec succès"
  print_message "URL du projet: $(vercel project ls --name $PROJECT_NAME --json | grep url | cut -d'"' -f4)"
  
  if [ ! -z "$CUSTOM_DOMAIN" ]; then
    print_message "Domaine personnalisé: $CUSTOM_DOMAIN"
    print_message "N'oubliez pas de configurer les enregistrements DNS pour votre domaine personnalisé"
  fi
else
  print_error "Une erreur s'est produite lors du déploiement"
  exit 1
fi

print_message "Configuration de Vercel Analytics"
print_message "1. Accédez à https://vercel.com/$PROJECT_NAME/analytics"
print_message "2. Activez les Core Web Vitals et Real User Monitoring"
print_message "3. Configurez les alertes pour les métriques importantes"

print_message "Prochaines étapes:"
print_message "1. Vérifiez les paramètres du projet dans l'interface Vercel"
print_message "2. Configurez les intégrations (Sentry, etc.)"
print_message "3. Vérifiez les performances avec Lighthouse"
print_message "4. Testez les fonctionnalités critiques"

exit 0 
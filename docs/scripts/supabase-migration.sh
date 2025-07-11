#!/bin/bash

# Script de migration de la base de données vers Supabase Production pour SiteAris
# Ce script doit être exécuté après avoir installé la CLI Supabase et s'être connecté

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

# Vérifier si la CLI Supabase est installée
if ! command -v supabase &> /dev/null; then
  print_error "Supabase CLI n'est pas installée. Veuillez l'installer avec 'npm i -g supabase'"
  exit 1
fi

print_message "Migration de la base de données vers Supabase Production pour SiteAris"

# Demander les informations de connexion
read -p "URL Supabase Staging (format: https://[ID].supabase.co): " STAGING_URL
read -p "Clé de service Supabase Staging: " STAGING_KEY
read -p "URL Supabase Production (format: https://[ID].supabase.co): " PROD_URL
read -p "Clé de service Supabase Production: " PROD_KEY

# Vérifier que les URLs sont valides
if [[ ! $STAGING_URL =~ ^https://[a-z0-9-]+\.supabase\.co$ ]]; then
  print_error "L'URL Supabase Staging n'est pas valide"
  exit 1
fi

if [[ ! $PROD_URL =~ ^https://[a-z0-9-]+\.supabase\.co$ ]]; then
  print_error "L'URL Supabase Production n'est pas valide"
  exit 1
fi

# Créer un répertoire temporaire pour les fichiers de migration
TEMP_DIR=$(mktemp -d)
print_message "Répertoire temporaire créé: $TEMP_DIR"

# Extraire les IDs des projets à partir des URLs
STAGING_ID=$(echo $STAGING_URL | sed -E 's|https://([a-z0-9-]+)\.supabase\.co|\1|')
PROD_ID=$(echo $PROD_URL | sed -E 's|https://([a-z0-9-]+)\.supabase\.co|\1|')

# Générer les URLs de base de données
STAGING_DB_URL="postgresql://postgres:${STAGING_KEY}@db.${STAGING_ID}.supabase.co:5432/postgres"
PROD_DB_URL="postgresql://postgres:${PROD_KEY}@db.${PROD_ID}.supabase.co:5432/postgres"

# Créer une sauvegarde de la base de données de production avant la migration
print_message "Création d'une sauvegarde de la base de données de production"
BACKUP_FILE="${TEMP_DIR}/prod_backup_$(date +%Y%m%d_%H%M%S).sql"
supabase db dump -f "$BACKUP_FILE" --db-url "$PROD_DB_URL"

if [ $? -ne 0 ]; then
  print_error "Échec de la sauvegarde de la base de données de production"
  exit 1
fi

print_message "Sauvegarde de la base de données de production créée: $BACKUP_FILE"

# Créer un dump de la base de données de staging
print_message "Création d'un dump de la base de données de staging"
DUMP_FILE="${TEMP_DIR}/staging_dump_$(date +%Y%m%d_%H%M%S).sql"
supabase db dump -f "$DUMP_FILE" --db-url "$STAGING_DB_URL"

if [ $? -ne 0 ]; then
  print_error "Échec du dump de la base de données de staging"
  exit 1
fi

print_message "Dump de la base de données de staging créé: $DUMP_FILE"

# Confirmation avant de procéder à la migration
print_warning "ATTENTION: Vous êtes sur le point de migrer la base de données de staging vers production."
print_warning "Cette opération va écraser toutes les données existantes dans la base de données de production."
read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " CONFIRM

if [ "$CONFIRM" != "oui" ]; then
  print_message "Migration annulée"
  exit 0
fi

# Restaurer le dump dans la base de données de production
print_message "Restauration du dump dans la base de données de production"
supabase db restore --db-url "$PROD_DB_URL" "$DUMP_FILE"

if [ $? -ne 0 ]; then
  print_error "Échec de la restauration du dump dans la base de données de production"
  print_warning "Une sauvegarde de la base de données de production est disponible: $BACKUP_FILE"
  exit 1
fi

print_message "Dump restauré avec succès dans la base de données de production"

# Vérifier les politiques RLS
print_message "Vérification des politiques RLS"
supabase db lint --db-url "$PROD_DB_URL"

if [ $? -ne 0 ]; then
  print_warning "Des problèmes ont été détectés dans les politiques RLS"
  print_warning "Veuillez vérifier manuellement les politiques RLS dans la console Supabase"
else
  print_message "Politiques RLS vérifiées avec succès"
fi

# Vérifier les données migrées
print_message "Vérification des données migrées"

# Compter le nombre d'utilisateurs
USER_COUNT=$(supabase db query --db-url "$PROD_DB_URL" "SELECT COUNT(*) FROM auth.users" -o csv | tail -n 1)
print_message "Nombre d'utilisateurs migrés: $USER_COUNT"

# Compter le nombre de services
SERVICE_COUNT=$(supabase db query --db-url "$PROD_DB_URL" "SELECT COUNT(*) FROM public.services" -o csv | tail -n 1)
print_message "Nombre de services migrés: $SERVICE_COUNT"

# Compter le nombre de commandes
ORDER_COUNT=$(supabase db query --db-url "$PROD_DB_URL" "SELECT COUNT(*) FROM public.orders" -o csv | tail -n 1)
print_message "Nombre de commandes migrées: $ORDER_COUNT"

# Configurer les webhooks Stripe
print_message "Configuration des webhooks Stripe"
print_message "1. Accédez à https://dashboard.stripe.com/webhooks"
print_message "2. Créez un nouveau endpoint de webhook avec l'URL: ${PROD_URL}/api/stripe/webhooks"
print_message "3. Sélectionnez les événements suivants:"
print_message "   - checkout.session.completed"
print_message "   - payment_intent.succeeded"
print_message "   - payment_intent.payment_failed"
print_message "4. Copiez la clé de signature du webhook"
print_message "5. Ajoutez-la dans les variables d'environnement de votre projet Vercel"

# Nettoyage
print_message "Nettoyage des fichiers temporaires"
rm -f "$DUMP_FILE"
print_message "Migration terminée avec succès"
print_message "Une sauvegarde de la base de données de production avant migration est disponible: $BACKUP_FILE"

print_message "Prochaines étapes:"
print_message "1. Vérifiez les données dans la console Supabase Production"
print_message "2. Vérifiez les politiques RLS pour chaque table"
print_message "3. Configurez les sauvegardes automatiques"
print_message "4. Testez les fonctionnalités critiques avec la nouvelle base de données"

exit 0 
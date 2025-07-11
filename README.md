# SiteAris

Plateforme e-commerce B2B/B2C spécialisée dans la vente de services informatiques et cybersécurité.

## Déploiement en Production

La plateforme est désormais disponible en production à l'adresse [https://sitearis.com](https://sitearis.com).

### Architecture

- **Frontend** : Next.js 14+ avec App Router
- **Backend** : API Routes Next.js + Supabase
- **Base de données** : PostgreSQL (via Supabase)
- **Authentification** : Supabase Auth
- **Paiements** : Stripe
- **Déploiement** : Vercel + Supabase Cloud
- **Monitoring** : Sentry, Vercel Analytics, UptimeRobot

### Documentation

La documentation complète du projet est disponible dans le dossier `docs/` :

- [Guide de Déploiement Production](docs/deploiement-production.md)
- [Documentation Technique](docs/documentation-technique.md)
- [Guide Administrateur](docs/guide-administrateur.md)
- [Plan de Maintenance](docs/plan-maintenance.md)
- [Guide de Formation](docs/guide-formation.md)
- [Rapport de Migration](docs/rapport-migration.md)

### Scripts de Déploiement

Des scripts automatisés sont disponibles pour faciliter le déploiement et la maintenance :

- [Configuration Vercel](docs/scripts/vercel-setup.sh)
- [Migration Supabase](docs/scripts/supabase-migration.sh)
- [Configuration du Monitoring](docs/scripts/monitoring-setup.sh)

Pour les exécuter :

```bash
# Rendre les scripts exécutables
chmod +x docs/scripts/*.sh

# Configuration de Vercel
./docs/scripts/vercel-setup.sh

# Migration de la base de données
./docs/scripts/supabase-migration.sh

# Configuration du monitoring
./docs/scripts/monitoring-setup.sh
```

## Développement

### Prérequis

- Node.js 18+
- npm 8+
- Compte Supabase
- Compte Stripe (pour les paiements)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/organisation/sitearis.git
cd sitearis

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Modifier les variables dans .env.local

# Démarrer le serveur de développement
npm run dev
```

### Structure du Projet

- `app/` - Pages et routes Next.js (App Router)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires et services
- `public/` - Fichiers statiques
- `tests/` - Tests automatisés
- `docs/` - Documentation

### Tests

```bash
# Exécuter les tests unitaires
npm test

# Exécuter les tests E2E
npm run test:e2e

# Exécuter les tests de charge
npm run test:load

# Vérifier les performances avec Lighthouse
npm run test:lighthouse
```

## Contact

Pour toute question concernant ce projet, veuillez contacter :

- **Support Technique** : support@sitearis.com
- **Administration** : admin@sitearis.com
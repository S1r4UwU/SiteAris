# Guide de Déploiement Production SiteAris

## Configuration Vercel Production

### Prérequis
- Compte Vercel avec accès administrateur
- Dépôt GitHub connecté à Vercel
- Domaine personnalisé acquis (sitearis.com)
- Variables d'environnement de production prêtes

### Étapes de configuration
1. **Connexion au compte Vercel**
   - Accéder à [vercel.com](https://vercel.com) et se connecter
   - Sélectionner l'équipe SiteAris

2. **Import du projet**
   - Cliquer sur "Add New" > "Project"
   - Sélectionner le dépôt GitHub "SiteAris"
   - Configurer le projet:
     - Framework preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Configuration des variables d'environnement**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[VOTRE_ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[CLÉ_ANONYME]
   STRIPE_SECRET_KEY=[CLÉ_SECRÈTE_PRODUCTION]
   STRIPE_WEBHOOK_SECRET=[SECRET_WEBHOOK_PRODUCTION]
   NEXT_PUBLIC_SITE_URL=https://sitearis.com
   ```

4. **Configuration du domaine personnalisé**
   - Dans les paramètres du projet, aller à "Domains"
   - Ajouter le domaine "sitearis.com"
   - Suivre les instructions pour configurer les enregistrements DNS:
     - Type: A, Nom: @, Valeur: 76.76.21.21
     - Type: CNAME, Nom: www, Valeur: cname.vercel-dns.com

5. **Activation des optimisations Edge Runtime**
   - Dans "Settings" > "Functions", activer:
     - Edge Middleware
     - Edge Functions pour les routes API critiques
   - Configurer le cache ISR pour les pages statiques dans `next.config.js`

6. **Configuration des Analytics**
   - Activer "Vercel Analytics" dans les paramètres du projet
   - Configurer les intégrations avec:
     - Google Analytics
     - Sentry pour le monitoring des erreurs

## Migration vers Supabase Production

### Prérequis
- Compte Supabase avec projet de production créé
- CLI Supabase installée et configurée
- Accès administrateur à la base de données

### Étapes de migration

1. **Préparation de l'environnement Supabase Production**
   - Créer un nouveau projet dans Supabase Cloud
   - Noter l'URL et la clé anonyme pour les variables d'environnement

2. **Migration du schéma de base de données**
   ```bash
   # Exporter le schéma de staging
   supabase db dump -f schema.sql --db-url=[URL_STAGING]
   
   # Importer le schéma en production
   supabase db push --db-url=[URL_PRODUCTION] -f schema.sql
   ```

3. **Migration des données**
   ```bash
   # Exporter les données
   supabase db dump -f data.sql --data-only --db-url=[URL_STAGING]
   
   # Importer les données en production
   supabase db push --db-url=[URL_PRODUCTION] -f data.sql
   ```

4. **Configuration des politiques RLS**
   - Vérifier que toutes les politiques RLS sont correctement appliquées
   - Tester les permissions pour chaque rôle utilisateur

5. **Configuration des sauvegardes automatiques**
   - Dans les paramètres du projet Supabase:
     - Activer les sauvegardes quotidiennes
     - Configurer la rétention à 30 jours
     - Activer les sauvegardes à la demande

6. **Configuration des webhooks**
   - Configurer les webhooks Supabase pour les événements d'authentification
   - Mettre à jour les URL des webhooks dans Stripe pour pointer vers l'environnement de production

## Configuration du Monitoring

### Sentry
1. **Intégration de Sentry**
   - Créer un projet dans Sentry
   - Installer le SDK Sentry dans le projet Next.js:
   ```bash
   npm install @sentry/nextjs
   ```
   - Configurer Sentry dans `next.config.js`:
   ```javascript
   const { withSentryConfig } = require('@sentry/nextjs');
   
   const nextConfig = {
     // Configuration Next.js existante
   };
   
   module.exports = withSentryConfig(nextConfig, {
     silent: true,
     org: "sitearis",
     project: "sitearis-frontend",
   });
   ```

2. **Configuration des alertes**
   - Configurer des alertes pour:
     - Erreurs 5xx
     - Temps de réponse > 2s
     - Taux d'erreur > 1%

### Vercel Analytics
1. **Configuration des rapports de performance**
   - Activer Web Vitals
   - Configurer des alertes pour:
     - LCP > 2.5s
     - FID > 100ms
     - CLS > 0.1

2. **Configuration des rapports d'utilisation**
   - Activer le suivi des pages vues
   - Configurer des rapports hebdomadaires

### Logs centralisés
1. **Configuration de Logtail**
   ```bash
   npm install @logtail/next
   ```
   - Configurer le middleware de logging dans `middleware.ts`

## Procédures de Rollback

### Rollback Vercel
1. **Retour à un déploiement précédent**
   - Dans le tableau de bord Vercel, aller à "Deployments"
   - Sélectionner le déploiement stable précédent
   - Cliquer sur "Promote to Production"

2. **Rollback des changements de configuration**
   - Conserver un historique des modifications de configuration
   - Restaurer les variables d'environnement précédentes si nécessaire

### Rollback Supabase
1. **Restauration à partir d'une sauvegarde**
   ```bash
   # Lister les sauvegardes disponibles
   supabase db backups list
   
   # Restaurer à partir d'une sauvegarde
   supabase db restore --backup-id=[ID_SAUVEGARDE]
   ```

2. **Rollback des migrations**
   - Conserver les scripts de migration avec possibilité de rollback
   - Exécuter les scripts de rollback en cas de problème

## Checklist de Déploiement

### Pré-déploiement
- [ ] Tests E2E Playwright exécutés avec succès
- [ ] Audit de sécurité OWASP complété
- [ ] Vérification des performances avec Lighthouse
- [ ] Validation RGPD effectuée
- [ ] Variables d'environnement de production configurées

### Déploiement
- [ ] Migration de la base de données Supabase
- [ ] Déploiement de l'application sur Vercel
- [ ] Configuration du domaine personnalisé
- [ ] Vérification des certificats SSL
- [ ] Tests de smoke post-déploiement

### Post-déploiement
- [ ] Vérification des métriques de performance
- [ ] Confirmation des intégrations (Stripe, etc.)
- [ ] Validation des politiques RLS
- [ ] Test complet du parcours utilisateur
- [ ] Activation du monitoring et des alertes 
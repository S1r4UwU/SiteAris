# Plan de Maintenance SiteAris

## Introduction

Ce document définit les procédures de maintenance, les responsabilités et les calendriers pour assurer le bon fonctionnement de la plateforme SiteAris après son lancement en production. Il sert de référence pour l'équipe technique et les parties prenantes.

## Niveaux de Service (SLA)

### Disponibilité du Service

| Environnement | Disponibilité cible | Période de maintenance | Temps de réponse incident |
|---------------|---------------------|------------------------|---------------------------|
| Production    | 99.9% (8h45 d'indisponibilité max/an) | Dimanche 23h-2h | P0: 15min, P1: 1h, P2: 4h |
| Staging       | 99% (87h36 d'indisponibilité max/an) | Selon besoin | P0: 4h, P1: 8h, P2: 24h |

### Classification des Incidents

| Priorité | Description | Exemples |
|----------|-------------|----------|
| P0 (Critique) | Service totalement indisponible | Site inaccessible, paiements impossibles |
| P1 (Haute) | Fonctionnalité majeure impactée | Panier non fonctionnel, commandes bloquées |
| P2 (Moyenne) | Fonctionnalité mineure impactée | Problème d'affichage, lenteur |
| P3 (Basse) | Impact minimal | Typo, problème cosmétique |

## Maintenance Préventive

### Mises à Jour Régulières

| Type | Fréquence | Responsable | Procédure |
|------|-----------|-------------|-----------|
| Dépendances npm | Hebdomadaire | Équipe Dev | Exécution de `npm audit` et mise à jour des packages non critiques |
| Next.js | Trimestrielle | Lead Dev | Mise à jour vers la dernière version stable après tests |
| Supabase | Trimestrielle | DBA | Mise à jour de l'instance Supabase après tests |
| Stripe API | Selon besoins | Lead Dev | Suivi des dépréciations et mise à jour |

### Surveillance et Monitoring

| Élément | Outil | Fréquence | Seuil d'alerte |
|---------|------|-----------|----------------|
| Performance frontend | Vercel Analytics | Temps réel | LCP > 2.5s, FID > 100ms |
| Erreurs frontend | Sentry | Temps réel | > 0.5% des sessions |
| Performance API | Vercel Analytics | Temps réel | Latence > 500ms |
| Base de données | Supabase Monitoring | Temps réel | CPU > 80%, espace disque < 20% |
| Disponibilité | Uptime Robot | 5 min | Temps de réponse > 2s |

### Sauvegardes

| Type | Fréquence | Rétention | Responsable |
|------|-----------|-----------|-------------|
| Base de données complète | Quotidienne à 3h | 30 jours | Automatique (Supabase) |
| Base de données complète | Hebdomadaire (Dimanche) | 3 mois | DBA |
| Base de données complète | Mensuelle (1er du mois) | 1 an | DBA |
| Fichiers stockés | Hebdomadaire | 3 mois | DevOps |
| Configuration | À chaque changement | Indéfinie (Git) | DevOps |

## Maintenance Corrective

### Procédure de Gestion des Incidents

1. **Détection**
   - Via alertes automatisées (Sentry, Vercel, Uptime Robot)
   - Via signalement utilisateur (support client)

2. **Qualification**
   - Évaluation de l'impact et de la priorité
   - Assignation à un membre de l'équipe

3. **Résolution**
   - Investigation et diagnostic
   - Application de correctifs
   - Vérification de la résolution

4. **Communication**
   - Notification aux parties prenantes
   - Mise à jour de la page statut (status.sitearis.com)

5. **Post-mortem**
   - Analyse des causes racines
   - Documentation de l'incident
   - Mise en place d'actions préventives

### Contacts d'Urgence

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| Lead Developer | lead@sitearis.com, +33 6 XX XX XX XX | 9h-18h en semaine, astreinte week-end |
| DevOps | devops@sitearis.com, +33 6 XX XX XX XX | 9h-18h en semaine, astreinte week-end |
| DBA | dba@sitearis.com, +33 6 XX XX XX XX | 9h-18h en semaine |
| Support N3 | support-n3@sitearis.com | 24/7 |

## Maintenance Évolutive

### Cycle de Développement

| Phase | Durée | Description |
|-------|-------|-------------|
| Sprint | 2 semaines | Développement de nouvelles fonctionnalités |
| Release Candidate | 1 semaine | Tests en environnement de staging |
| Déploiement | Dimanche soir | Mise en production |
| Stabilisation | 2 jours | Surveillance post-déploiement |

### Gestion des Versions

- **Versionnement sémantique** : MAJEUR.MINEUR.CORRECTIF
- **Branches Git** :
  - `main` : Code en production
  - `develop` : Code en développement
  - `feature/*` : Nouvelles fonctionnalités
  - `hotfix/*` : Correctifs urgents

### Procédure de Déploiement

1. **Préparation**
   - Revue de code complète
   - Tests automatisés (unitaires, E2E)
   - Tests de charge si nécessaire
   - Validation fonctionnelle en staging

2. **Déploiement**
   - Sauvegarde pré-déploiement
   - Déploiement via pipeline CI/CD
   - Vérification des migrations de base de données
   - Tests de smoke post-déploiement

3. **Validation**
   - Vérification des métriques de performance
   - Vérification des parcours critiques
   - Surveillance des erreurs dans Sentry

4. **Communication**
   - Notification aux équipes internes
   - Mise à jour de la documentation

## Maintenance de la Base de Données

### Optimisations Régulières

| Action | Fréquence | Responsable |
|--------|-----------|-------------|
| Analyse des requêtes lentes | Hebdomadaire | DBA |
| Optimisation des index | Mensuelle | DBA |
| Vacuum des tables | Hebdomadaire | Automatique |
| Vérification de l'intégrité | Mensuelle | DBA |

### Gestion de la Croissance

| Seuil | Action |
|-------|--------|
| 70% espace disque | Planification extension |
| 80% espace disque | Extension d'urgence |
| Tables > 10M lignes | Stratégie de partitionnement |
| Temps de requête > 1s | Optimisation ou mise en cache |

## Sécurité

### Audits Réguliers

| Type | Fréquence | Responsable |
|------|-----------|-------------|
| Scan de vulnérabilités | Hebdomadaire | Automatique (CI/CD) |
| Audit des dépendances | Hebdomadaire | Automatique (npm audit) |
| Audit de sécurité approfondi | Trimestriel | Équipe sécurité |
| Test de pénétration | Semestriel | Prestataire externe |

### Gestion des Vulnérabilités

| Criticité | Délai de correction | Responsable |
|-----------|---------------------|-------------|
| Critique | Immédiat (24h max) | Lead Dev + DevOps |
| Haute | 1 semaine | Lead Dev |
| Moyenne | Prochain sprint | Équipe Dev |
| Basse | Planifié | Équipe Dev |

## Procédures de Rollback

### Rollback Application

En cas d'échec du déploiement ou de problème critique post-déploiement :

1. Identifier la version stable précédente
2. Exécuter la commande de rollback dans Vercel :
   ```bash
   vercel rollback --prod
   ```
3. Vérifier le bon fonctionnement après rollback
4. Communiquer le statut aux parties prenantes

### Rollback Base de Données

En cas de problème avec les migrations de base de données :

1. Restaurer la sauvegarde pré-déploiement :
   ```bash
   supabase db restore --db-url=[URL] --backup-id=[ID]
   ```
2. Vérifier l'intégrité des données
3. Synchroniser avec le rollback application si nécessaire

## Documentation et Formation

### Maintenance de la Documentation

| Document | Fréquence de mise à jour | Responsable |
|----------|--------------------------|-------------|
| Documentation technique | À chaque changement majeur | Lead Dev |
| Guide administrateur | À chaque nouvelle fonctionnalité | Product Owner |
| Procédures opérationnelles | Trimestrielle | DevOps |
| Plan de maintenance | Semestrielle | Lead Dev + DevOps |

### Formation Continue

| Type | Public | Fréquence |
|------|--------|-----------|
| Nouveautés techniques | Équipe Dev | À chaque déploiement majeur |
| Procédures d'urgence | DevOps, Support | Trimestrielle |
| Utilisation back-office | Équipe Support | À chaque évolution majeure |

## Calendrier de Maintenance

### Planning Annuel

| Mois | Actions Planifiées |
|------|-------------------|
| Janvier | Audit de performance, Mise à jour Next.js |
| Avril | Audit de sécurité, Mise à jour Supabase |
| Juillet | Test de reprise d'activité, Optimisation BDD |
| Octobre | Test de charge, Mise à jour Next.js |

### Fenêtres de Maintenance

- **Hebdomadaire** : Dimanche 23h-2h
- **Exceptionnelle** : Communiquée 1 semaine à l'avance

## Métriques et KPI

### Performance Technique

| Métrique | Objectif | Fréquence de mesure |
|----------|----------|---------------------|
| Disponibilité | > 99.9% | Mensuelle |
| Temps de réponse moyen | < 200ms | Quotidienne |
| LCP (Largest Contentful Paint) | < 2.5s | Quotidienne |
| FID (First Input Delay) | < 100ms | Quotidienne |
| CLS (Cumulative Layout Shift) | < 0.1 | Quotidienne |

### Performance Opérationnelle

| Métrique | Objectif | Fréquence de mesure |
|----------|----------|---------------------|
| Temps moyen de résolution (MTTR) | < 4h | Mensuelle |
| Temps entre incidents (MTBF) | > 30 jours | Mensuelle |
| Taux de réussite des déploiements | > 95% | Mensuelle |
| Couverture des tests | > 80% | À chaque build |

## Annexes

### Outils de Maintenance

- **Monitoring** : Vercel Analytics, Sentry, Uptime Robot
- **Base de données** : Supabase Dashboard, pgAdmin
- **Déploiement** : Vercel, GitHub Actions
- **Communication** : Slack (canal #incidents)

### Modèles de Communication

#### Notification d'Incident

```
[INCIDENT] SiteAris - [P1] Problème de paiement

Statut : En cours d'investigation
Impact : Les utilisateurs ne peuvent pas finaliser leurs paiements
Début : 15/06/2023 14:30 CEST
Actions : L'équipe technique est mobilisée

Prochaine mise à jour : 15/06/2023 15:00 CEST
```

#### Notification de Maintenance

```
[MAINTENANCE] SiteAris - Mise à jour planifiée

Date : 12/06/2023 23:00-02:00 CEST
Impact : Indisponibilité temporaire de la plateforme
Raison : Mise à jour de l'infrastructure
Contact : support@sitearis.com
```

### Liste de Vérification Post-Incident

- [ ] Résolution technique confirmée
- [ ] Communication aux utilisateurs affectés
- [ ] Documentation de l'incident
- [ ] Analyse des causes racines
- [ ] Actions correctives identifiées
- [ ] Mise à jour des procédures si nécessaire 
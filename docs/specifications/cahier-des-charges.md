# Cahier des Charges - SiteAris

## 1. Introduction

### 1.1 Contexte
SiteAris est une plateforme e-commerce dédiée à la vente de services informatiques et de cybersécurité. L'objectif est de proposer une interface intuitive permettant aux clients de configurer, commander et suivre des prestations techniques, tout en offrant aux administrateurs un back-office complet pour la gestion des commandes et des clients.

### 1.2 Objectifs du projet
- Créer une plateforme e-commerce B2B/B2C pour des services IT et cybersécurité
- Proposer un configurateur de services avec calcul automatique de devis
- Offrir une expérience client fluide et sécurisée
- Fournir un back-office complet pour la gestion administrative
- Garantir la conformité RGPD et la sécurité des données

### 1.3 Périmètre
Le projet couvre:
- Le développement d'une interface client (front-office)
- Le développement d'une interface administrateur (back-office)
- Le système de gestion de base de données
- La gestion des paiements en ligne
- Les fonctionnalités de suivi de commande et support client

## 2. Description Fonctionnelle

### 2.1 Interface Client

#### 2.1.1 Page d'accueil
- Header avec menu de navigation, recherche et accès compte/panier
- Bannière principale présentant les avantages clés
- Sélection des catégories de services principales
- Présentation des services phares/promotions
- Témoignages clients et badges de confiance
- Pied de page avec liens utiles, mentions légales et contacts

#### 2.1.2 Catalogue de services
- Présentation des catégories de services:
  * Audit de sécurité
  * Services réseau
  * Installation logicielle
  * Maintenance et support
  * Formation et conseil
- Système de filtres (prix, délai, complexité)
- Vue liste/grille des services
- Système de recherche avancée

#### 2.1.3 Fiche service
- Description détaillée du service
- Options disponibles et caractéristiques
- Prix de base et délai estimé
- Configurateur d'options
- Bouton d'ajout au panier
- Services complémentaires recommandés
- FAQ spécifique au service

#### 2.1.4 Configurateur de devis
- Sélection des options du service
- Calcul dynamique du prix selon les critères:
  * Nombre de postes/serveurs
  * Options sélectionnées
  * Niveau de SLA
  * Urgence de l'intervention
- Possibilité d'enregistrer la configuration
- Récapitulatif du devis avant ajout au panier

#### 2.1.5 Panier et commande
- Liste des services avec options
- Récapitulatif des prix
- Possibilité de modifier les quantités/options
- Estimation du délai total
- Processus de commande en étapes:
  1. Identification (compte/invité)
  2. Informations de facturation/livraison
  3. Sélection du mode de paiement
  4. Confirmation et paiement
  5. Récapitulatif de commande

#### 2.1.6 Espace client
- Tableau de bord personnalisé
- Historique des commandes avec statut
- Suivi en temps réel des interventions
- Téléchargement de documents (factures, rapports)
- Gestion du profil et informations personnelles
- Module de support et tickets
- Messagerie avec l'équipe technique

### 2.2 Interface Administrateur (Back-office)

#### 2.2.1 Dashboard global
- Indicateurs clés de performance (KPI)
- Graphiques des ventes et conversions
- Liste des commandes récentes
- Alertes et notifications

#### 2.2.2 Gestion des commandes
- Liste complète des commandes avec filtres
- Vue détaillée des commandes
- Gestion des statuts et notifications client
- Assignation des techniciens
- Planification des interventions
- Suivi SLA et délais

#### 2.2.3 Gestion des services
- CRUD complet des services et catégories
- Configuration des options et variantes
- Gestion des prix et promotions
- Association de ressources (techniciens, matériel)

#### 2.2.4 CRM et gestion clients
- Base de données clients complète
- Historique d'achat et interactions
- Segmentation client
- Gestion des communications
- Suivi de la satisfaction client

#### 2.2.5 Module de planification
- Calendrier des interventions
- Disponibilité des techniciens
- Assignation automatique/manuelle
- Génération d'ordres de mission
- Notifications équipe technique

#### 2.2.6 Reporting et analytics
- Rapports de vente personnalisables
- Analyse des performances par service
- Suivi de conversion des devis
- Rapports de satisfaction client
- Export données (CSV, Excel, PDF)

#### 2.2.7 Administration système
- Gestion des utilisateurs et rôles
- Configuration système
- Logs d'audit et activité
- Sauvegarde et maintenance
- Paramètres de sécurité

## 3. Spécifications Techniques

### 3.1 Architecture générale

#### 3.1.1 Frontend
- Application Single Page (SPA) en React.js
- Interface responsive (mobile-first)
- Design system modulaire avec composants réutilisables
- État global géré avec Redux
- Validations côté client avec Formik et Yup

#### 3.1.2 Backend
- API RESTful avec Node.js/Express
- Base de données PostgreSQL
- ORM Prisma pour la gestion des modèles
- Architecture en couches (controllers, services, repositories)
- Documentation API avec Swagger

#### 3.1.3 Sécurité
- Authentification JWT avec refresh tokens
- Double authentification pour les comptes sensibles
- Chiffrement des données sensibles
- Protection CSRF/XSS
- Audit de sécurité régulier
- Conformité RGPD

### 3.2 Modèles de données principaux

#### 3.2.1 Utilisateurs
- Rôles: client, admin, support, technicien
- Informations personnelles/professionnelles
- Préférences et paramètres

#### 3.2.2 Services
- Catégories et sous-catégories
- Options et variantes
- Règles de prix
- Spécifications techniques

#### 3.2.3 Commandes
- Statuts et étapes
- Items et configurations
- Facturation et paiement
- Planification et assignment

#### 3.2.4 Interventions
- Planning et ressources
- Rapports techniques
- Suivi d'avancement
- SLA et métriques

### 3.3 Intégrations externes
- Passerelle de paiement: Stripe
- Authentification OAuth: Google, Microsoft
- Email transactionnel: SendGrid
- Support chat: Intercom ou Crisp
- Monitoring: Sentry

## 4. Contraintes et Exigences

### 4.1 Performances
- Temps de chargement des pages < 2s
- Support simultané de 500+ utilisateurs
- Optimisation mobile et desktop
- Mise en cache efficace des données

### 4.2 Sécurité
- Conformité OWASP Top 10
- Chiffrement SSL/TLS
- Protection des données personnelles
- Tests de pénétration

### 4.3 Conformité
- RGPD
- Législation e-commerce française
- Accessibilité WCAG 2.1 niveau AA

### 4.4 Maintenance
- Documentation technique complète
- Code commenté et standardisé
- Tests automatisés (>80% couverture)
- Plan de sauvegarde et restauration

## 5. Livrables

### 5.1 Documentation
- Spécifications fonctionnelles détaillées
- Documentation technique
- Guide administrateur
- Guide utilisateur
- Documentation API

### 5.2 Code et assets
- Code source complet avec commentaires
- Maquettes et assets graphiques
- Schémas de base de données
- Scripts de déploiement

### 5.3 Infrastructure
- Configuration des environnements (dev, staging, prod)
- Scripts de déploiement CI/CD
- Procédures de sauvegarde
- Procédures de monitoring 
# Guide Administrateur SiteAris

## Introduction

Ce guide est destiné aux administrateurs de la plateforme SiteAris. Il couvre l'ensemble des fonctionnalités du back-office administrateur, les procédures opérationnelles et les bonnes pratiques pour la gestion quotidienne de la plateforme.

## Accès au Back-Office

### Connexion à l'interface d'administration

1. Accédez à `https://sitearis.com/auth`
2. Saisissez vos identifiants administrateur
3. Après connexion, vous serez automatiquement redirigé vers `/admin`

> **Important** : Utilisez toujours une connexion sécurisée et ne partagez jamais vos identifiants.

### Rôles et Permissions

SiteAris dispose de quatre rôles utilisateur :

| Rôle | Description | Accès |
|------|-------------|-------|
| CLIENT | Utilisateur standard | Espace client uniquement |
| ADMIN | Administrateur | Accès complet au back-office |
| SUPPORT | Agent de support | Back-office limité (support, commandes) |
| TECHNICIAN | Technicien | Back-office limité (interventions) |

## Tableau de Bord Administrateur

Le tableau de bord présente une vue d'ensemble des performances et activités de la plateforme :

![Dashboard Admin](https://placeholder.com/admin-dashboard.png)

### Indicateurs Clés (KPI)

- **Chiffre d'affaires total** : Revenus cumulés de toutes les commandes
- **Commandes totales** : Nombre total de commandes
- **Clients** : Nombre total d'utilisateurs enregistrés
- **Interventions planifiées** : Nombre d'interventions à venir

### Graphiques et Statistiques

- **Évolution du chiffre d'affaires** : Graphique des 6 derniers mois
- **Répartition des commandes par statut** : Visualisation des différents statuts
- **Commandes récentes** : Liste des 5 dernières commandes
- **Utilisateurs récents** : Liste des 5 derniers utilisateurs inscrits

## Gestion des Services

### Accéder au Catalogue de Services

1. Dans le menu latéral, cliquez sur "Services"
2. La liste complète des services s'affiche avec options de filtrage et tri

### Ajouter un Nouveau Service

1. Cliquez sur le bouton "Nouveau service"
2. Remplissez le formulaire avec les informations suivantes :
   - **Nom** : Nom commercial du service
   - **Slug** : Identifiant URL (généré automatiquement, modifiable)
   - **Catégorie** : Sélectionnez dans la liste déroulante
   - **Description courte** : Résumé en 1-2 phrases
   - **Description complète** : Description détaillée (supporte le Markdown)
   - **Prix de base** : Prix HT en euros
   - **Durée estimée** : En minutes
   - **Niveau de complexité** : Simple, Intermédiaire, Complexe, Expert
   - **Tags** : Mots-clés pour le référencement
   - **Fonctionnalités** : Liste des points clés du service
3. Configurez les options du service (éléments personnalisables)
4. Cliquez sur "Enregistrer" pour créer le service en mode brouillon
5. Vérifiez l'aperçu et cliquez sur "Publier" pour rendre le service visible

### Modifier un Service Existant

1. Dans la liste des services, cliquez sur l'icône de modification
2. Effectuez les changements nécessaires
3. Cliquez sur "Enregistrer les modifications"

### Dupliquer un Service

1. Dans la liste des services, cliquez sur l'icône de duplication
2. Un nouveau formulaire pré-rempli s'ouvre
3. Modifiez les champs nécessaires
4. Cliquez sur "Enregistrer comme nouveau service"

### Gérer les Options de Service

Les options permettent aux clients de personnaliser le service :

1. Dans l'édition du service, accédez à la section "Options"
2. Pour chaque option, définissez :
   - **Nom** : Libellé de l'option
   - **Type** : Sélection, Nombre, Booléen, Plage
   - **Modificateur de prix** : Impact sur le prix
   - **Multiplicateur** : Si l'option multiplie le prix de base
   - **Valeurs disponibles** : Pour les options de type sélection

## Gestion des Commandes

### Vue d'Ensemble des Commandes

1. Dans le menu latéral, cliquez sur "Commandes"
2. Utilisez les filtres pour affiner la liste :
   - Par statut
   - Par période
   - Par montant
   - Par recherche (numéro de commande, client)

### Détail d'une Commande

Cliquez sur une commande pour accéder à sa vue détaillée :

- **Informations générales** : Numéro, date, montant, statut
- **Services commandés** : Liste des services avec options
- **Informations client** : Coordonnées, adresse
- **Chronologie** : Historique des statuts et actions
- **Documents** : Factures, devis, rapports
- **Interventions** : Planning des interventions liées

### Mettre à Jour le Statut d'une Commande

1. Dans la vue détaillée, cliquez sur "Modifier le statut"
2. Sélectionnez le nouveau statut dans la liste déroulante
3. Ajoutez un commentaire explicatif (optionnel mais recommandé)
4. Cliquez sur "Mettre à jour"

> **Note** : Le changement de statut génère automatiquement une notification au client.

### Générer une Facture

1. Dans la vue détaillée, cliquez sur "Générer une facture"
2. Vérifiez les informations pré-remplies
3. Ajustez si nécessaire (remises, commentaires)
4. Cliquez sur "Créer la facture"
5. La facture est automatiquement envoyée au client par email

## Planification des Interventions

### Calendrier des Interventions

1. Dans le menu latéral, cliquez sur "Planning"
2. Visualisez les interventions par jour, semaine ou mois
3. Filtrez par technicien ou statut

### Planifier une Nouvelle Intervention

1. Dans la vue détaillée d'une commande, cliquez sur "Planifier une intervention"
2. Sélectionnez :
   - **Date et heure** : Moment de l'intervention
   - **Durée estimée** : En heures
   - **Technicien** : Assignation à un membre de l'équipe
   - **Type d'intervention** : Installation, Maintenance, Support, etc.
   - **Instructions spécifiques** : Notes pour le technicien
3. Cliquez sur "Planifier"
4. Une notification est envoyée au client et au technicien

### Suivi des SLA (Accords de Niveau de Service)

Le tableau de bord SLA permet de suivre les performances des interventions :

1. Accédez à "Rapports" > "SLA Dashboard"
2. Visualisez :
   - **Temps de réponse moyen** : Délai entre commande et première intervention
   - **Temps de résolution moyen** : Délai total jusqu'à résolution
   - **Taux de respect des SLA** : Pourcentage d'interventions dans les délais
   - **Interventions en retard** : Liste des interventions hors SLA

## Support Client

### Gestion des Conversations

1. Dans le menu latéral, cliquez sur "Support"
2. Visualisez toutes les conversations actives
3. Filtrez par statut (Ouvert, En attente, Fermé)
4. Cliquez sur une conversation pour y répondre

### Répondre à un Client

1. Dans la conversation, tapez votre réponse dans le champ de texte
2. Utilisez les modèles de réponse prédéfinis si nécessaire
3. Joignez des fichiers si besoin
4. Cliquez sur "Envoyer"

### Clôturer une Conversation

1. Lorsque le problème est résolu, cliquez sur "Marquer comme résolu"
2. Ajoutez un commentaire de clôture
3. La conversation est archivée mais reste accessible dans l'historique

## Rapports et Analyses

### Rapports Standards

Accédez aux rapports prédéfinis via "Rapports" dans le menu latéral :

- **Rapport de ventes** : Chiffre d'affaires par période
- **Rapport de services** : Performance des services
- **Rapport clients** : Acquisition et rétention
- **Rapport d'interventions** : Efficacité opérationnelle

### Créer un Rapport Personnalisé

1. Dans "Rapports", cliquez sur "Nouveau rapport"
2. Sélectionnez la source de données (commandes, clients, services)
3. Choisissez les champs à inclure
4. Définissez les filtres et conditions
5. Sélectionnez le type de visualisation (tableau, graphique)
6. Cliquez sur "Générer" puis "Enregistrer" pour réutilisation future

### Exporter les Données

Pour chaque rapport :
1. Cliquez sur "Exporter"
2. Choisissez le format (CSV, Excel, PDF)
3. Configurez les options d'export
4. Cliquez sur "Télécharger"

## Gestion des Utilisateurs

### Créer un Compte Administrateur

1. Dans "Utilisateurs", cliquez sur "Ajouter un utilisateur"
2. Remplissez les informations de base
3. Sélectionnez le rôle "ADMIN"
4. Définissez un mot de passe temporaire ou envoyez un lien d'invitation
5. Cliquez sur "Créer"

### Modifier les Droits d'un Utilisateur

1. Recherchez l'utilisateur dans la liste
2. Cliquez sur "Modifier"
3. Changez le rôle selon les besoins
4. Cliquez sur "Enregistrer"

## Paramètres Système

### Configuration Générale

Dans "Paramètres" > "Général", configurez :
- Informations de l'entreprise
- Devise et taxes
- Options d'affichage
- Emails transactionnels

### Gestion des Emails Automatiques

1. Accédez à "Paramètres" > "Emails"
2. Pour chaque modèle d'email :
   - Modifiez l'objet et le contenu
   - Activez/désactivez l'envoi automatique
   - Testez l'envoi

### Logs Système

Pour diagnostiquer les problèmes :
1. Accédez à "Paramètres" > "Logs"
2. Filtrez par niveau (INFO, WARNING, ERROR)
3. Recherchez par date ou type d'événement

## Procédures d'Urgence

### Désactiver Temporairement la Plateforme

En cas d'incident majeur :
1. Accédez à "Paramètres" > "Maintenance"
2. Activez le "Mode Maintenance"
3. Personnalisez le message affiché aux utilisateurs
4. Cliquez sur "Appliquer"

### Contacts d'Escalade

| Niveau | Contact | Situation |
|--------|---------|-----------|
| N1 | support@sitearis.com | Problèmes courants |
| N2 | tech@sitearis.com | Problèmes techniques |
| N3 | urgence@sitearis.com | Incidents critiques |

## Bonnes Pratiques

### Sécurité

- Changez régulièrement votre mot de passe (tous les 90 jours)
- Utilisez l'authentification à deux facteurs
- Déconnectez-vous après chaque session
- Ne partagez jamais vos identifiants

### Gestion des Services

- Testez chaque nouveau service avant publication
- Vérifiez la cohérence des prix et descriptions
- Utilisez des images de haute qualité
- Maintenez à jour les informations techniques

### Support Client

- Répondez aux demandes dans un délai de 4 heures maximum
- Utilisez un ton professionnel et courtois
- Documentez toutes les interactions
- Faites remonter les problèmes récurrents 
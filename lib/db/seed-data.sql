-- Script pour peupler les tables du catalogue de services SiteAris
-- Données pour les services informatiques et cybersécurité

-- Insertion des catégories de services
INSERT INTO service_categories (name, description, slug, icon, color, sort_order)
VALUES
  ('Cybersécurité', 'Services de protection et d''audit de sécurité informatique', 'cybersecurite', 'security', '#e53935', 1),
  ('Informatique', 'Services de gestion et maintenance informatique', 'informatique', 'computer', '#1e88e5', 2),
  ('Maintenance', 'Services de maintenance préventive et corrective', 'maintenance', 'support', '#43a047', 3),
  ('Formation', 'Formations professionnelles en informatique et cybersécurité', 'formation', 'school', '#fb8c00', 4);

-- Insertion des services de cybersécurité
INSERT INTO services (
  category_id, name, slug, short_description, description, base_price, display_price, 
  estimated_duration, complexity_level, icon, features, is_featured
)
VALUES
  (
    (SELECT id FROM service_categories WHERE slug = 'cybersecurite'),
    'Audit de Sécurité Complet',
    'audit-securite-complet',
    'Évaluation approfondie de votre infrastructure avec rapport détaillé et recommandations',
    'Notre audit de sécurité complet analyse en profondeur votre infrastructure informatique pour identifier les vulnérabilités et proposer des solutions adaptées. Le rapport détaillé inclut une analyse des risques, des recommandations priorisées et un plan d''action personnalisé.',
    850.00,
    'À partir de 850€ HT',
    '2-3 semaines',
    'élevé',
    'security',
    ARRAY['Analyse complète de l''infrastructure', 'Tests d''intrusion', 'Évaluation des vulnérabilités', 'Rapport détaillé', 'Plan d''action personnalisé'],
    true
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'cybersecurite'),
    'Sécurisation Réseau Entreprise',
    'securisation-reseau-entreprise',
    'Protection complète de votre réseau avec firewall nouvelle génération et monitoring 24/7',
    'Notre service de sécurisation réseau entreprise inclut l''installation et la configuration d''un firewall nouvelle génération, la mise en place de règles de sécurité adaptées à votre activité, et un monitoring 24/7 pour détecter et bloquer les menaces en temps réel.',
    500.00,
    'À partir de 500€ HT + 150€/poste',
    '1 semaine',
    'moyen',
    'network',
    ARRAY['Firewall nouvelle génération', 'Configuration personnalisée', 'Monitoring 24/7', 'Alertes en temps réel', 'Mises à jour de sécurité'],
    true
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'cybersecurite'),
    'Test d''Intrusion',
    'test-intrusion',
    'Simulation d''attaque pour identifier les failles de sécurité exploitables',
    'Notre équipe de pentesters certifiés simule des attaques réelles pour identifier les vulnérabilités exploitables dans votre système. Ce service comprend des tests d''intrusion externes et internes, ainsi qu''un rapport détaillé des failles découvertes et des recommandations pour les corriger.',
    1200.00,
    'À partir de 1200€ HT',
    '1-2 semaines',
    'élevé',
    'security',
    ARRAY['Tests d''intrusion externes', 'Tests d''intrusion internes', 'Social engineering', 'Rapport détaillé', 'Recommandations de correction'],
    false
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'cybersecurite'),
    'Conformité RGPD',
    'conformite-rgpd',
    'Mise en conformité complète avec le Règlement Général sur la Protection des Données',
    'Notre service de mise en conformité RGPD comprend un audit initial, la mise en place des procédures nécessaires, la rédaction des documents légaux, et la formation de votre personnel. Nous vous accompagnons dans toutes les étapes pour assurer une conformité totale avec la réglementation.',
    1500.00,
    'À partir de 1500€ HT',
    '1-3 mois',
    'moyen',
    'verified',
    ARRAY['Audit de conformité', 'Registre des traitements', 'Politique de confidentialité', 'Formation du personnel', 'Accompagnement DPO'],
    false
  );

-- Insertion des services informatiques
INSERT INTO services (
  category_id, name, slug, short_description, description, base_price, display_price, 
  estimated_duration, complexity_level, icon, features, is_featured
)
VALUES
  (
    (SELECT id FROM service_categories WHERE slug = 'informatique'),
    'Amélioration Performance PC',
    'amelioration-performance-pc',
    'Optimisation complète de vos postes de travail pour une performance maximale',
    'Notre service d''amélioration de performance PC comprend un diagnostic complet, le nettoyage du système, l''optimisation des paramètres, la mise à jour des pilotes et logiciels, et des recommandations matérielles si nécessaire.',
    300.00,
    '300€ HT/poste',
    '1-2 jours',
    'faible',
    'speed',
    ARRAY['Diagnostic complet', 'Nettoyage système', 'Optimisation paramètres', 'Mise à jour logiciels', 'Recommandations matérielles'],
    false
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'informatique'),
    'Dépannage Informatique',
    'depannage-informatique',
    'Intervention rapide pour résoudre vos problèmes informatiques',
    'Notre service de dépannage informatique offre une intervention rapide pour diagnostiquer et résoudre vos problèmes techniques. Nos techniciens expérimentés peuvent intervenir à distance ou sur site selon vos besoins.',
    70.00,
    '70€ HT/heure',
    'Variable',
    'faible',
    'support',
    ARRAY['Diagnostic rapide', 'Intervention à distance ou sur site', 'Résolution des problèmes', 'Conseils préventifs', 'Suivi post-intervention'],
    false
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'informatique'),
    'Installation Infrastructure Serveur',
    'installation-infrastructure-serveur',
    'Mise en place complète de votre infrastructure serveur adaptée à vos besoins',
    'Notre service d''installation d''infrastructure serveur comprend l''analyse de vos besoins, la conception de l''architecture, l''installation et la configuration des serveurs, la mise en place des sauvegardes, et la formation de votre équipe.',
    3000.00,
    'À partir de 3000€ HT',
    '1-2 semaines',
    'élevé',
    'computer',
    ARRAY['Analyse des besoins', 'Conception architecture', 'Installation serveurs', 'Configuration réseau', 'Mise en place sauvegardes'],
    false
  );

-- Insertion des services de maintenance
INSERT INTO services (
  category_id, name, slug, short_description, description, base_price, display_price, 
  estimated_duration, complexity_level, icon, features, is_featured
)
VALUES
  (
    (SELECT id FROM service_categories WHERE slug = 'maintenance'),
    'Maintenance Informatique Préventive',
    'maintenance-informatique-preventive',
    'Contrat de maintenance régulière pour prévenir les pannes et optimiser performances',
    'Notre service de maintenance informatique préventive comprend des visites régulières, des vérifications systématiques, des mises à jour logicielles, des sauvegardes, et un support technique prioritaire pour assurer le bon fonctionnement de votre parc informatique.',
    15.00,
    '15€ HT/poste/mois',
    'Contrat annuel',
    'moyen',
    'support',
    ARRAY['Visites régulières', 'Vérifications systématiques', 'Mises à jour logicielles', 'Sauvegardes', 'Support technique prioritaire'],
    true
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'maintenance'),
    'Infogérance Complète',
    'infogerance-complete',
    'Gestion totale de votre parc informatique et support utilisateurs',
    'Notre service d''infogérance complète prend en charge l''ensemble de votre infrastructure informatique : maintenance préventive et corrective, gestion des sauvegardes, supervision réseau, assistance utilisateurs, et conseil stratégique.',
    25.00,
    'À partir de 25€ HT/poste/mois',
    'Contrat annuel',
    'élevé',
    'computer',
    ARRAY['Maintenance préventive et corrective', 'Gestion des sauvegardes', 'Supervision réseau', 'Assistance utilisateurs', 'Conseil stratégique'],
    false
  );

-- Insertion des services de formation
INSERT INTO services (
  category_id, name, slug, short_description, description, base_price, display_price, 
  estimated_duration, complexity_level, icon, features, is_featured
)
VALUES
  (
    (SELECT id FROM service_categories WHERE slug = 'formation'),
    'Formation Cybersécurité Utilisateurs',
    'formation-cybersecurite-utilisateurs',
    'Sensibilisation et formation de vos collaborateurs aux bonnes pratiques de sécurité',
    'Notre formation en cybersécurité pour utilisateurs sensibilise vos collaborateurs aux risques informatiques et leur enseigne les bonnes pratiques pour protéger les données de l''entreprise. La formation inclut des exercices pratiques et des simulations d''attaques.',
    810.00,
    '810€ HT/stagiaire',
    '2 jours',
    'faible',
    'school',
    ARRAY['Sensibilisation aux risques', 'Bonnes pratiques de sécurité', 'Gestion des mots de passe', 'Détection des tentatives de phishing', 'Exercices pratiques'],
    false
  ),
  (
    (SELECT id FROM service_categories WHERE slug = 'formation'),
    'Formation Administrateur Système',
    'formation-administrateur-systeme',
    'Formation avancée pour les administrateurs système et réseau',
    'Notre formation pour administrateurs système couvre les aspects avancés de la gestion des systèmes et réseaux, incluant la sécurisation des infrastructures, la gestion des incidents, et l''optimisation des performances.',
    970.00,
    '970€ HT/stagiaire',
    '3 jours',
    'élevé',
    'school',
    ARRAY['Sécurisation des infrastructures', 'Gestion des incidents', 'Optimisation des performances', 'Supervision et monitoring', 'Travaux pratiques'],
    false
  );

-- Insertion des options pour l'audit de sécurité
INSERT INTO service_options (
  service_id, option_name, option_type, price_modifier, price_multiplier,
  description, min_value, max_value, default_value, is_required, sort_order
)
VALUES
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Taille de l''infrastructure',
    'select',
    0.00,
    false,
    'Sélectionnez la taille de votre infrastructure',
    NULL,
    NULL,
    'moyenne',
    true,
    1
  ),
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Tests d''intrusion',
    'boolean',
    600.00,
    false,
    'Inclure des tests d''intrusion dans l''audit',
    NULL,
    NULL,
    'true',
    false,
    2
  ),
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Audit de code',
    'boolean',
    800.00,
    false,
    'Inclure un audit de code de vos applications',
    NULL,
    NULL,
    'false',
    false,
    3
  );

UPDATE service_options
SET available_values = '{"petite": "Petite (jusqu''à 10 postes)", "moyenne": "Moyenne (11-50 postes)", "grande": "Grande (51-200 postes)", "tres_grande": "Très grande (200+ postes)"}'::jsonb
WHERE option_name = 'Taille de l''infrastructure';

-- Insertion des options pour la sécurisation réseau
INSERT INTO service_options (
  service_id, option_name, option_type, price_modifier, price_multiplier,
  description, min_value, max_value, default_value, is_required, sort_order
)
VALUES
  (
    (SELECT id FROM services WHERE slug = 'securisation-reseau-entreprise'),
    'Nombre de postes',
    'number',
    150.00,
    true,
    'Nombre de postes à sécuriser',
    1,
    1000,
    '10',
    true,
    1
  ),
  (
    (SELECT id FROM services WHERE slug = 'securisation-reseau-entreprise'),
    'Firewall matériel',
    'select',
    0.00,
    false,
    'Niveau du firewall matériel',
    NULL,
    NULL,
    'standard',
    true,
    2
  ),
  (
    (SELECT id FROM services WHERE slug = 'securisation-reseau-entreprise'),
    'Monitoring avancé',
    'boolean',
    300.00,
    false,
    'Monitoring avancé avec alertes personnalisées',
    NULL,
    NULL,
    'false',
    false,
    3
  );

UPDATE service_options
SET available_values = '{"standard": "Standard (TPE/PME)", "avance": "Avancé (ETI)", "enterprise": "Enterprise (Grande entreprise)"}'::jsonb
WHERE option_name = 'Firewall matériel';

-- Insertion des options pour la maintenance
INSERT INTO service_options (
  service_id, option_name, option_type, price_modifier, price_multiplier,
  description, min_value, max_value, default_value, is_required, sort_order
)
VALUES
  (
    (SELECT id FROM services WHERE slug = 'maintenance-informatique-preventive'),
    'Nombre de postes',
    'number',
    15.00,
    true,
    'Nombre de postes à maintenir',
    5,
    1000,
    '10',
    true,
    1
  ),
  (
    (SELECT id FROM services WHERE slug = 'maintenance-informatique-preventive'),
    'Fréquence des visites',
    'select',
    0.00,
    false,
    'Fréquence des visites de maintenance',
    NULL,
    NULL,
    'mensuelle',
    true,
    2
  ),
  (
    (SELECT id FROM services WHERE slug = 'maintenance-informatique-preventive'),
    'Support téléphonique illimité',
    'boolean',
    5.00,
    true,
    'Accès illimité au support téléphonique',
    NULL,
    NULL,
    'true',
    false,
    3
  );

UPDATE service_options
SET available_values = '{"trimestrielle": "Trimestrielle", "mensuelle": "Mensuelle", "bimensuelle": "Bi-mensuelle"}'::jsonb
WHERE option_name = 'Fréquence des visites';

-- Insertion des règles de tarification pour l'audit de sécurité
INSERT INTO service_pricing (
  service_id, rule_name, rule_type, rule_value, conditions
)
VALUES
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Taille petite',
    'fixed',
    '850',
    '{"option_name": "Taille de l''infrastructure", "option_value": "petite"}'::jsonb
  ),
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Taille moyenne',
    'fixed',
    '2500',
    '{"option_name": "Taille de l''infrastructure", "option_value": "moyenne"}'::jsonb
  ),
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Taille grande',
    'fixed',
    '6000',
    '{"option_name": "Taille de l''infrastructure", "option_value": "grande"}'::jsonb
  ),
  (
    (SELECT id FROM services WHERE slug = 'audit-securite-complet'),
    'Taille très grande',
    'fixed',
    '17000',
    '{"option_name": "Taille de l''infrastructure", "option_value": "tres_grande"}'::jsonb
  );

-- Insertion des tags pour les services
INSERT INTO service_tags (name)
VALUES
  ('Sécurité'),
  ('Réseau'),
  ('Maintenance'),
  ('Formation'),
  ('RGPD'),
  ('Performance'),
  ('Serveur'),
  ('Support'),
  ('Audit'),
  ('Dépannage');

-- Association des tags aux services
INSERT INTO service_to_tags (service_id, tag_id)
VALUES
  ((SELECT id FROM services WHERE slug = 'audit-securite-complet'), (SELECT id FROM service_tags WHERE name = 'Sécurité')),
  ((SELECT id FROM services WHERE slug = 'audit-securite-complet'), (SELECT id FROM service_tags WHERE name = 'Audit')),
  ((SELECT id FROM services WHERE slug = 'securisation-reseau-entreprise'), (SELECT id FROM service_tags WHERE name = 'Sécurité')),
  ((SELECT id FROM services WHERE slug = 'securisation-reseau-entreprise'), (SELECT id FROM service_tags WHERE name = 'Réseau')),
  ((SELECT id FROM services WHERE slug = 'test-intrusion'), (SELECT id FROM service_tags WHERE name = 'Sécurité')),
  ((SELECT id FROM services WHERE slug = 'test-intrusion'), (SELECT id FROM service_tags WHERE name = 'Audit')),
  ((SELECT id FROM services WHERE slug = 'conformite-rgpd'), (SELECT id FROM service_tags WHERE name = 'RGPD')),
  ((SELECT id FROM services WHERE slug = 'conformite-rgpd'), (SELECT id FROM service_tags WHERE name = 'Sécurité')),
  ((SELECT id FROM services WHERE slug = 'amelioration-performance-pc'), (SELECT id FROM service_tags WHERE name = 'Performance')),
  ((SELECT id FROM services WHERE slug = 'amelioration-performance-pc'), (SELECT id FROM service_tags WHERE name = 'Maintenance')),
  ((SELECT id FROM services WHERE slug = 'depannage-informatique'), (SELECT id FROM service_tags WHERE name = 'Dépannage')),
  ((SELECT id FROM services WHERE slug = 'depannage-informatique'), (SELECT id FROM service_tags WHERE name = 'Support')),
  ((SELECT id FROM services WHERE slug = 'installation-infrastructure-serveur'), (SELECT id FROM service_tags WHERE name = 'Serveur')),
  ((SELECT id FROM services WHERE slug = 'installation-infrastructure-serveur'), (SELECT id FROM service_tags WHERE name = 'Réseau')),
  ((SELECT id FROM services WHERE slug = 'maintenance-informatique-preventive'), (SELECT id FROM service_tags WHERE name = 'Maintenance')),
  ((SELECT id FROM services WHERE slug = 'maintenance-informatique-preventive'), (SELECT id FROM service_tags WHERE name = 'Support')),
  ((SELECT id FROM services WHERE slug = 'infogerance-complete'), (SELECT id FROM service_tags WHERE name = 'Maintenance')),
  ((SELECT id FROM services WHERE slug = 'infogerance-complete'), (SELECT id FROM service_tags WHERE name = 'Support')),
  ((SELECT id FROM services WHERE slug = 'formation-cybersecurite-utilisateurs'), (SELECT id FROM service_tags WHERE name = 'Formation')),
  ((SELECT id FROM services WHERE slug = 'formation-cybersecurite-utilisateurs'), (SELECT id FROM service_tags WHERE name = 'Sécurité')),
  ((SELECT id FROM services WHERE slug = 'formation-administrateur-systeme'), (SELECT id FROM service_tags WHERE name = 'Formation')),
  ((SELECT id FROM services WHERE slug = 'formation-administrateur-systeme'), (SELECT id FROM service_tags WHERE name = 'Serveur'));

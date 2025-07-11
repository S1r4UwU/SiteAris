-- Types énumérés
CREATE TYPE user_role AS ENUM ('CLIENT', 'ADMIN', 'SUPPORT', 'TECHNICIAN');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID_DEPOSIT', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAYMENT_FAILED');
CREATE TYPE intervention_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE invoice_status AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');
CREATE TYPE notification_type AS ENUM ('ORDER_UPDATE', 'PAYMENT_REMINDER', 'INTERVENTION_SCHEDULED', 'DOCUMENT_AVAILABLE', 'SYSTEM_MESSAGE');
CREATE TYPE document_type AS ENUM ('INVOICE', 'QUOTE', 'REPORT', 'CONTRACT', 'CERTIFICATE');

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table utilisateurs (extension de la table auth.users de Supabase)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  role user_role NOT NULL DEFAULT 'CLIENT',
  stripe_customer_id TEXT,
  phone TEXT,
  address JSONB,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table préférences utilisateur
CREATE TABLE user_preferences (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour préférences utilisateur
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir et modifier leurs propres préférences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Les administrateurs peuvent tout voir" ON user_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Table historique de connexion
CREATE TABLE login_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);

-- RLS policy pour historique de connexion
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leur propre historique" ON login_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les administrateurs peuvent tout voir" ON login_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- RLS policy pour utilisateurs
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Les administrateurs peuvent tout voir" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Table paniers
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour paniers
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir et modifier leur propre panier" ON carts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Les administrateurs peuvent tout voir" ON carts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Table catégories de services
CREATE TABLE service_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT
);

-- Table services
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  display_price TEXT,
  category_id INTEGER REFERENCES service_categories(id),
  estimated_duration TEXT,
  complexity_level TEXT,
  is_featured BOOLEAN DEFAULT false,
  features TEXT[], 
  image_url TEXT,
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table tags pour services
CREATE TABLE service_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Table de liaison services-tags
CREATE TABLE service_to_tags (
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  tag_id INTEGER REFERENCES service_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (service_id, tag_id)
);

-- Options de services
CREATE TABLE service_options (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  option_name TEXT NOT NULL,
  option_type TEXT NOT NULL,
  description TEXT,
  price_modifier DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_multiplier BOOLEAN DEFAULT FALSE,
  min_value INTEGER,
  max_value INTEGER,
  default_value TEXT,
  available_values JSONB,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- Table commandes
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  customer_info JSONB NOT NULL,
  shipping_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_completion_date TIMESTAMP WITH TIME ZONE
);

-- RLS policy pour commandes
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres commandes" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Items de commande
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  service_id INTEGER REFERENCES services(id) NOT NULL,
  service_name TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  calculated_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  configuration JSONB,
  estimated_duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour items de commande
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres items de commande" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Événements de commande
CREATE TABLE order_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- RLS policy pour événements de commande
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir les événements de leurs commandes" ON order_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_events.order_id AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON order_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Interventions
CREATE TABLE interventions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  status intervention_status NOT NULL DEFAULT 'SCHEDULED',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  technician_id UUID REFERENCES users(id),
  report JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour interventions
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres interventions" ON interventions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items 
      JOIN orders ON orders.id = order_items.order_id 
      WHERE order_items.id = interventions.order_item_id AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Les techniciens peuvent modifier les interventions assignées" ON interventions
  FOR UPDATE USING (
    auth.uid() = technician_id OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON interventions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Factures
CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  is_deposit BOOLEAN DEFAULT FALSE,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'PENDING',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour factures
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres factures" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Table documents
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres documents" ON documents
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Table notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policy pour notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent marquer leurs notifications comme lues" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les administrateurs peuvent tout voir et modifier" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Fonction pour mise à jour automatique du timestamp updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour automatique
CREATE TRIGGER update_users_modified
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_services_modified
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_modified
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_carts_modified
BEFORE UPDATE ON carts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_interventions_modified
BEFORE UPDATE ON interventions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_invoices_modified
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_documents_modified
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_preferences_modified
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insert des données de test
-- Catégories
INSERT INTO service_categories (name, slug, description, icon, color) VALUES
('Audit de sécurité', 'audit-securite', 'Évaluation de la sécurité de votre infrastructure', 'shield-check', '#2563EB'),
('Services réseau', 'services-reseau', 'Configuration et sécurisation de votre réseau', 'network', '#10B981'),
('Maintenance informatique', 'maintenance-informatique', 'Support et maintenance de votre parc informatique', 'computer', '#F59E0B'),
('Formation', 'formation', 'Formations et sensibilisation à la cybersécurité', 'book-open', '#8B5CF6');

-- Tags
INSERT INTO service_tags (name, slug) VALUES
('Sécurité', 'securite'),
('Réseau', 'reseau'),
('Cloud', 'cloud'),
('Support', 'support'),
('Formation', 'formation'),
('Audit', 'audit');

-- Services
INSERT INTO services (name, slug, description, short_description, base_price, display_price, category_id, estimated_duration, complexity_level, is_featured, features, icon) VALUES
('Audit de Sécurité Complet', 'audit-securite-complet', 'Évaluation approfondie de votre infrastructure avec rapport détaillé et recommandations.', 'Évaluation complète de votre sécurité informatique', 1200.00, 'À partir de 1200€', 1, '2-3 semaines', 'élevé', true, ARRAY['Analyse complète des vulnérabilités', 'Tests d''intrusion', 'Revue de configuration', 'Rapport détaillé', 'Plan d''action'], 'shield'),
('Sécurisation Réseau Entreprise', 'securisation-reseau-entreprise', 'Protection complète de votre réseau avec firewall nouvelle génération et monitoring 24/7.', 'Protection complète de votre réseau d''entreprise', 850.00, 'À partir de 850€', 2, '1-2 semaines', 'moyen', true, ARRAY['Firewall nouvelle génération', 'Monitoring 24/7', 'Configuration VPN', 'Détection d''intrusion', 'Filtrage de contenu'], 'network'),
('Maintenance Informatique Préventive', 'maintenance-informatique-preventive', 'Contrat de maintenance régulière pour prévenir les pannes et optimiser performances.', 'Maintenance préventive de votre parc informatique', 350.00, 'À partir de 350€/mois', 3, 'Mensuel', 'faible', true, ARRAY['Maintenance préventive', 'Support technique', 'Mises à jour logicielles', 'Surveillance des systèmes', 'Rapport mensuel'], 'computer'),
('Formation Sensibilisation Phishing', 'formation-sensibilisation-phishing', 'Formation de vos collaborateurs à la détection des tentatives de phishing.', 'Sensibilisation à la détection des emails frauduleux', 600.00, '600€ par session', 4, '1 journée', 'moyen', false, ARRAY['Formation pratique', 'Exercices réels', 'Documentation complète', 'Évaluation post-formation', 'Certificat de participation'], 'mail');

-- Liaison services-tags
INSERT INTO service_to_tags (service_id, tag_id) VALUES
(1, 1), (1, 6), -- Audit de Sécurité: Sécurité, Audit
(2, 1), (2, 2), -- Sécurisation Réseau: Sécurité, Réseau
(3, 4), -- Maintenance: Support
(4, 1), (4, 5); -- Formation Phishing: Sécurité, Formation

-- Options des services
INSERT INTO service_options (service_id, option_name, option_type, description, price_modifier, price_multiplier, is_required, sort_order, default_value, available_values) VALUES
(1, 'Tests d''intrusion', 'boolean', 'Simulation d''attaques pour identifier les vulnérabilités', 500.00, false, false, 1, 'false', NULL),
(1, 'Analyse code source', 'boolean', 'Revue de sécurité du code des applications', 300.00, false, false, 2, 'false', NULL),
(1, 'Nombre de serveurs', 'number', 'Nombre de serveurs à auditer', 150.00, true, true, 3, '1', NULL),
(2, 'Nombre de postes', 'number', 'Nombre de postes à protéger', 0, false, true, 1, '5', NULL),
(2, 'Niveau de service SLA', 'select', 'Niveau de support et réactivité', 0, false, true, 2, 'standard', '{"standard":"Standard (72h)","business":"Business (48h)","premium":"Premium (24h/7j)"}'),
(2, 'Intervention urgente', 'boolean', 'Intervention prioritaire (+30%)', 0, false, false, 3, 'false', NULL),
(3, 'Nombre de postes', 'number', 'Nombre de postes à maintenir', 0, false, true, 1, '10', NULL),
(3, 'Intervention sur site', 'boolean', 'Inclut des interventions sur site', 150.00, false, false, 2, 'false', NULL),
(4, 'Nombre de participants', 'number', 'Nombre de personnes à former', 50.00, true, true, 1, '10', NULL),
(4, 'Support post-formation', 'boolean', 'Accès à un expert pendant 3 mois', 250.00, false, false, 2, 'false', NULL); 

-- Enrichissement des profils clients
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  acquisition_source TEXT,
  lifetime_value DECIMAL(10, 2) DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  company_size TEXT,
  industry TEXT,
  business_type TEXT,
  technical_level TEXT CHECK (technical_level IN ('NOVICE', 'INTERMEDIATE', 'EXPERT')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Segmentation client
CREATE TABLE customer_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  is_dynamic BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Association des clients aux segments
CREATE TABLE customer_segment_members (
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES customer_segments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (customer_id, segment_id)
);

-- SLA défini pour les types de services
CREATE TABLE service_sla_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  response_time_minutes INTEGER NOT NULL,
  resolution_time_minutes INTEGER NOT NULL,
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  business_hours_only BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tracking SLA sur les interventions
CREATE TABLE intervention_sla_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intervention_id UUID REFERENCES interventions(id) ON DELETE CASCADE,
  sla_definition_id UUID REFERENCES service_sla_definitions(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  target_response_time TIMESTAMP WITH TIME ZONE,
  actual_response_time TIMESTAMP WITH TIME ZONE,
  target_resolution_time TIMESTAMP WITH TIME ZONE,
  actual_resolution_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('PENDING', 'RESPONDED', 'RESOLVED', 'BREACHED')),
  breach_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Historique de communication client
CREATE TABLE customer_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('EMAIL', 'PHONE', 'CHAT', 'MEETING', 'OTHER')),
  subject TEXT,
  content TEXT,
  staff_id UUID REFERENCES auth.users(id),
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Définition des rapports personnalisés
CREATE TABLE report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  query_definition JSONB NOT NULL,
  chart_type TEXT CHECK (chart_type IN ('BAR', 'LINE', 'PIE', 'TABLE', 'CARD', 'CUSTOM')),
  permissions JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rapports générés et sauvegardés
CREATE TABLE saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  parameters JSONB,
  result_data JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Triggers pour les timestamps
CREATE TRIGGER update_customer_profiles_modified
BEFORE UPDATE ON customer_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_customer_segments_modified
BEFORE UPDATE ON customer_segments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_service_sla_definitions_modified
BEFORE UPDATE ON service_sla_definitions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_intervention_sla_tracking_modified
BEFORE UPDATE ON intervention_sla_tracking
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_report_templates_modified
BEFORE UPDATE ON report_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Création de fonctions pour calculer les métriques clients
CREATE OR REPLACE FUNCTION calculate_customer_lifetime_value()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_profiles
  SET lifetime_value = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM orders
    WHERE user_id = NEW.user_id AND status NOT IN ('CANCELLED', 'PAYMENT_FAILED')
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_ltv
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION calculate_customer_lifetime_value();

-- Fonction pour la mise à jour automatique des membres de segment
CREATE OR REPLACE FUNCTION update_dynamic_segments()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean existing dynamic segments for this customer
  DELETE FROM customer_segment_members
  WHERE customer_id = NEW.id
  AND segment_id IN (SELECT id FROM customer_segments WHERE is_dynamic = TRUE);
  
  -- Add to segments based on criteria
  INSERT INTO customer_segment_members (customer_id, segment_id)
  SELECT NEW.id, s.id
  FROM customer_segments s
  WHERE s.is_dynamic = TRUE
  AND EXISTS (
    -- Complex criteria logic would be implemented here
    -- This is a simplified placeholder
    SELECT 1
    FROM customer_profiles cp
    WHERE cp.id = NEW.id
    -- Example: if segment criteria specifies high value customers
    AND (s.criteria->>'min_lifetime_value')::numeric <= cp.lifetime_value
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_segment_customer
AFTER INSERT OR UPDATE ON customer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_dynamic_segments();

-- Fonction pour la vérification automatique des SLA
CREATE OR REPLACE FUNCTION check_sla_breaches()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE intervention_sla_tracking
  SET status = 'BREACHED',
      breach_reason = 'Automatic detection: SLA deadline passed'
  WHERE status IN ('PENDING', 'RESPONDED')
  AND (
    (target_response_time IS NOT NULL AND target_response_time < NOW() AND actual_response_time IS NULL)
    OR
    (target_resolution_time IS NOT NULL AND target_resolution_time < NOW() AND actual_resolution_time IS NULL)
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_sla_breaches_trigger
AFTER INSERT OR UPDATE ON intervention_sla_tracking
EXECUTE FUNCTION check_sla_breaches();

-- RLS Policies pour sécuriser les nouvelles tables
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_sla_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_sla_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

-- Policies pour les profils clients
CREATE POLICY "Users can view their own profile"
ON customer_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all customer profiles"
ON customer_profiles FOR SELECT
USING (auth.role() = 'ADMIN');

CREATE POLICY "Admins can update customer profiles"
ON customer_profiles FOR UPDATE
USING (auth.role() = 'ADMIN');

-- Policies pour les segments
CREATE POLICY "Admins can manage segments"
ON customer_segments FOR ALL
USING (auth.role() = 'ADMIN');

CREATE POLICY "Admins can manage segment membership"
ON customer_segment_members FOR ALL
USING (auth.role() = 'ADMIN');

-- Policies pour les SLA
CREATE POLICY "Admins and Support can view SLA definitions"
ON service_sla_definitions FOR SELECT
USING (auth.role() IN ('ADMIN', 'SUPPORT'));

CREATE POLICY "Admins can manage SLA definitions"
ON service_sla_definitions FOR ALL
USING (auth.role() = 'ADMIN');

CREATE POLICY "Admins and Support can view SLA tracking"
ON intervention_sla_tracking FOR SELECT
USING (auth.role() IN ('ADMIN', 'SUPPORT', 'TECHNICIAN'));

CREATE POLICY "Admins can manage SLA tracking"
ON intervention_sla_tracking FOR ALL
USING (auth.role() = 'ADMIN');

-- Policies pour les interactions clients
CREATE POLICY "Users can view their own interactions"
ON customer_interactions FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view customer interactions"
ON customer_interactions FOR SELECT
USING (auth.role() IN ('ADMIN', 'SUPPORT'));

CREATE POLICY "Staff can create customer interactions"
ON customer_interactions FOR INSERT
WITH CHECK (auth.role() IN ('ADMIN', 'SUPPORT'));

-- Policies pour les rapports
CREATE POLICY "Users can view public reports"
ON report_templates FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view their own reports"
ON report_templates FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage reports"
ON report_templates FOR ALL
USING (auth.role() = 'ADMIN');

CREATE POLICY "Users can view their saved reports"
ON saved_reports FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all saved reports"
ON saved_reports FOR SELECT
USING (auth.role() = 'ADMIN');

CREATE POLICY "Users can create saved reports"
ON saved_reports FOR INSERT
WITH CHECK (auth.uid() = created_by); 
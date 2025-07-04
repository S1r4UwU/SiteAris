-- Schéma pour le catalogue de services SiteAris
-- Tables: service_categories, services, service_options, service_pricing

-- Catégories de services
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Services principaux
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  display_price TEXT,
  estimated_duration TEXT,
  complexity_level TEXT CHECK (complexity_level IN ('faible', 'moyen', 'élevé')),
  icon TEXT,
  image_url TEXT,
  features TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Options configurables pour les services
CREATE TABLE IF NOT EXISTS service_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  option_name TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('number', 'select', 'boolean', 'range')),
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  price_multiplier BOOLEAN DEFAULT false,
  description TEXT,
  min_value INTEGER,
  max_value INTEGER,
  default_value TEXT,
  available_values JSONB,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Règles de tarification dynamique
CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('fixed', 'percentage', 'formula')),
  rule_value TEXT NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tags pour les services (pour la recherche et le filtrage)
CREATE TABLE IF NOT EXISTS service_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table de relation many-to-many entre services et tags
CREATE TABLE IF NOT EXISTS service_to_tags (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES service_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (service_id, tag_id)
);

-- Ajouter des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_services_category ON services (category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services (is_active);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services (is_featured);
CREATE INDEX IF NOT EXISTS idx_service_options_service ON service_options (service_id);

-- Triggers pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_categories_timestamp
BEFORE UPDATE ON service_categories
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_services_timestamp
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_service_options_timestamp
BEFORE UPDATE ON service_options
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_service_pricing_timestamp
BEFORE UPDATE ON service_pricing
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Enable Row Level Security (RLS)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_to_tags ENABLE ROW LEVEL SECURITY;

-- Créer des politiques RLS
-- Lecture publique pour les tables de services
CREATE POLICY "Allow public read access to service_categories" 
ON service_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access to services" 
ON services FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to service_options" 
ON service_options FOR SELECT USING (true);

CREATE POLICY "Allow public read access to service_tags" 
ON service_tags FOR SELECT USING (true);

CREATE POLICY "Allow public read access to service_to_tags" 
ON service_to_tags FOR SELECT USING (true);

-- Seuls les admins peuvent modifier les données
CREATE POLICY "Allow admin insert to service_categories"
ON service_categories FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Allow admin update to service_categories"
ON service_categories FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin delete from service_categories"
ON service_categories FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin insert to services"
ON services FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Allow admin update to services"
ON services FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin delete from services"
ON services FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin insert to service_options"
ON service_options FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Allow admin update to service_options"
ON service_options FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin delete from service_options"
ON service_options FOR DELETE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin insert to service_pricing"
ON service_pricing FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Allow admin update to service_pricing"
ON service_pricing FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Allow admin delete from service_pricing"
ON service_pricing FOR DELETE USING (auth.role() = 'admin');

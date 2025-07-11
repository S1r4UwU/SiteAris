# Documentation Technique SiteAris

## Architecture Globale

### Vue d'ensemble
SiteAris est une plateforme e-commerce B2B/B2C spécialisée dans la vente de services informatiques et cybersécurité, construite avec les technologies suivantes :

- **Frontend** : Next.js 14+ avec App Router
- **Backend** : API Routes Next.js + Supabase
- **Base de données** : PostgreSQL (via Supabase)
- **Authentification** : Supabase Auth
- **Paiements** : Stripe
- **Déploiement** : Vercel + Supabase Cloud

### Diagramme d'Architecture
```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│                 │     │               │     │                │
│  Client (Next)  │◄───►│  API Routes   │◄───►│  Supabase DB   │
│                 │     │               │     │                │
└────────┬────────┘     └───────┬───────┘     └────────────────┘
         │                      │                     ▲
         │                      │                     │
         │                      ▼                     │
         │             ┌───────────────┐              │
         └────────────►│  Supabase     │◄─────────────┘
                       │  Auth/Storage │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │    Stripe     │
                       │   Paiements   │
                       └───────────────┘
```

## Structure du Projet

### Organisation des Répertoires
```
SiteAris/
  ├── app/                   # App Router de Next.js
  │   ├── account/           # Espace client
  │   ├── admin/             # Back-office administrateur
  │   ├── api/               # API Routes
  │   ├── auth/              # Authentification
  │   ├── checkout/          # Tunnel d'achat
  │   ├── services/          # Catalogue de services
  │   └── panier/            # Panier d'achat
  ├── components/            # Composants React
  │   ├── account/           # Composants de l'espace client
  │   ├── admin/             # Composants du back-office
  │   ├── checkout/          # Composants du tunnel d'achat
  │   ├── services/          # Composants du catalogue
  │   └── ui/                # Composants UI réutilisables
  ├── lib/                   # Utilitaires et services
  │   ├── auth/              # Logique d'authentification
  │   ├── db/                # Schémas et migrations
  │   ├── store/             # État global (Zustand)
  │   ├── stripe/            # Intégration Stripe
  │   └── supabase/          # Client Supabase
  ├── public/                # Fichiers statiques
  ├── tests/                 # Tests automatisés
  │   ├── e2e/               # Tests end-to-end Playwright
  │   └── load/              # Tests de charge k6
  └── types/                 # Types TypeScript
```

## Composants Principaux

### 1. Authentification et Gestion des Utilisateurs

L'authentification est gérée par Supabase Auth, avec les rôles suivants :
- CLIENT : Utilisateurs standards
- ADMIN : Administrateurs avec accès complet
- SUPPORT : Équipe de support client
- TECHNICIAN : Techniciens d'intervention

#### Flux d'authentification
```typescript
// lib/hooks/use-auth.ts
export function useAuth() {
  // Gestion de l'état d'authentification
  const signIn = async (email: string, password: string) => {
    // Authentification via Supabase
  };
  
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    // Inscription via Supabase
  };
  
  // ...
}
```

### 2. Catalogue de Services

Le catalogue est construit avec des Server Components Next.js pour le rendu côté serveur et l'optimisation SEO.

#### Récupération des services
```typescript
// lib/supabase/server-services.ts
async getServices(filters: ServiceFilters): Promise<PaginatedResponse<Service>> {
  // Construction de la requête avec filtres
  let query = supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*),
      service_options(*),
      service_tags(tags(*))
    `);
  
  // Application des filtres
  if (filters.category) {
    query = query.eq('category.slug', filters.category);
  }
  
  // ...
}
```

### 3. Panier et Tunnel d'Achat

Le panier utilise Zustand pour la gestion d'état et est synchronisé avec Supabase pour la persistance.

#### Store du panier
```typescript
// lib/store/cart-store.ts
interface CartStore {
  items: CartItemConfig[];
  subtotal: number;
  tax: number;
  total: number;
  
  // Actions
  addItem: (item: Omit<CartItemConfig, 'totalPrice'>) => void;
  updateItem: (serviceId: string, updates: Partial<CartItemConfig>) => void;
  removeItem: (serviceId: string) => void;
  // ...
}
```

### 4. Intégration Stripe

Les paiements sont gérés via Stripe avec support pour les paiements partiels (acomptes) et complets.

#### Création d'intention de paiement
```typescript
// app/api/stripe/create-payment-intent/route.ts
export async function POST(req: Request) {
  // Récupération des données du panier
  const { cartItems, customerInfo } = await req.json();
  
  // Calcul du montant
  const amount = calculateAmount(cartItems);
  
  // Création de l'intention de paiement
  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency: 'eur',
    metadata: {
      orderId: orderId,
      // ...
    }
  });
  
  // ...
}
```

### 5. Gestion des Commandes

Les commandes sont stockées dans Supabase avec un système de statuts et d'événements.

#### Statuts des commandes
- PENDING : En attente de paiement
- PAID_DEPOSIT : Acompte payé
- PAID : Payé intégralement
- IN_PROGRESS : En cours de traitement
- COMPLETED : Terminée
- CANCELLED : Annulée

## Modèle de Données

### Schéma Principal

#### Users
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  role USER_ROLE NOT NULL DEFAULT 'CLIENT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Services
```sql
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL NOT NULL,
  display_price TEXT,
  category_id UUID REFERENCES service_categories,
  estimated_duration INTEGER,
  complexity_level TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  features JSONB,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders
```sql
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  status ORDER_STATUS NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL NOT NULL,
  deposit_amount DECIMAL,
  remaining_amount DECIMAL,
  paid_amount DECIMAL DEFAULT 0,
  payment_status TEXT NOT NULL,
  payment_method TEXT,
  customer_info JSONB NOT NULL,
  shipping_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Routes

### Structure des API

#### Services API
- `GET /api/services` : Liste des services avec filtrage
- `GET /api/services/[slug]` : Détails d'un service
- `GET /api/services/categories` : Liste des catégories

#### Orders API
- `POST /api/orders` : Création d'une commande
- `GET /api/orders` : Liste des commandes de l'utilisateur
- `PUT /api/admin/orders/[id]/status` : Mise à jour du statut d'une commande

#### Stripe API
- `POST /api/stripe/create-payment-intent` : Création d'une intention de paiement
- `POST /api/stripe/confirm-payment` : Confirmation d'un paiement
- `POST /api/stripe/webhooks` : Webhook pour les événements Stripe

## Sécurité

### Row Level Security (RLS)

Les politiques RLS Supabase assurent que les utilisateurs n'accèdent qu'à leurs propres données.

#### Exemple de politique RLS pour les commandes
```sql
-- Les utilisateurs ne peuvent voir que leurs propres commandes
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Les administrateurs peuvent voir toutes les commandes
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (auth.role() = 'ADMIN');
```

### Middleware d'Authentification

Le middleware Next.js vérifie l'authentification et les autorisations pour les routes protégées.

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Vérification de l'authentification
  const supabase = createMiddlewareClient({ req: request, res: NextResponse });
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirection si non authentifié
  if (!session && request.nextUrl.pathname.startsWith('/account')) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // Vérification des rôles pour l'admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session?.user.id)
      .single();
      
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }
  
  return NextResponse.next();
}
```

## Optimisations de Performance

### Stratégies de Rendu

- **ISR (Incremental Static Regeneration)** : Utilisé pour les pages de catalogue et fiches produits
- **SSR (Server-Side Rendering)** : Utilisé pour les pages personnalisées (compte client, admin)
- **CSR (Client-Side Rendering)** : Utilisé pour les composants interactifs (configurateur, panier)

### Exemple de configuration ISR
```typescript
// app/services/[slug]/page.tsx
export const revalidate = 3600; // Revalidation toutes les heures

export async function generateStaticParams() {
  // Pré-génération des pages de services les plus populaires
  const services = await getPopularServices();
  return services.map((service) => ({
    slug: service.slug,
  }));
}
```

## Tests

### Tests E2E avec Playwright

```typescript
// tests/e2e/checkout.spec.ts
test('complete checkout flow', async ({ page }) => {
  // Connexion
  await page.goto('/auth');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Ajout au panier
  await page.goto('/services/audit-securite');
  await page.click('button:has-text("Ajouter au panier")');
  
  // Passage en caisse
  await page.click('[data-testid="cart-checkout"]');
  
  // Vérification du processus de paiement
  await expect(page).toHaveURL(/\/checkout/);
});
```

### Tests de Charge avec k6

```javascript
// tests/load/basic-load.js
export default function() {
  const res = http.get('https://sitearis.com/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loads in less than 2s': (r) => r.timings.duration < 2000
  });
  
  // Simulation de navigation
  http.get('https://sitearis.com/services');
  sleep(2);
  http.get('https://sitearis.com/services/audit-securite');
}
```

## Monitoring et Alertes

### Intégration Sentry

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // Configuration Next.js
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "sitearis",
  project: "sitearis-frontend",
});
```

### Métriques de Performance

Les métriques Core Web Vitals sont suivies via Vercel Analytics et Lighthouse :

- **LCP (Largest Contentful Paint)** : < 2.5s
- **FID (First Input Delay)** : < 100ms
- **CLS (Cumulative Layout Shift)** : < 0.1

## Conformité RGPD

### Consentement aux Cookies

Le site utilise un système de consentement aux cookies conforme au RGPD.

### Politique de Rétention des Données

Les données utilisateurs sont conservées selon les règles suivantes :
- Données de compte : Jusqu'à suppression du compte
- Historique des commandes : 10 ans (obligation légale)
- Logs de connexion : 1 an

### Droit à l'Oubli

Un processus automatisé permet de supprimer toutes les données d'un utilisateur sur demande.

## Procédures de Maintenance

### Mises à Jour de Sécurité

Les dépendances sont régulièrement mises à jour via le pipeline CI/CD avec :
```bash
npm audit fix
```

### Sauvegardes de Base de Données

Des sauvegardes quotidiennes sont configurées dans Supabase avec une rétention de 30 jours.

### Monitoring des Performances

Un script automatisé exécute des tests Lighthouse quotidiens et alerte en cas de régression. 
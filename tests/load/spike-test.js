import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const pageLoadedCounter = new Counter('page_loaded');
const pageLoadedRate = new Rate('page_loaded_rate');
const pageLoadDuration = new Trend('page_load_duration');
const errorRate = new Rate('error_rate');
const successfulCheckouts = new Counter('successful_checkouts');

// Options de test de pic (spike)
export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Démarrage avec 10 utilisateurs
    { duration: '1m', target: 10 },    // Maintien à 10 utilisateurs
    { duration: '30s', target: 500 },  // Pic à 500 utilisateurs en 30 secondes
    { duration: '1m', target: 500 },   // Maintien du pic pendant 1 minute
    { duration: '30s', target: 10 },   // Retour à 10 utilisateurs
    { duration: '1m', target: 10 },    // Maintien à 10 utilisateurs
    { duration: '30s', target: 0 },    // Fin du test
  ],
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% des requêtes doivent être inférieures à 3s
    http_req_failed: ['rate<0.1'],     // Moins de 10% d'erreurs
    'error_rate': ['rate<0.1'],        // Taux d'erreur global inférieur à 10%
  },
};

// Fonction principale exécutée pour chaque utilisateur virtuel
export default function () {
  // Simuler un scénario d'achat complet
  
  // 1. Visiter la page d'accueil
  let homeResponse = http.get('http://localhost:3000/');
  let homeSuccess = check(homeResponse, {
    'page d\'accueil chargée': (r) => r.status === 200,
  });
  errorRate.add(!homeSuccess);
  pageLoadedRate.add(homeSuccess);
  pageLoadDuration.add(homeResponse.timings.duration);
  sleep(Math.random() * 2);

  // 2. Visiter la page des services
  let servicesResponse = http.get('http://localhost:3000/services');
  let servicesSuccess = check(servicesResponse, {
    'page des services chargée': (r) => r.status === 200,
  });
  errorRate.add(!servicesSuccess);
  sleep(Math.random() * 2);

  // 3. Visiter un service spécifique (audit de sécurité)
  let serviceDetailResponse = http.get('http://localhost:3000/services/audit-securite');
  let serviceDetailSuccess = check(serviceDetailResponse, {
    'page détail service chargée': (r) => r.status === 200,
  });
  errorRate.add(!serviceDetailSuccess);
  sleep(Math.random() * 2);

  // 4. Ajouter au panier (simulation d'une requête POST)
  let addToCartPayload = JSON.stringify({
    serviceId: 'audit-securite',
    quantity: 1,
    options: [
      { id: 'postes', value: 5 },
      { id: 'urgence', value: true }
    ]
  });
  
  let addToCartResponse = http.post('http://localhost:3000/api/orders', addToCartPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  let addToCartSuccess = check(addToCartResponse, {
    'ajout au panier réussi': (r) => r.status === 200 || r.status === 201,
  });
  errorRate.add(!addToCartSuccess);
  sleep(Math.random() * 2);

  // 5. Accéder au panier
  let cartResponse = http.get('http://localhost:3000/panier');
  let cartSuccess = check(cartResponse, {
    'page panier chargée': (r) => r.status === 200,
  });
  errorRate.add(!cartSuccess);
  sleep(Math.random() * 2);

  // 6. Simuler le début du checkout
  let checkoutResponse = http.get('http://localhost:3000/checkout');
  let checkoutSuccess = check(checkoutResponse, {
    'page checkout chargée': (r) => r.status === 200,
  });
  errorRate.add(!checkoutSuccess);
  
  // Si toutes les étapes ont réussi, compter comme un checkout réussi
  if (homeSuccess && servicesSuccess && serviceDetailSuccess && 
      addToCartSuccess && cartSuccess && checkoutSuccess) {
    successfulCheckouts.add(1);
  }
  
  sleep(Math.random() * 3 + 1);
} 
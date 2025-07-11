import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const pageLoadedCounter = new Counter('page_loaded');
const pageLoadedRate = new Rate('page_loaded_rate');
const pageLoadDuration = new Trend('page_load_duration');
const apiResponseTime = new Trend('api_response_time');

// Options de test de stress
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Augmentation progressive à 100 utilisateurs sur 2 minutes
    { duration: '5m', target: 100 }, // Maintien de 100 utilisateurs pendant 5 minutes
    { duration: '2m', target: 200 }, // Augmentation à 200 utilisateurs sur 2 minutes
    { duration: '5m', target: 200 }, // Maintien de 200 utilisateurs pendant 5 minutes
    { duration: '2m', target: 300 }, // Augmentation à 300 utilisateurs sur 2 minutes
    { duration: '5m', target: 300 }, // Maintien de 300 utilisateurs pendant 5 minutes
    { duration: '2m', target: 400 }, // Augmentation à 400 utilisateurs sur 2 minutes
    { duration: '5m', target: 400 }, // Maintien de 400 utilisateurs pendant 5 minutes
    { duration: '10m', target: 0 }, // Diminution progressive à 0 utilisateur sur 10 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% des requêtes doivent être inférieures à 1s
    http_req_failed: ['rate<0.05'], // Moins de 5% d'erreurs
    'page_loaded_rate': ['rate>0.9'], // 90% des pages doivent être chargées avec succès
    'api_response_time': ['p(95)<500'], // 95% des réponses API en moins de 500ms
  },
};

// Fonction principale exécutée pour chaque utilisateur virtuel
export default function () {
  // Test de la page d'accueil
  let homeResponse = http.get('http://localhost:3000/');
  check(homeResponse, {
    'page d\'accueil chargée': (r) => r.status === 200,
  });
  pageLoadedCounter.add(1);
  pageLoadedRate.add(homeResponse.status === 200);
  pageLoadDuration.add(homeResponse.timings.duration);
  sleep(Math.random() * 3 + 1); // Pause aléatoire entre 1 et 4 secondes

  // Test de la page des services
  let servicesResponse = http.get('http://localhost:3000/services');
  check(servicesResponse, {
    'page des services chargée': (r) => r.status === 200,
  });
  pageLoadedCounter.add(1);
  pageLoadedRate.add(servicesResponse.status === 200);
  pageLoadDuration.add(servicesResponse.timings.duration);
  sleep(Math.random() * 3 + 1);

  // Test de l'API des services avec filtres (charge plus importante)
  let apiResponse = http.get('http://localhost:3000/api/services?category=securite&minPrice=100&maxPrice=1000');
  check(apiResponse, {
    'API des services répond': (r) => r.status === 200,
  });
  apiResponseTime.add(apiResponse.timings.duration);
  sleep(Math.random() * 2 + 1);

  // Test de l'API des métriques (endpoint potentiellement coûteux)
  let metricsResponse = http.get('http://localhost:3000/api/metrics/performance');
  check(metricsResponse, {
    'API des métriques répond': (r) => r.status === 200,
  });
  apiResponseTime.add(metricsResponse.timings.duration);
  sleep(Math.random() * 2 + 1);

  // Simuler une recherche (opération potentiellement coûteuse)
  let searchResponse = http.get('http://localhost:3000/api/services?search=securite');
  check(searchResponse, {
    'API de recherche répond': (r) => r.status === 200,
  });
  apiResponseTime.add(searchResponse.timings.duration);
  sleep(Math.random() * 2 + 1);
} 
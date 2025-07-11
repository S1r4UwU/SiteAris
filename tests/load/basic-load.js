import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const pageLoadedCounter = new Counter('page_loaded');
const pageLoadedRate = new Rate('page_loaded_rate');
const pageLoadDuration = new Trend('page_load_duration');

// Options de test
export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Augmentation progressive à 50 utilisateurs sur 1 minute
    { duration: '3m', target: 50 }, // Maintien de 50 utilisateurs pendant 3 minutes
    { duration: '1m', target: 100 }, // Augmentation à 100 utilisateurs sur 1 minute
    { duration: '3m', target: 100 }, // Maintien de 100 utilisateurs pendant 3 minutes
    { duration: '1m', target: 0 }, // Diminution à 0 utilisateurs sur 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent être inférieures à 500ms
    http_req_failed: ['rate<0.01'], // Moins de 1% d'erreurs
    'page_loaded_rate': ['rate>0.95'], // 95% des pages doivent être chargées avec succès
  },
};

// Fonction principale exécutée pour chaque utilisateur virtuel
export default function () {
  // Test de la page d'accueil
  let homeResponse = http.get('http://localhost:3000/');
  check(homeResponse, {
    'page d\'accueil chargée': (r) => r.status === 200,
    'contient le titre': (r) => r.body.includes('SiteAris'),
  });
  pageLoadedCounter.add(1);
  pageLoadedRate.add(homeResponse.status === 200);
  pageLoadDuration.add(homeResponse.timings.duration);
  sleep(1);

  // Test de la page des services
  let servicesResponse = http.get('http://localhost:3000/services');
  check(servicesResponse, {
    'page des services chargée': (r) => r.status === 200,
    'contient la liste des services': (r) => r.body.includes('services'),
  });
  pageLoadedCounter.add(1);
  pageLoadedRate.add(servicesResponse.status === 200);
  pageLoadDuration.add(servicesResponse.timings.duration);
  sleep(1);

  // Test de l'API des services
  let apiResponse = http.get('http://localhost:3000/api/services');
  check(apiResponse, {
    'API des services répond': (r) => r.status === 200,
    'API renvoie du JSON valide': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });
  sleep(1);

  // Test de l'API des catégories
  let categoriesResponse = http.get('http://localhost:3000/api/services/categories');
  check(categoriesResponse, {
    'API des catégories répond': (r) => r.status === 200,
  });
  sleep(1);
} 
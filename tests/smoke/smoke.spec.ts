import { test, expect } from '@playwright/test';

/**
 * Tests de smoke pour vérifier les fonctionnalités critiques après déploiement
 * Ces tests sont exécutés après chaque déploiement en production
 */

// URL de base pour les tests
const baseUrl = process.env.SITE_URL || 'https://sitearis.com';

test.describe('Tests de smoke post-déploiement', () => {
  test.beforeEach(async ({ page }) => {
    // Définir un timeout plus long pour les tests de smoke
    test.setTimeout(60000);
  });

  test('Page d\'accueil chargée correctement', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Vérifier que la page est chargée
    await expect(page).toHaveTitle(/SiteAris/);
    
    // Vérifier les éléments critiques
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Vérifier que les services sont affichés
    await expect(page.locator('h2:has-text("Nos services")')).toBeVisible();
    
    // Vérifier que le panier est accessible
    await expect(page.locator('button:has-text("Panier")')).toBeVisible();
  });

  test('Catalogue de services accessible', async ({ page }) => {
    await page.goto(`${baseUrl}/services`);
    
    // Vérifier que la page est chargée
    await expect(page).toHaveTitle(/Services/);
    
    // Vérifier que les filtres sont présents
    await expect(page.locator('text=Filtrer par')).toBeVisible();
    
    // Vérifier qu'au moins un service est affiché
    const serviceCards = page.locator('.service-card');
    await expect(serviceCards).toHaveCount({ min: 1 });
    
    // Vérifier que les services ont des titres et des prix
    await expect(serviceCards.first().locator('h3')).toBeVisible();
    await expect(serviceCards.first().locator('text=/€/')).toBeVisible();
  });

  test('Détail d\'un service accessible', async ({ page }) => {
    // Aller à la page catalogue
    await page.goto(`${baseUrl}/services`);
    
    // Cliquer sur le premier service
    await page.locator('.service-card').first().click();
    
    // Vérifier que la page détail est chargée
    await expect(page.locator('button:has-text("Ajouter au panier")')).toBeVisible();
    
    // Vérifier que les détails du service sont affichés
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=/€/')).toBeVisible();
    await expect(page.locator('.service-description')).toBeVisible();
  });

  test('Ajout au panier fonctionnel', async ({ page }) => {
    // Aller à la page détail d'un service
    await page.goto(`${baseUrl}/services`);
    await page.locator('.service-card').first().click();
    
    // Ajouter au panier
    await page.locator('button:has-text("Ajouter au panier")').click();
    
    // Vérifier que le panier est mis à jour
    await expect(page.locator('text=Ajouté au panier')).toBeVisible({ timeout: 5000 });
    
    // Ouvrir le panier
    await page.locator('button:has-text("Panier")').click();
    
    // Vérifier que le service est dans le panier
    await expect(page.locator('.cart-item')).toHaveCount({ min: 1 });
  });

  test('Authentification accessible', async ({ page }) => {
    await page.goto(`${baseUrl}/auth`);
    
    // Vérifier que la page est chargée
    await expect(page).toHaveTitle(/Connexion/);
    
    // Vérifier que le formulaire est présent
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Se connecter")')).toBeVisible();
    
    // Vérifier que l'option d'inscription est présente
    await expect(page.locator('text=Créer un compte')).toBeVisible();
  });

  test('API services fonctionnelle', async ({ request }) => {
    // Tester l'API de services
    const response = await request.get(`${baseUrl}/api/services`);
    
    // Vérifier que la réponse est valide
    expect(response.ok()).toBeTruthy();
    
    // Vérifier que la réponse contient des données
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    
    // Vérifier la structure des données
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('price');
  });

  test('API catégories fonctionnelle', async ({ request }) => {
    // Tester l'API de catégories
    const response = await request.get(`${baseUrl}/api/services/categories`);
    
    // Vérifier que la réponse est valide
    expect(response.ok()).toBeTruthy();
    
    // Vérifier que la réponse contient des données
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    
    // Vérifier la structure des données
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
  });

  test('Page checkout accessible', async ({ page }) => {
    // Aller directement à la page checkout
    // Note: Dans un test complet, on passerait par l'ajout au panier
    await page.goto(`${baseUrl}/checkout`);
    
    // Vérifier que la page est chargée
    await expect(page).toHaveTitle(/Checkout/);
    
    // Vérifier que les étapes sont affichées
    await expect(page.locator('.checkout-stepper')).toBeVisible();
  });
  
  test('Statut HTTP 200 pour les pages principales', async ({ request }) => {
    // Liste des pages principales à vérifier
    const pagesToCheck = [
      '/',
      '/services',
      '/auth',
      '/panier',
      '/checkout'
    ];
    
    // Vérifier chaque page
    for (const path of pagesToCheck) {
      const response = await request.get(`${baseUrl}${path}`);
      expect(response.status()).toBe(200);
    }
  });
}); 
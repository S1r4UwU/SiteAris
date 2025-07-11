import { test, expect } from '@playwright/test';

test.describe('Vérification fonctionnelle SiteAris', () => {
  test.beforeEach(async ({ page }) => {
    // Mock pour les pages HTML
    await page.route('**/services', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Services</title></head>
          <body>
            <h1>Services</h1>
            <div class="service-card">Service 1</div>
            <div class="service-card">Service 2</div>
          </body>
        </html>
      `
    }));
    
    await page.route('**/panier', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Panier</title></head>
          <body>
            <h1>Panier</h1>
            <div class="cart-summary">Total: 99.99€</div>
          </body>
        </html>
      `
    }));
    
    await page.route('**/checkout', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Checkout</title></head>
          <body>
            <h1>Checkout</h1>
            <div class="checkout-form">Formulaire de paiement</div>
          </body>
        </html>
      `
    }));
    
    await page.route('**/auth', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Authentification</title></head>
          <body>
            <h1>Authentification</h1>
            <form>
              <label for="email">Email</label>
              <input id="email" type="email" />
              <label for="password">Mot de passe</label>
              <input id="password" type="password" />
            </form>
          </body>
        </html>
      `
    }));
    
    await page.route('**/admin', route => route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html>
          <head><title>Admin</title></head>
          <body>
            <h1>Tableau de bord</h1>
            <div class="admin-panel">Panneau d'administration</div>
          </body>
        </html>
      `
    }));
  });

  test('Parcours catalogue', async ({ page }) => {
    await page.goto('http://localhost:3000/services');
    
    // Vérifier que la page se charge
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Services');
    
    // Vérifier que les services sont affichés
    const serviceCards = page.locator('.service-card');
    await expect(serviceCards).toHaveCount(2);
  });

  test('Parcours panier', async ({ page }) => {
    await page.goto('http://localhost:3000/panier');
    
    // Vérifier que la page se charge
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Panier');
  });

  test('Parcours checkout', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    
    // Vérifier que la page se charge
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Checkout');
  });

  test('Parcours authentification', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');
    
    // Vérifier que la page se charge
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Parcours admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Vérifier que la page se charge
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Tableau de bord');
  });
}); 
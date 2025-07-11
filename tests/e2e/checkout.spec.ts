import { test, expect } from '@playwright/test';

test.describe("Parcours d'achat", () => {
  test.beforeEach(async ({ page }) => {
    // Visiter la page d'accueil
    await page.goto('/');
  });

  test('Parcours d\'achat complet d\'un service', async ({ page }) => {
    // 1. Accéder au catalogue de services
    await page.getByRole('link', { name: /services/i }).click();
    await expect(page.url()).toContain('/services');
    
    // 2. Sélectionner un service
    await page.getByText('Audit de sécurité', { exact: false }).first().click();
    await expect(page.url()).toContain('/services/');
    
    // 3. Configurer le service
    const serviceName = await page.locator('h1').textContent();
    await page.getByLabel('Nombre de postes').fill('5');
    await page.getByLabel('SLA').selectOption('standard');
    await page.getByRole('button', { name: /ajouter au panier/i }).click();
    
    // 4. Vérifier que le service est ajouté au panier
    await expect(page.getByText(/ajouté au panier/i)).toBeVisible();
    await page.getByRole('link', { name: /panier/i }).click();
    await expect(page.url()).toContain('/panier');
    await expect(page.getByText(serviceName)).toBeVisible();
    
    // 5. Procéder au paiement
    await page.getByRole('button', { name: /commander/i }).click();
    await expect(page.url()).toContain('/checkout');
    
    // 6. Remplir les informations client
    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Nom').fill('Utilisateur');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Téléphone').fill('0612345678');
    await page.getByLabel('Adresse').fill('123 Rue de Test');
    await page.getByLabel('Code postal').fill('75001');
    await page.getByLabel('Ville').fill('Paris');
    await page.getByLabel('Pays').selectOption('France');
    await page.getByRole('button', { name: /continuer/i }).click();
    
    // 7. Simuler le paiement Stripe (dans un environnement de test)
    await expect(page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('[placeholder="Numéro de carte"]')).toBeVisible();
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('[placeholder="Numéro de carte"]').fill('4242424242424242');
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('[placeholder="MM / AA"]').fill('1230');
    await page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('[placeholder="CVC"]').fill('123');
    await page.getByRole('button', { name: /payer/i }).click();
    
    // 8. Vérifier la confirmation de commande
    await expect(page.url()).toContain('/checkout/confirmation');
    await expect(page.getByText(/commande confirmée/i)).toBeVisible();
    await expect(page.getByText(/merci pour votre commande/i)).toBeVisible();
  });
  
  test('Ajout et suppression d\'un article du panier', async ({ page }) => {
    // 1. Accéder au catalogue de services
    await page.getByRole('link', { name: /services/i }).click();
    
    // 2. Ajouter un service au panier
    await page.getByText('Maintenance informatique', { exact: false }).first().click();
    await page.getByRole('button', { name: /ajouter au panier/i }).click();
    
    // 3. Vérifier que le service est dans le panier
    await page.getByRole('link', { name: /panier/i }).click();
    await expect(page.getByText('Maintenance informatique', { exact: false })).toBeVisible();
    
    // 4. Supprimer l'article du panier
    await page.getByRole('button', { name: /supprimer/i }).click();
    
    // 5. Vérifier que le panier est vide
    await expect(page.getByText(/votre panier est vide/i)).toBeVisible();
  });
}); 
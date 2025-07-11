import { test, expect } from '@playwright/test';

test.describe("Tableau de bord administrateur", () => {
  // Authentification administrateur avant chaque test
  test.beforeEach(async ({ page }) => {
    // Accéder à la page d'authentification
    await page.goto('/auth');
    
    // Se connecter en tant qu'administrateur
    await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || 'admin@sitearis.com');
    await page.getByLabel('Mot de passe').fill(process.env.ADMIN_PASSWORD || 'admin123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    // Vérifier la redirection vers le dashboard admin
    await expect(page.url()).toContain('/admin');
  });

  test('Affiche le tableau de bord avec les KPIs', async ({ page }) => {
    // Vérifier la présence des éléments du dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard Administrateur' })).toBeVisible();
    await expect(page.getByText('Chiffre d\'affaires total')).toBeVisible();
    await expect(page.getByText('Commandes totales')).toBeVisible();
    await expect(page.getByText('Clients')).toBeVisible();
    await expect(page.getByText('Interventions planifiées')).toBeVisible();
  });

  test('Navigation dans les sections administratives', async ({ page }) => {
    // Tester la navigation vers les différentes sections
    await page.getByRole('link', { name: 'Services' }).click();
    await expect(page.url()).toContain('/admin/services');
    await expect(page.getByRole('heading', { name: 'Gestion des Services' })).toBeVisible();
    
    await page.getByRole('link', { name: 'Commandes' }).click();
    await expect(page.url()).toContain('/admin/orders');
    await expect(page.getByRole('heading', { name: 'Gestion des Commandes' })).toBeVisible();
    
    await page.getByRole('link', { name: 'Utilisateurs' }).click();
    await expect(page.url()).toContain('/admin/users');
    
    await page.getByRole('link', { name: 'Statistiques' }).click();
    await expect(page.url()).toContain('/admin/stats');
  });

  test('Gestion des commandes', async ({ page }) => {
    // Accéder à la gestion des commandes
    await page.getByRole('link', { name: 'Commandes' }).click();
    
    // Filtrer les commandes
    await page.getByPlaceholder('Rechercher par ID, email ou nom client...').fill('test');
    await page.getByRole('button', { name: 'Filtrer' }).click();
    
    // Visualiser une commande (si disponible)
    const viewButton = page.getByRole('link', { name: 'Voir' }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.getByText('Détails de la commande')).toBeVisible();
      
      // Tester la mise à jour du statut
      await page.getByRole('combobox').selectOption('COMPLETED');
      await page.getByLabel('Notes').fill('Commande complétée avec succès');
      await page.getByRole('button', { name: 'Mettre à jour' }).click();
      await expect(page.getByText('Statut mis à jour')).toBeVisible();
    }
  });

  test('Gestion des services', async ({ page }) => {
    // Accéder à la gestion des services
    await page.getByRole('link', { name: 'Services' }).click();
    
    // Créer un nouveau service
    await page.getByRole('link', { name: 'Nouveau service' }).click();
    await expect(page.url()).toContain('/admin/services/create');
    
    // Remplir le formulaire de création de service
    await page.getByLabel('Nom').fill('Service de test E2E');
    await page.getByLabel('Slug').fill('service-test-e2e');
    await page.getByLabel('Description courte').fill('Description courte pour le test E2E');
    await page.getByLabel('Description complète').fill('Description complète pour le test E2E');
    await page.getByLabel('Prix de base').fill('199.99');
    await page.getByLabel('Catégorie').selectOption({ index: 1 });
    
    // Enregistrer le service
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    
    // Vérifier la redirection et le message de succès
    await expect(page.getByText('Service créé avec succès')).toBeVisible();
  });

  test('Déconnexion', async ({ page }) => {
    // Tester la déconnexion
    await page.getByRole('button', { name: 'Déconnexion' }).click();
    
    // Vérifier la redirection vers la page d'authentification
    await expect(page.url()).toContain('/auth');
  });
}); 
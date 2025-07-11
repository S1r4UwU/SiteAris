import { test, expect } from '@playwright/test';

test.describe("Parcours d'authentification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('Affiche le formulaire d\'authentification', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('Affiche des erreurs pour champs vides', async ({ page }) => {
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('L\'email est requis')).toBeVisible();
    await expect(page.getByText('Le mot de passe est requis')).toBeVisible();
  });

  test('Affiche erreur pour identifiants invalides', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    
    await expect(page.getByText(/identifiants invalides|incorrect/i)).toBeVisible();
  });

  test('Permet de basculer vers l\'inscription', async ({ page }) => {
    await page.getByRole('button', { name: 'Créer un compte' }).click();
    await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible();
    await expect(page.getByLabel('Prénom')).toBeVisible();
    await expect(page.getByLabel('Nom')).toBeVisible();
  });

  test('Permet de basculer vers récupération de mot de passe', async ({ page }) => {
    await page.getByText('Mot de passe oublié ?').click();
    await expect(page.getByRole('heading', { name: 'Récupération de mot de passe' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Envoyer les instructions' })).toBeVisible();
  });
}); 
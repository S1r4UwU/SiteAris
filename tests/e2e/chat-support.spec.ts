import { test, expect } from '@playwright/test';

test.describe("Chat support en temps réel", () => {
  // Test côté client
  test.describe("Côté client", () => {
    test.beforeEach(async ({ page }) => {
      // Visiter la page d'accueil
      await page.goto('/');
    });

    test('Ouverture du widget de chat', async ({ page }) => {
      // Vérifier la présence du bouton de chat
      await expect(page.getByRole('button', { name: /support/i })).toBeVisible();
      
      // Ouvrir le widget de chat
      await page.getByRole('button', { name: /support/i }).click();
      
      // Vérifier que le widget s'ouvre
      await expect(page.getByText('Chat Support')).toBeVisible();
      await expect(page.getByPlaceholder('Tapez votre message...')).toBeVisible();
    });

    test('Création d\'une nouvelle conversation', async ({ page }) => {
      // Ouvrir le widget de chat
      await page.getByRole('button', { name: /support/i }).click();
      
      // Démarrer une nouvelle conversation
      await page.getByRole('button', { name: /nouvelle conversation/i }).click();
      
      // Remplir le formulaire de sujet
      await page.getByLabel('Sujet').fill('Test automatisé');
      await page.getByRole('button', { name: /démarrer/i }).click();
      
      // Envoyer un message
      await page.getByPlaceholder('Tapez votre message...').fill('Message de test automatisé');
      await page.getByRole('button', { name: /envoyer/i }).click();
      
      // Vérifier que le message apparaît dans la conversation
      await expect(page.getByText('Message de test automatisé')).toBeVisible();
    });
  });

  // Test côté administrateur
  test.describe("Côté administrateur", () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter en tant qu'administrateur
      await page.goto('/auth');
      await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL || 'admin@sitearis.com');
      await page.getByLabel('Mot de passe').fill(process.env.ADMIN_PASSWORD || 'admin123');
      await page.getByRole('button', { name: 'Se connecter' }).click();
      
      // Accéder au dashboard de support
      await page.goto('/admin/support');
    });

    test('Affichage des conversations', async ({ page }) => {
      // Vérifier la présence du dashboard de support
      await expect(page.getByRole('heading', { name: /support chat/i })).toBeVisible();
      
      // Vérifier la liste des conversations
      await expect(page.getByText('Conversations')).toBeVisible();
    });

    test('Répondre à une conversation', async ({ page, context }) => {
      // Créer une page client pour simuler une conversation
      const clientPage = await context.newPage();
      await clientPage.goto('/');
      await clientPage.getByRole('button', { name: /support/i }).click();
      await clientPage.getByRole('button', { name: /nouvelle conversation/i }).click();
      await clientPage.getByLabel('Sujet').fill('Test réponse admin');
      await clientPage.getByRole('button', { name: /démarrer/i }).click();
      await clientPage.getByPlaceholder('Tapez votre message...').fill('Message nécessitant une réponse');
      await clientPage.getByRole('button', { name: /envoyer/i }).click();
      
      // Rafraîchir la page admin pour voir la nouvelle conversation
      await page.reload();
      
      // Sélectionner la conversation avec le sujet correspondant
      await page.getByText('Test réponse admin').click();
      
      // Vérifier que le message du client est visible
      await expect(page.getByText('Message nécessitant une réponse')).toBeVisible();
      
      // Répondre au message
      await page.getByPlaceholder('Tapez votre message...').fill('Réponse du support');
      await page.getByRole('button', { name: /envoyer/i }).click();
      
      // Vérifier que la réponse apparaît dans la conversation
      await expect(page.getByText('Réponse du support')).toBeVisible();
      
      // Vérifier que le client reçoit la réponse
      await expect(clientPage.getByText('Réponse du support')).toBeVisible();
      
      // Fermer la page client
      await clientPage.close();
    });

    test('Changement de statut d\'une conversation', async ({ page }) => {
      // Sélectionner une conversation (si disponible)
      const conversation = page.getByRole('button', { name: /conversation/i }).first();
      if (await conversation.isVisible()) {
        await conversation.click();
        
        // Changer le statut
        await page.getByRole('button', { name: /changer statut/i }).click();
        await page.getByRole('menuitem', { name: /fermé/i }).click();
        
        // Vérifier le changement de statut
        await expect(page.getByText(/fermé/i)).toBeVisible();
      }
    });
  });
}); 
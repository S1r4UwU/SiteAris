import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.test
dotenv.config({ path: '.env.test' });

/**
 * Configuration Playwright pour SiteAris
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000, // Timeout global de 30 secondes
  expect: {
    timeout: 5000 // Timeout pour les assertions
  },
  fullyParallel: true, // Exécuter les tests en parallèle
  forbidOnly: !!process.env.CI, // Interdire test.only en CI
  retries: process.env.CI ? 2 : 0, // Réessayer les tests échoués en CI
  workers: process.env.CI ? 1 : undefined, // Limiter les workers en CI
  reporter: [
    ['html', { open: 'never' }], // Rapport HTML
    ['json', { outputFile: 'test-results/report.json' }], // Rapport JSON
    ['junit', { outputFile: 'test-results/junit.xml' }], // Rapport JUnit
    ['list'] // Affichage en ligne de commande
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // Capturer la trace sur le premier réessai
    screenshot: 'only-on-failure', // Capture d'écran uniquement en cas d'échec
    video: 'on-first-retry', // Vidéo sur le premier réessai
    actionTimeout: 10000, // Timeout pour les actions
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Options d'accessibilité
        contextOptions: {
          reducedMotion: 'reduce',
          forcedColors: 'active',
        }
      },
    }
  ],
  outputDir: 'test-results/',
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes pour démarrer le serveur
  },
}); 
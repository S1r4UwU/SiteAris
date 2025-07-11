import { Page } from '@playwright/test';

// Mock pour Supabase
export async function mockSupabaseAuth(page: Page) {
  await page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User',
            role: 'client'
          }
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000
        }
      })
    });
  });
}

// Mock pour Stripe
export async function mockStripeAPI(page: Page) {
  await page.route('**/v1/payment_intents/**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: 'pi_mock_123456',
        client_secret: 'pi_mock_secret_123456',
        status: 'succeeded'
      })
    });
  });
}

// Mock pour les services
export async function mockServicesAPI(page: Page) {
  await page.route('**/api/services**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        services: [
          {
            id: '1',
            name: 'Service Test 1',
            description: 'Description du service test 1',
            price: 99.99,
            category: 'cybersécurité',
            slug: 'service-test-1'
          },
          {
            id: '2',
            name: 'Service Test 2',
            description: 'Description du service test 2',
            price: 149.99,
            category: 'maintenance',
            slug: 'service-test-2'
          }
        ]
      })
    });
  });
}

// Mock pour les commandes
export async function mockOrdersAPI(page: Page) {
  await page.route('**/api/orders**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        orders: [
          {
            id: 'order-1',
            status: 'completed',
            total: 99.99,
            created_at: '2023-07-10T10:00:00Z',
            items: [
              { service_id: '1', quantity: 1, price: 99.99 }
            ]
          }
        ]
      })
    });
  });
}

// Mock pour les documents
export async function mockDocumentsAPI(page: Page) {
  await page.route('**/api/documents**', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        documents: [
          {
            id: 'doc-1',
            name: 'Facture #INV-001',
            type: 'invoice',
            created_at: '2023-07-10T10:00:00Z',
            url: '#'
          }
        ]
      })
    });
  });
} 
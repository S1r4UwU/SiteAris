"use client";

import { createClient } from './client';

// Types pour le CRM
export interface CustomerProfile {
  id: string;
  user_id: string;
  company_name?: string;
  industry?: string;
  annual_revenue?: number;
  employee_count?: number;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  primary_contact?: {
    name?: string;
    position?: string;
    email?: string;
    phone?: string;
  };
  customer_value?: number; // 1-5
  engagement_score?: number; // 1-100
  acquisition_source?: string;
  acquisition_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'SUPPORT' | 'PURCHASE' | 'OTHER';
  subject: string;
  description?: string;
  date: string;
  outcome?: string;
  created_by?: string;
  created_at: string;
}

// Client Supabase pour le CRM
const supabase = createClient();

// Fonction pour récupérer tous les profils clients
export async function getCustomerProfiles(): Promise<CustomerProfile[]> {
  // Données mockées pour les profils clients
  const profiles: CustomerProfile[] = [
    {
      id: 'profile-1',
      user_id: 'mock-user-id',
      company_name: 'Entreprise ABC',
      industry: 'Technologie',
      annual_revenue: 500000,
      employee_count: 25,
      address: {
        street: '123 Rue de Paris',
        city: 'Paris',
        postal_code: '75001',
        country: 'France'
      },
      primary_contact: {
        name: 'Jean Dupont',
        position: 'Directeur IT',
        email: 'jean.dupont@example.com',
        phone: '0123456789'
      },
      customer_value: 4,
      engagement_score: 85,
      acquisition_source: 'Site web',
      acquisition_date: '2022-05-15',
      notes: 'Client fidèle depuis plus d\'un an',
      created_at: '2022-05-15T10:30:00Z',
      updated_at: '2023-06-20T14:45:00Z'
    },
    {
      id: 'profile-2',
      user_id: 'another-user-id',
      company_name: 'Société XYZ',
      industry: 'Finance',
      annual_revenue: 1200000,
      employee_count: 50,
      address: {
        street: '456 Avenue Victor Hugo',
        city: 'Lyon',
        postal_code: '69002',
        country: 'France'
      },
      primary_contact: {
        name: 'Marie Martin',
        position: 'Directrice Générale',
        email: 'marie.martin@example.com',
        phone: '0987654321'
      },
      customer_value: 5,
      engagement_score: 92,
      acquisition_source: 'Recommandation',
      acquisition_date: '2022-08-10',
      notes: 'Potentiel d\'expansion important',
      created_at: '2022-08-10T09:15:00Z',
      updated_at: '2023-07-05T11:30:00Z'
    }
  ];

  return profiles;
}

// Fonction pour récupérer un profil client par ID
export async function getCustomerProfileById(id: string): Promise<CustomerProfile | null> {
  const profiles = await getCustomerProfiles();
  return profiles.find(profile => profile.id === id) || null;
}

// Fonction pour récupérer un profil client par ID utilisateur
export async function getCustomerProfileByUserId(userId: string): Promise<CustomerProfile | null> {
  const profiles = await getCustomerProfiles();
  return profiles.find(profile => profile.user_id === userId) || null;
}

// Fonction pour récupérer tous les segments clients
export async function getCustomerSegments(): Promise<CustomerSegment[]> {
  // Données mockées pour les segments clients
  const segments: CustomerSegment[] = [
    {
      id: 'segment-1',
      name: 'Enterprise',
      description: 'Grandes entreprises avec plus de 100 employés',
      color: '#4f46e5'
    },
    {
      id: 'segment-2',
      name: 'SMB',
      description: 'Petites et moyennes entreprises',
      color: '#0891b2'
    },
    {
      id: 'segment-3',
      name: 'Startup',
      description: 'Entreprises en phase de démarrage',
      color: '#e11d48'
    }
  ];

  return segments;
}

// Fonction pour récupérer toutes les interactions clients
export async function getCustomerInteractions(customerId: string): Promise<CustomerInteraction[]> {
  // Données mockées pour les interactions clients
  const interactions: CustomerInteraction[] = [
    {
      id: 'interaction-1',
      customer_id: 'profile-1',
      type: 'MEETING',
      subject: 'Présentation des services',
      description: 'Présentation détaillée de notre offre de services',
      date: '2023-05-10T14:00:00Z',
      outcome: 'Intérêt pour l\'audit de sécurité',
      created_by: 'admin-id',
      created_at: '2023-05-10T16:30:00Z'
    },
    {
      id: 'interaction-2',
      customer_id: 'profile-1',
      type: 'EMAIL',
      subject: 'Suivi de la réunion',
      description: 'Email de suivi avec documentation supplémentaire',
      date: '2023-05-12T10:15:00Z',
      outcome: 'Demande de devis',
      created_by: 'admin-id',
      created_at: '2023-05-12T10:15:00Z'
    },
    {
      id: 'interaction-3',
      customer_id: 'profile-2',
      type: 'CALL',
      subject: 'Discussion sur les besoins en infrastructure',
      description: 'Appel pour discuter des besoins spécifiques',
      date: '2023-06-05T11:00:00Z',
      outcome: 'Rendez-vous planifié pour la semaine prochaine',
      created_by: 'admin-id',
      created_at: '2023-06-05T11:45:00Z'
    }
  ];

  // Filtrer les interactions pour le client spécifié
  return interactions.filter(interaction => interaction.customer_id === customerId);
}

// Fonction pour mettre à jour un profil client
export async function updateCustomerProfile(profile: Partial<CustomerProfile> & { id: string }): Promise<CustomerProfile | null> {
  // Simuler la mise à jour d'un profil client
  const profiles = await getCustomerProfiles();
  const index = profiles.findIndex(p => p.id === profile.id);
  
  if (index === -1) {
    return null;
  }
  
  // Mettre à jour le profil
  profiles[index] = {
    ...profiles[index],
    ...profile,
    updated_at: new Date().toISOString()
  };
  
  return profiles[index];
}

// Créer un client pour le CRM
export const crmClient = {
  getCustomerProfiles,
  getCustomerProfileById,
  getCustomerProfileByUserId,
  getCustomerSegments,
  getCustomerInteractions,
  updateCustomerProfile
}; 
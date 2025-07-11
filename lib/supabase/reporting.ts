"use client";

import { createClient } from './client';
import { ReportTemplate, SavedReport, Dashboard, ReportResult } from '@/types/reports';

// Client Supabase pour les rapports
const supabase = createClient();

// Exporter le client de reporting
export const reportingClient = {
  // Fonction pour récupérer tous les modèles de rapports
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    // Données mockées pour les templates de rapports
    const templates: ReportTemplate[] = [
      {
        id: '1',
        name: 'Rapport de ventes mensuel',
        description: 'Analyse des ventes par mois et par catégorie',
        query_definition: {
          table: 'orders',
          fields: ['created_at', 'total_amount', 'status']
        },
        chart_type: 'BAR',
        is_public: true,
        permissions: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Performance des services',
        description: 'Analyse de la popularité et rentabilité des services',
        query_definition: {
          table: 'order_items',
          fields: ['service_id', 'quantity', 'total_price']
        },
        chart_type: 'PIE',
        is_public: true,
        permissions: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return templates;
  },
  
  // Fonction pour récupérer tous les rapports sauvegardés
  getSavedReports: async (): Promise<SavedReport[]> => {
    // Données mockées pour les rapports sauvegardés
    const savedReports: SavedReport[] = [
      {
        id: '1',
        template_id: '1',
        name: 'Ventes Q1 2023',
        parameters: {
          date_range: {
            start: '2023-01-01',
            end: '2023-03-31'
          }
        },
        result_data: null,
        created_by: null,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        template_id: '2',
        name: 'Services populaires 2023',
        parameters: {
          date_range: {
            start: '2023-01-01',
            end: '2023-12-31'
          }
        },
        result_data: null,
        created_by: null,
        created_at: new Date().toISOString()
      }
    ];
    
    return savedReports;
  },
  
  // Fonction pour récupérer tous les tableaux de bord
  getDashboards: async (): Promise<Dashboard[]> => {
    // Données mockées pour les tableaux de bord
    const dashboards: Dashboard[] = [
      {
        id: '1',
        name: 'Tableau de bord commercial',
        description: 'Vue d\'ensemble des performances commerciales',
        layout: {
          widgets: [
            {
              id: 'widget-1',
              type: 'CHART',
              report_id: '1',
              position: { x: 0, y: 0, w: 6, h: 4 }
            },
            {
              id: 'widget-2',
              type: 'CHART',
              report_id: '2',
              position: { x: 6, y: 0, w: 6, h: 4 }
            }
          ]
        },
        is_public: true,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    return dashboards;
  },
  
  // Fonction pour exécuter un rapport
  executeReport: async (templateId: string, parameters: any): Promise<ReportResult> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Données mockées pour le résultat du rapport
    const result: ReportResult = {
      data: [
        { month: 'Janvier', total: 12500 },
        { month: 'Février', total: 15800 },
        { month: 'Mars', total: 18200 },
        { month: 'Avril', total: 14500 },
        { month: 'Mai', total: 16700 },
        { month: 'Juin', total: 19300 }
      ],
      meta: {
        count: 6,
        aggregations: {
          total_sum: 97000,
          total_avg: 16166.67
        }
      }
    };
    
    return result;
  },
  
  // Fonction pour sauvegarder un rapport
  saveReport: async (report: SavedReport): Promise<SavedReport> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler la sauvegarde d'un rapport
    return {
      ...report,
      id: report.id || `report-${Date.now()}`,
      created_at: report.created_at || new Date().toISOString()
    };
  },
  
  // Fonction pour sauvegarder un modèle de rapport
  saveTemplate: async (template: ReportTemplate): Promise<ReportTemplate> => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler la sauvegarde d'un modèle de rapport
    return {
      ...template,
      id: template.id || `template-${Date.now()}`,
      created_at: template.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}; 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { FileText, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DocumentItem {
  id: string;
  name: string;
  type: 'INVOICE' | 'QUOTE' | 'REPORT' | 'CONTRACT' | 'CERTIFICATE';
  created_at: string;
  size: number;
}

interface RecentDocumentsProps {
  userId: string;
  limit?: number;
}

export default function RecentDocuments({ userId, limit = 3 }: RecentDocumentsProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentDocuments() {
      try {
        // Dans une implémentation réelle, vous feriez un appel API
        // mais pour l'instant nous simulons les données
        setTimeout(() => {
          const mockDocuments: DocumentItem[] = [
            {
              id: '1',
              name: 'Facture #INV-2023-001',
              type: 'INVOICE',
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              size: 145200
            },
            {
              id: '2',
              name: 'Rapport d\'audit sécurité',
              type: 'REPORT',
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              size: 2540000
            },
            {
              id: '3',
              name: 'Certificat installation firewall',
              type: 'CERTIFICATE',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              size: 320500
            },
            {
              id: '4',
              name: 'Devis #QUO-2023-028',
              type: 'QUOTE',
              created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              size: 128400
            }
          ];
          
          setDocuments(mockDocuments.slice(0, limit));
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors de la récupération des documents récents:', error);
        setLoading(false);
      }
    }

    fetchRecentDocuments();
  }, [userId, limit]);

  // Fonction pour obtenir le libellé du type de document
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return 'Facture';
      case 'QUOTE':
        return 'Devis';
      case 'REPORT':
        return 'Rapport';
      case 'CONTRACT':
        return 'Contrat';
      case 'CERTIFICATE':
        return 'Certificat';
      default:
        return 'Document';
    }
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Fonction pour obtenir l'icône en fonction du type de document
  const getDocumentIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Documents récents</CardTitle>
        <CardDescription>
          Factures, rapports et autres documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              Chargement des documents...
            </div>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map(document => (
              <div key={document.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-1.5 rounded">
                    {getDocumentIcon(document.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{document.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{getDocumentTypeLabel(document.type)}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDate(new Date(document.created_at))}</span>
                      <span className="mx-1">•</span>
                      <span>{formatFileSize(document.size)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/api/documents/${document.id}`}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Télécharger</span>
                  </Link>
                </Button>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/account/documents">
                Voir tous les documents
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Aucun document</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Vous n'avez pas encore de documents disponibles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
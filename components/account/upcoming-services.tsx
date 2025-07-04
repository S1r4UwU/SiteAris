'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpcomingService {
  id: string;
  service_name: string;
  scheduled_date: string;
  status: string;
  order_id: string;
  description?: string;
}

interface UpcomingServicesProps {
  userId: string;
  limit?: number;
}

export default function UpcomingServices({ userId, limit = 3 }: UpcomingServicesProps) {
  const [services, setServices] = useState<UpcomingService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingServices() {
      try {
        // Dans une implémentation réelle, vous feriez un appel API
        // mais pour l'instant nous simulons les données
        setTimeout(() => {
          const mockServices: UpcomingService[] = [
            {
              id: '1',
              service_name: 'Audit de sécurité réseau',
              scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'SCHEDULED',
              order_id: '101',
              description: 'Évaluation complète de votre infrastructure réseau'
            },
            {
              id: '2',
              service_name: 'Maintenance préventive',
              scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'SCHEDULED',
              order_id: '102'
            },
            {
              id: '3',
              service_name: 'Installation firewall',
              scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'SCHEDULED',
              order_id: '103',
              description: 'Installation et configuration du nouveau firewall'
            }
          ];
          
          setServices(mockServices.slice(0, limit));
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Erreur lors de la récupération des services à venir:', error);
        setLoading(false);
      }
    }

    fetchUpcomingServices();
  }, [userId, limit]);

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planifié';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminé';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Prochaines interventions</CardTitle>
        <CardDescription>
          Interventions planifiées pour vos services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              Chargement des interventions...
            </div>
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-4">
            {services.map(service => (
              <div key={service.id} className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{service.service_name}</p>
                    <Badge className={getStatusBadgeClass(service.status)}>
                      {getStatusLabel(service.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{formatDate(new Date(service.scheduled_date))}</span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/account/interventions">
                Voir toutes les interventions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Aucune intervention planifiée</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Vous n'avez actuellement aucune intervention technique planifiée
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
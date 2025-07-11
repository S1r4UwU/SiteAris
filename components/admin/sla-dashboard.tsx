"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  UserCog,
  BarChart4,
  Calendar,
  Hourglass
} from 'lucide-react';

// Types pour les SLA
interface InterventionSLATracking {
  id: string;
  intervention_id: string;
  service_name: string;
  client_name: string;
  sla_type: string;
  target_resolution_time: number; // en minutes
  actual_resolution_time: number | null;
  status: 'pending' | 'breached' | 'met' | 'at_risk';
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  assigned_to: string;
}

interface ServiceSLADefinition {
  id: string;
  service_id: string;
  service_name: string;
  sla_type: string;
  response_time: number; // en minutes
  resolution_time: number; // en minutes
  business_hours_only: boolean;
  support_level: string;
}

type SLAOverview = {
  total: number;
  breached: number;
  onTrack: number;
  resolved: number;
  averageResolutionTime: number;
};

interface SLADashboardProps {
  initialData?: {
    overview?: SLAOverview;
    recentSLAs?: InterventionSLATracking[];
    definitions?: ServiceSLADefinition[];
  };
}

export default function SLADashboard({ initialData }: SLADashboardProps) {
  const [overview, setOverview] = useState<SLAOverview>(
    initialData?.overview || {
      total: 0,
      breached: 0,
      onTrack: 0,
      resolved: 0,
      averageResolutionTime: 0,
    }
  );
  const [recentSLAs, setRecentSLAs] = useState<InterventionSLATracking[]>(
    initialData?.recentSLAs || []
  );
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchSLAData();
  }, []);

  const fetchSLAData = async () => {
    // Pour le mock, on génère des données aléatoires
    const mockOverview = {
      total: 48,
      breached: 7,
      onTrack: 35,
      resolved: 42,
      averageResolutionTime: 187,
    };

    const mockSLAs: InterventionSLATracking[] = [
      {
        id: '1',
        intervention_id: 'int-1',
        service_name: 'Support technique',
        client_name: 'Entreprise ABC',
        sla_type: 'Standard',
        target_resolution_time: 240,
        actual_resolution_time: null,
        status: 'pending',
        deadline: new Date(Date.now() + 3600000).toISOString(),
        priority: 'high',
        assigned_to: 'Jean Dupont'
      },
      {
        id: '2',
        intervention_id: 'int-2',
        service_name: 'Installation réseau',
        client_name: 'Société XYZ',
        sla_type: 'Premium',
        target_resolution_time: 120,
        actual_resolution_time: null,
        status: 'at_risk',
        deadline: new Date(Date.now() + 1800000).toISOString(),
        priority: 'high',
        assigned_to: 'Marie Martin'
      },
      {
        id: '3',
        intervention_id: 'int-3',
        service_name: 'Audit de sécurité',
        client_name: 'Cabinet Juridique',
        sla_type: 'Business',
        target_resolution_time: 480,
        actual_resolution_time: 390,
        status: 'met',
        deadline: new Date(Date.now() - 3600000).toISOString(),
        priority: 'medium',
        assigned_to: 'Pierre Durand'
      },
      {
        id: '4',
        intervention_id: 'int-4',
        service_name: 'Support technique',
        client_name: 'Restaurant Le Gourmet',
        sla_type: 'Standard',
        target_resolution_time: 240,
        actual_resolution_time: 320,
        status: 'breached',
        deadline: new Date(Date.now() - 7200000).toISOString(),
        priority: 'low',
        assigned_to: 'Jean Dupont'
      }
    ];

    setOverview(mockOverview);
    setRecentSLAs(mockSLAs);
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };

  const calculateTimeRemaining = (target: string) => {
    const deadline = new Date(target);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return "Dépassé";
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getSLAStatusColor = (sla: InterventionSLATracking) => {
    switch (sla.status) {
      case 'met':
        return "bg-green-100 text-green-800";
      case 'breached':
        return "bg-red-100 text-red-800";
      case 'at_risk':
        return "bg-amber-100 text-amber-800";
      case 'pending':
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getSLAStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'breached':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'at_risk':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'pending':
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return "text-red-500";
      case 'medium':
        return "text-amber-500";
      case 'low':
        return "text-green-500";
      default:
        return "text-slate-500";
    }
  };

  const filteredSLAs = recentSLAs.filter(sla => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return sla.status === 'pending' || sla.status === 'at_risk';
    if (activeTab === 'resolved') return sla.status === 'met';
    if (activeTab === 'breached') return sla.status === 'breached';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Total</p>
                <p className="text-2xl font-bold">{overview.total}</p>
              </div>
              <BarChart4 className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Respectés</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-green-600">{overview.onTrack + overview.resolved}</p>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Math.round(((overview.onTrack + overview.resolved) / overview.total) * 100)}%)
                  </span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Non respectés</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-red-600">{overview.breached}</p>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({Math.round((overview.breached / overview.total) * 100)}%)
                  </span>
                </div>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps moyen</p>
                <p className="text-2xl font-bold">{formatMinutes(overview.averageResolutionTime)}</p>
              </div>
              <Hourglass className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Suivi des SLAs</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant={activeTab === 'all' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveTab('all')}
            >
              Tous
            </Button>
            <Button 
              variant={activeTab === 'active' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveTab('active')}
            >
              En cours
            </Button>
            <Button 
              variant={activeTab === 'resolved' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveTab('resolved')}
            >
              Respectés
            </Button>
            <Button 
              variant={activeTab === 'breached' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveTab('breached')}
            >
              Non respectés
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-2">Client</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Technicien</th>
                  <th className="text-left p-2">SLA</th>
                  <th className="text-center p-2">Priorité</th>
                  <th className="text-center p-2">Statut</th>
                  <th className="text-center p-2">Temps restant</th>
                </tr>
              </thead>
              <tbody>
                {filteredSLAs.length > 0 ? (
                  filteredSLAs.map((sla) => (
                    <tr key={sla.id} className="border-b">
                      <td className="p-2">{sla.client_name}</td>
                      <td className="p-2">{sla.service_name}</td>
                      <td className="p-2">{sla.assigned_to}</td>
                      <td className="p-2">{sla.sla_type} ({formatMinutes(sla.target_resolution_time)})</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(sla.priority)}`}></span>
                        <span className="sr-only">{sla.priority}</span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSLAStatusColor(sla)}`}>
                          {sla.status === 'met' ? 'Respecté' :
                           sla.status === 'breached' ? 'Non respecté' :
                           sla.status === 'at_risk' ? 'À risque' : 'En cours'}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        {sla.status === 'pending' || sla.status === 'at_risk' 
                          ? calculateTimeRemaining(sla.deadline)
                          : sla.actual_resolution_time 
                            ? formatMinutes(sla.actual_resolution_time) 
                            : '-'
                        }
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-muted-foreground">
                      Aucun SLA correspondant aux critères sélectionnés
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
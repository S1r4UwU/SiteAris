"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Filter,
  Search
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function PlanningPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // État pour le calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [filter, setFilter] = useState({
    technicianId: '',
    status: '',
    serviceType: ''
  });
  
  // Données simulées pour les interventions
  const [interventions, setInterventions] = useState([
    {
      id: 1,
      title: "Installation serveur",
      client: "Entreprise ABC",
      address: "123 Rue de Paris, 75001 Paris",
      technicianId: 1,
      technicianName: "Jean Dupont",
      start: new Date(2023, 6, 15, 9, 0),
      end: new Date(2023, 6, 15, 12, 0),
      status: "SCHEDULED",
      serviceType: "INSTALLATION"
    },
    {
      id: 2,
      title: "Audit sécurité",
      client: "Société XYZ",
      address: "456 Avenue Victor Hugo, 75016 Paris",
      technicianId: 2,
      technicianName: "Marie Martin",
      start: new Date(2023, 6, 16, 14, 0),
      end: new Date(2023, 6, 16, 17, 0),
      status: "CONFIRMED",
      serviceType: "AUDIT"
    },
    {
      id: 3,
      title: "Maintenance réseau",
      client: "Cabinet Juridique",
      address: "789 Boulevard Haussmann, 75008 Paris",
      technicianId: 1,
      technicianName: "Jean Dupont",
      start: new Date(2023, 6, 17, 10, 0),
      end: new Date(2023, 6, 17, 15, 0),
      status: "IN_PROGRESS",
      serviceType: "MAINTENANCE"
    }
  ]);
  
  // Données simulées pour les techniciens
  const technicians = [
    { id: 1, name: "Jean Dupont" },
    { id: 2, name: "Marie Martin" },
    { id: 3, name: "Pierre Durand" }
  ];
  
  // Fonction pour naviguer dans le calendrier
  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (view === 'day') {
      setCurrentDate(prevDate => 
        direction === 'next' 
          ? addDays(prevDate, 1) 
          : addDays(prevDate, -1)
      );
    } else if (view === 'week') {
      setCurrentDate(prevDate => 
        direction === 'next' 
          ? addDays(prevDate, 7) 
          : addDays(prevDate, -7)
      );
    } else {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        return newDate;
      });
    }
  };
  
  // Fonction pour générer les jours de la semaine actuelle
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });
  
  // Fonction pour filtrer les interventions par jour
  const getInterventionsForDay = (day: Date) => {
    return interventions.filter(intervention => 
      isSameDay(intervention.start, day) &&
      (filter.technicianId ? intervention.technicianId === parseInt(filter.technicianId) : true) &&
      (filter.status ? intervention.status === filter.status : true) &&
      (filter.serviceType ? intervention.serviceType === filter.serviceType : true)
    );
  };
  
  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planification des Interventions</h1>
          <p className="text-muted-foreground">
            Gérez et planifiez les interventions des techniciens
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button asChild>
            <a href="/admin/planning/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle intervention
            </a>
          </Button>
        </div>
      </div>
      
      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Technicien</label>
              <Select 
                value={filter.technicianId} 
                onValueChange={(value) => setFilter({...filter, technicianId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les techniciens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les techniciens</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id.toString()}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Statut</label>
              <Select 
                value={filter.status} 
                onValueChange={(value) => setFilter({...filter, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="SCHEDULED">Planifiée</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminée</SelectItem>
                  <SelectItem value="CANCELLED">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Type de service</label>
              <Select 
                value={filter.serviceType} 
                onValueChange={(value) => setFilter({...filter, serviceType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="INSTALLATION">Installation</SelectItem>
                  <SelectItem value="AUDIT">Audit</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Calendrier */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Calendrier des interventions</CardTitle>
            <div className="flex items-center space-x-2">
              <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="day">Jour</TabsTrigger>
                  <TabsTrigger value="week">Semaine</TabsTrigger>
                  <TabsTrigger value="month">Mois</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center ml-4">
                <Button variant="outline" size="icon" onClick={() => navigateCalendar('prev')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-36 text-center mx-2">
                  {view === 'day' && format(currentDate, 'dd MMMM yyyy', { locale: fr })}
                  {view === 'week' && `${format(weekDays[0], 'dd MMM', { locale: fr })} - ${format(weekDays[6], 'dd MMM yyyy', { locale: fr })}`}
                  {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
                </div>
                <Button variant="outline" size="icon" onClick={() => navigateCalendar('next')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'week' && (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => (
                <div key={index} className="border rounded-md">
                  <div className={`p-2 text-center font-medium ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <div>{format(day, 'EEEE', { locale: fr })}</div>
                    <div>{format(day, 'dd/MM')}</div>
                  </div>
                  <div className="p-2 min-h-[200px]">
                    {getInterventionsForDay(day).map((intervention) => (
                      <div 
                        key={intervention.id} 
                        className="mb-2 p-2 bg-white border rounded-md shadow-sm hover:shadow cursor-pointer"
                        onClick={() => router.push(`/admin/planning/${intervention.id}`)}
                      >
                        <div className="font-medium truncate">{intervention.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{intervention.client}</div>
                        <div className="flex items-center text-xs mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{format(intervention.start, 'HH:mm')} - {format(intervention.end, 'HH:mm')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge variant="outline" className={getStatusColor(intervention.status)}>
                            {intervention.status === 'SCHEDULED' ? 'Planifiée' : 
                             intervention.status === 'CONFIRMED' ? 'Confirmée' : 
                             intervention.status === 'IN_PROGRESS' ? 'En cours' : 
                             intervention.status === 'COMPLETED' ? 'Terminée' : 
                             'Annulée'}
                          </Badge>
                          <div className="text-xs">{intervention.technicianName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {view === 'day' && (
            <div className="border rounded-md">
              <div className={`p-2 text-center font-medium ${isSameDay(currentDate, new Date()) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <div>{format(currentDate, 'EEEE dd MMMM yyyy', { locale: fr })}</div>
              </div>
              <div className="p-4">
                {getInterventionsForDay(currentDate).length > 0 ? (
                  getInterventionsForDay(currentDate).map((intervention) => (
                    <div 
                      key={intervention.id} 
                      className="mb-4 p-3 bg-white border rounded-md shadow-sm hover:shadow cursor-pointer"
                      onClick={() => router.push(`/admin/planning/${intervention.id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-lg">{intervention.title}</div>
                          <div className="text-muted-foreground">{intervention.client}</div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(intervention.status)}>
                          {intervention.status === 'SCHEDULED' ? 'Planifiée' : 
                           intervention.status === 'CONFIRMED' ? 'Confirmée' : 
                           intervention.status === 'IN_PROGRESS' ? 'En cours' : 
                           intervention.status === 'COMPLETED' ? 'Terminée' : 
                           'Annulée'}
                        </Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(intervention.start, 'HH:mm')} - {format(intervention.end, 'HH:mm')}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{intervention.address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Technicien: {intervention.technicianName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune intervention planifiée pour cette journée
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
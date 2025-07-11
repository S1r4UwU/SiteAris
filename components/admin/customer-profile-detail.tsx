"use client";

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Tag, 
  DollarSign, 
  Package2,
  Edit,
  Save,
  X,
  Activity,
  BarChart,
  PieChart,
  AlertCircle
} from 'lucide-react';

import { formatPrice } from '@/lib/utils';
import { CustomerProfile, CustomerSegment, CustomerInteraction } from '@/types/supabase';
import { crmClient } from '@/lib/supabase/crm';

interface CustomerProfileDetailProps {
  userId: string;
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
  };
  profileData?: CustomerProfile & {
    segments?: CustomerSegment[];
    interactions?: CustomerInteraction[];
    total_orders?: number;
    recent_orders?: any[];
  };
  onUpdate?: () => void;
}

export default function CustomerProfileDetail({ 
  userId, 
  userData, 
  profileData,
  onUpdate 
}: CustomerProfileDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    company_size: profileData?.company_size || '',
    industry: profileData?.industry || '',
    business_type: profileData?.business_type || '',
    technical_level: profileData?.technical_level || 'NOVICE',
    notes: profileData?.notes || ''
  });
  
  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'CL';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!userId) return;
    
    try {
      const success = await crmClient.updateCustomerProfile(userId, profileForm);
      if (success) {
        setIsEditing(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };
  
  const cancelEdit = () => {
    setProfileForm({
      company_size: profileData?.company_size || '',
      industry: profileData?.industry || '',
      business_type: profileData?.business_type || '',
      technical_level: profileData?.technical_level || 'NOVICE',
      notes: profileData?.notes || ''
    });
    setIsEditing(false);
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Segmentation visuelle
  const getSegmentBadgeColor = (segment?: CustomerSegment) => {
    if (!segment) return 'bg-gray-100 text-gray-800';
    
    const segmentName = segment.name.toLowerCase();
    if (segmentName.includes('premium') || segmentName.includes('vip')) {
      return 'bg-amber-100 text-amber-800';
    } else if (segmentName.includes('actif') || segmentName.includes('régulier')) {
      return 'bg-green-100 text-green-800';
    } else if (segmentName.includes('nouveau')) {
      return 'bg-blue-100 text-blue-800';
    } else if (segmentName.includes('inactif') || segmentName.includes('dormant')) {
      return 'bg-red-100 text-red-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };
  
  const getValueLevelColor = (value?: number) => {
    if (!value) return 'bg-gray-100 text-gray-800';
    if (value > 10000) return 'bg-emerald-100 text-emerald-800';
    if (value > 5000) return 'bg-green-100 text-green-800';
    if (value > 1000) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const getEngagementLevelColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score > 80) return 'bg-emerald-100 text-emerald-800';
    if (score > 50) return 'bg-green-100 text-green-800';
    if (score > 30) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div>
      {/* En-tête du profil */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {getUserInitials(userData.first_name, userData.last_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">
                  {userData.first_name} {userData.last_name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profileData?.segments?.map(segment => (
                    <Badge 
                      key={segment.id} 
                      variant="outline" 
                      className={getSegmentBadgeColor(segment)}
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {segment.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {userData.company_name && (
                <div className="flex items-center text-muted-foreground">
                  <Building2 className="mr-2 h-4 w-4" />
                  {userData.company_name}
                </div>
              )}
              
              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {userData.email}
              </div>
              
              {userData.phone && (
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {userData.phone}
                </div>
              )}
              
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <Badge variant="outline" className={getValueLevelColor(profileData?.lifetime_value)}>
                  <DollarSign className="mr-1 h-3 w-3" />
                  Valeur client: {formatPrice(profileData?.lifetime_value || 0)}
                </Badge>
                
                <Badge variant="outline" className={getEngagementLevelColor(profileData?.engagement_score)}>
                  <Activity className="mr-1 h-3 w-3" />
                  Engagement: {profileData?.engagement_score || 0}/100
                </Badge>
                
                <Badge variant="outline">
                  <Package2 className="mr-1 h-3 w-3" />
                  {profileData?.total_orders || 0} commande{(profileData?.total_orders || 0) > 1 ? 's' : ''}
                </Badge>
                
                {profileData?.acquisition_source && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800">
                    Source: {profileData.acquisition_source}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Onglets de navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
        </TabsList>
        
        {/* Vue d'ensemble */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Informations entreprise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Entreprise</dt>
                    <dd>{userData.company_name || 'Non spécifié'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Taille d'entreprise</dt>
                    <dd>{profileData?.company_size || 'Non spécifiée'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Secteur d'activité</dt>
                    <dd>{profileData?.industry || 'Non spécifié'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Type d'entreprise</dt>
                    <dd>{profileData?.business_type || 'Non spécifié'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Niveau technique</dt>
                    <dd>
                      {profileData?.technical_level === 'NOVICE' ? 'Débutant' : 
                       profileData?.technical_level === 'INTERMEDIATE' ? 'Intermédiaire' : 
                       profileData?.technical_level === 'EXPERT' ? 'Expert' : 
                       'Non spécifié'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Activité client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Valeur totale des achats</dt>
                    <dd className="text-lg font-semibold">{formatPrice(profileData?.lifetime_value || 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Nombre de commandes</dt>
                    <dd>{profileData?.total_orders || 0}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Score d'engagement</dt>
                    <dd>{profileData?.engagement_score || 0}/100</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Dernière activité</dt>
                    <dd>{profileData?.last_activity ? formatDate(profileData.last_activity) : 'Aucune activité'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Source d'acquisition</dt>
                    <dd>{profileData?.acquisition_source || 'Non spécifiée'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          {/* Notes */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Notes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1 h-4 w-4" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent>
              {profileData?.notes ? (
                <p className="whitespace-pre-line">{profileData.notes}</p>
              ) : (
                <p className="text-muted-foreground italic">Aucune note pour ce client</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Détails du profil */}
        <TabsContent value="details">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations détaillées</CardTitle>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={cancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_size">Taille d'entreprise</Label>
                      <Select 
                        name="company_size" 
                        value={profileForm.company_size || ''} 
                        onValueChange={(value) => setProfileForm(prev => ({ ...prev, company_size: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une taille" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Non spécifiée</SelectItem>
                          <SelectItem value="TPE">TPE (< 10 employés)</SelectItem>
                          <SelectItem value="PME">PME (10-249 employés)</SelectItem>
                          <SelectItem value="ETI">ETI (250-4999 employés)</SelectItem>
                          <SelectItem value="GE">Grande Entreprise (5000+ employés)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Secteur d'activité</Label>
                      <Select 
                        name="industry" 
                        value={profileForm.industry || ''} 
                        onValueChange={(value) => setProfileForm(prev => ({ ...prev, industry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Non spécifié</SelectItem>
                          <SelectItem value="Finance">Finance et Assurance</SelectItem>
                          <SelectItem value="Santé">Santé</SelectItem>
                          <SelectItem value="Technologie">Technologie et IT</SelectItem>
                          <SelectItem value="Education">Éducation</SelectItem>
                          <SelectItem value="Commerce">Commerce et Distribution</SelectItem>
                          <SelectItem value="Industrie">Industrie</SelectItem>
                          <SelectItem value="Services">Services Professionnels</SelectItem>
                          <SelectItem value="Public">Secteur Public</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_type">Type d'entreprise</Label>
                      <Select 
                        name="business_type" 
                        value={profileForm.business_type || ''} 
                        onValueChange={(value) => setProfileForm(prev => ({ ...prev, business_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Non spécifié</SelectItem>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="B2C">B2C</SelectItem>
                          <SelectItem value="B2G">B2G</SelectItem>
                          <SelectItem value="Mixte">Mixte</SelectItem>
                          <SelectItem value="Non-profit">Organisation à but non lucratif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technical_level">Niveau technique</Label>
                      <Select 
                        name="technical_level" 
                        value={profileForm.technical_level || 'NOVICE'} 
                        onValueChange={(value) => setProfileForm(prev => ({ ...prev, technical_level: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NOVICE">Débutant</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea 
                      name="notes" 
                      rows={5}
                      value={profileForm.notes || ''} 
                      onChange={handleInputChange}
                      placeholder="Ajoutez des notes sur ce client"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Informations professionnelles</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Taille d'entreprise</dt>
                          <dd className="font-medium">{profileData?.company_size || 'Non spécifiée'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Secteur d'activité</dt>
                          <dd className="font-medium">{profileData?.industry || 'Non spécifié'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Type d'entreprise</dt>
                          <dd className="font-medium">{profileData?.business_type || 'Non spécifié'}</dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Préférences techniques</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Niveau technique</dt>
                          <dd className="font-medium">
                            {profileData?.technical_level === 'NOVICE' ? 'Débutant' : 
                             profileData?.technical_level === 'INTERMEDIATE' ? 'Intermédiaire' : 
                             profileData?.technical_level === 'EXPERT' ? 'Expert' : 
                             'Non spécifié'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    {profileData?.notes ? (
                      <p className="whitespace-pre-line">{profileData.notes}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Aucune note pour ce client</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Interactions */}
        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Historique des interactions
              </CardTitle>
              <CardDescription>
                Historique complet des échanges avec le client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileData?.interactions && profileData.interactions.length > 0 ? (
                <div className="space-y-6">
                  {profileData.interactions.map((interaction) => (
                    <div key={interaction.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {interaction.type === 'EMAIL' ? 'Email' :
                             interaction.type === 'PHONE' ? 'Téléphone' :
                             interaction.type === 'CHAT' ? 'Chat' :
                             interaction.type === 'MEETING' ? 'Réunion' :
                             'Autre'}
                          </Badge>
                          <span className="font-medium">{interaction.subject || 'Sans objet'}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(interaction.interaction_date)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-line">{interaction.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">
                    Aucune interaction enregistrée avec ce client
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ajouter une interaction
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Commandes */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package2 className="mr-2 h-5 w-5" />
                Commandes
              </CardTitle>
              <CardDescription>
                Historique des commandes du client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileData?.recent_orders && profileData.recent_orders.length > 0 ? (
                <div className="space-y-4">
                  {profileData.recent_orders.map((order) => (
                    <div key={order.id} className="border rounded-md p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div>
                          <div className="font-medium">{order.order_number || `Commande #${order.id.slice(0, 8)}`}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{formatPrice(order.total_amount)}</div>
                          <Badge variant={
                            order.status === 'COMPLETED' ? 'default' : 
                            order.status === 'CANCELLED' ? 'destructive' : 
                            'secondary'
                          }>
                            {order.status === 'PENDING' ? 'En attente' : 
                             order.status === 'PAID_DEPOSIT' ? 'Acompte payé' : 
                             order.status === 'PAID' ? 'Payé' : 
                             order.status === 'IN_PROGRESS' ? 'En cours' : 
                             order.status === 'COMPLETED' ? 'Terminé' : 
                             order.status === 'CANCELLED' ? 'Annulé' : 
                             order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package2 className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">
                    Aucune commande trouvée pour ce client
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href={`/admin/orders?user=${userId}`}>
                  Voir toutes les commandes
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
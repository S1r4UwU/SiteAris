import React from 'react';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { 
  ArrowLeft,
  Download,
  Pencil,
  Clock,
  Calendar,
  CreditCard,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Check,
  X
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = params;
  const supabase = createServerComponentClient({ cookies });
  
  // Récupérer les détails de la commande
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      users (
        id,
        email,
        full_name,
        phone,
        address
      ),
      order_items (
        id,
        service_id,
        quantity,
        unit_price,
        total_price,
        services (
          id,
          name,
          description
        )
      ),
      order_status_history (
        id,
        status,
        created_at,
        notes
      ),
      documents (
        id,
        name,
        type,
        url,
        created_at
      ),
      interventions (
        id,
        status,
        scheduled_date,
        notes,
        technician_id
      )
    `)
    .eq('id', id)
    .single();
  
  // Rediriger vers 404 si la commande n'existe pas
  if (error || !order) {
    notFound();
  }
  
  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'PAID_DEPOSIT':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'PAID_DEPOSIT':
        return 'Acompte payé';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'COMPLETED':
        return 'Terminée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };
  
  // Fonction pour obtenir le libellé du type de document
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return 'Facture';
      case 'QUOTE':
        return 'Devis';
      case 'CONTRACT':
        return 'Contrat';
      case 'REPORT':
        return 'Rapport';
      default:
        return type;
    }
  };
  
  // Trier l'historique des statuts par date
  const statusHistory = [...(order.order_status_history || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Trier les documents par date
  const documents = [...(order.documents || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Trier les interventions par date
  const interventions = [...(order.interventions || [])].sort(
    (a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
  );
  
  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Link>
            </Button>
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Commande #{id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(order.created_at), 'dd/MM/yyyy à HH:mm')} 
            {' • '}
            {formatDistanceToNow(new Date(order.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/orders/${id}/invoice`}>
              <Download className="mr-2 h-4 w-4" />
              Facture
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/orders/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Colonne de gauche */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statut</p>
                    <Badge variant="outline" className={`mt-1 ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de commande</p>
                    <p className="mt-1">{format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Montant total</p>
                    <p className="mt-1 font-semibold">{formatPrice(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mode de paiement</p>
                    <p className="mt-1">{order.payment_method || 'Non spécifié'}</p>
                  </div>
                </div>
                
                {/* Tableau des services */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Services commandés</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-medium">{item.services.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {item.services.description}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatPrice(item.unit_price)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatPrice(item.total_price)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Aucun service commandé
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Résumé des coûts */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(order.subtotal_amount || order.total_amount)}</span>
                  </div>
                  {order.tax_amount > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">TVA (20%)</span>
                      <span>{formatPrice(order.tax_amount)}</span>
                    </div>
                  )}
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Remise</span>
                      <span>-{formatPrice(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 font-bold border-t mt-2">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Onglets */}
          <Tabs defaultValue="timeline">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="timeline">Chronologie</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
            </TabsList>
            
            {/* Chronologie */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Chronologie de la commande</CardTitle>
                  <CardDescription>Historique des statuts et actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {statusHistory.length > 0 ? (
                      statusHistory.map((status, index) => (
                        <div key={status.id} className="flex">
                          <div className="mr-4 flex flex-col items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                              <Clock className="h-5 w-5 text-primary-foreground" />
                            </div>
                            {index < statusHistory.length - 1 && (
                              <div className="h-full w-px bg-border" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-medium">
                              {getStatusLabel(status.status)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(status.created_at), 'dd/MM/yyyy à HH:mm')}
                            </p>
                            {status.notes && (
                              <p className="mt-2 text-sm">{status.notes}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Aucun historique disponible</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Factures, devis et autres documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3 text-primary" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                  {getDocumentTypeLabel(doc.type)}
                                </Badge>
                                <span>
                                  {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={doc.url} target="_blank">
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </Link>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Aucun document disponible</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/admin/orders/${id}/documents/add`}>
                      Ajouter un document
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Interventions */}
            <TabsContent value="interventions">
              <Card>
                <CardHeader>
                  <CardTitle>Interventions</CardTitle>
                  <CardDescription>Planification et suivi des interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interventions.length > 0 ? (
                      interventions.map((intervention) => (
                        <div key={intervention.id} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-5 w-5 mr-2 text-primary" />
                              <h4 className="font-medium">
                                {format(new Date(intervention.scheduled_date), 'dd/MM/yyyy à HH:mm')}
                              </h4>
                            </div>
                            <Badge variant="outline" className={getStatusColor(intervention.status)}>
                              {getStatusLabel(intervention.status)}
                            </Badge>
                          </div>
                          {intervention.notes && (
                            <p className="text-sm mt-2">{intervention.notes}</p>
                          )}
                          <div className="mt-4 flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/interventions/${intervention.id}`}>
                                Détails
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Aucune intervention planifiée</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/admin/orders/${id}/interventions/schedule`}>
                      Planifier une intervention
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.users?.full_name || 'Client'}</p>
                    <p className="text-sm text-muted-foreground">Client</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.users?.email}</p>
                    <p className="text-sm text-muted-foreground">Email</p>
                  </div>
                </div>
                {order.users?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.users.phone}</p>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                    </div>
                  </div>
                )}
                {order.users?.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{order.users.address}</p>
                      <p className="text-sm text-muted-foreground">Adresse</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/admin/users/${order.users?.id}`}>
                  Voir le profil client
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/admin/orders/${id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier la commande
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/orders/${id}/invoice`}>
                  <Download className="mr-2 h-4 w-4" />
                  Générer une facture
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/orders/${id}/interventions/schedule`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Planifier une intervention
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Statut du paiement</p>
                    </div>
                  </div>
                  <Badge variant={order.payment_status === 'PAID' ? 'success' : 'secondary'}>
                    {order.payment_status === 'PAID' ? 'Payé' : 'En attente'}
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Montant total</span>
                    <span>{formatPrice(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Payé</span>
                    <span>{formatPrice(order.paid_amount || 0)}</span>
                  </div>
                  {order.total_amount > (order.paid_amount || 0) && (
                    <div className="flex justify-between py-1 font-medium">
                      <span>Reste à payer</span>
                      <span>{formatPrice(order.total_amount - (order.paid_amount || 0))}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/orders/${id}/payments`}>
                  Gérer les paiements
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 
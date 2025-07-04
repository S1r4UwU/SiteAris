import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Package2, 
  User, 
  MapPin, 
  Phone,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Récupérer les détails de la commande
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single();
    
  if (error || !order) {
    notFound();
  }
  
  // Récupérer les événements de la commande
  const { data: orderEvents } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', params.id)
    .order('created_at', { ascending: true });
    
  // Récupérer les documents liés à la commande
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('order_id', params.id)
    .order('created_at', { ascending: false });
    
  // Récupérer les interventions liées à la commande
  const { data: interventions } = await supabase
    .from('interventions')
    .select('*, order_items(*)')
    .eq('order_items.order_id', params.id)
    .order('scheduled_date', { ascending: true });
  
  // Récupérer les factures liées à la commande
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', params.id)
    .order('issue_date', { ascending: false });
  
  // Fonction pour obtenir le statut de la commande
  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'PAID_DEPOSIT': return 'Acompte payé';
      case 'PAID': return 'Payé';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      case 'PAYMENT_FAILED': return 'Paiement échoué';
      default: return status;
    }
  };
  
  // Fonction pour obtenir la classe CSS du statut
  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PAYMENT_FAILED': return 'bg-red-100 text-red-800';
      case 'PAID_DEPOSIT': return 'bg-amber-100 text-amber-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PAID': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link href="/account/orders" className="text-muted-foreground hover:text-foreground mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Commande {order.order_number}
            </h1>
            <Badge className={`ml-3 ${getOrderStatusClass(order.status)}`}>
              {getOrderStatusText(order.status)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Passée le {formatDate(new Date(order.created_at))}
          </p>
        </div>
        
        {/* Actions */}
        <div className="mt-4 md:mt-0 flex space-x-2">
          {invoices && invoices.length > 0 && (
            <Button variant="outline" asChild>
              <Link href={`/api/documents/invoice/${invoices[0].id}`}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger la facture
              </Link>
            </Button>
          )}
          
          {/* Afficher le bouton de paiement du solde si l'acompte est payé */}
          {order.status === 'PAID_DEPOSIT' && (
            <Button asChild>
              <Link href={`/checkout/payment/${order.id}`}>
                Payer le solde
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* Récapitulatif de la commande */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Détails de la commande</CardTitle>
            <CardDescription>
              Récapitulatif des services commandés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_items && order.order_items.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.service_name}</h3>
                      {item.configuration && (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground mb-1">Configuration:</p>
                          <ul className="list-disc list-inside space-y-1 pl-2">
                            {Object.entries(item.configuration).map(([key, value]) => (
                              <li key={key} className="text-muted-foreground">
                                {key}: {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.calculated_price)}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Acompte payé</span>
                <span>{formatPrice(order.deposit_amount)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg">
                <span>Solde restant</span>
                <span>{formatPrice(order.remaining_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Informations client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Informations client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">
                {order.customer_info.first_name} {order.customer_info.last_name}
              </p>
              {order.customer_info.company_name && (
                <p className="text-sm text-muted-foreground">
                  {order.customer_info.company_name}
                </p>
              )}
            </div>
            
            <div className="flex items-start">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{order.customer_info.email}</span>
            </div>
            
            {order.customer_info.phone && (
              <div className="flex items-start">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.customer_info.phone}</span>
              </div>
            )}
            
            {order.shipping_info && (
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{order.shipping_info.street}</p>
                  <p>{order.shipping_info.postal_code} {order.shipping_info.city}</p>
                  <p>{order.shipping_info.country}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Timeline des événements */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Suivi de commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-border">
              {orderEvents && orderEvents.length > 0 ? (
                orderEvents.map((event, index) => (
                  <div key={event.id} className={`mb-6 relative ${index === orderEvents.length - 1 ? '' : ''}`}>
                    <div className="absolute -left-[13px] top-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                    <div className="pl-4">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(event.created_at))}
                      </p>
                      <h3 className="font-medium mt-1">{event.event_type}</h3>
                      <p className="text-sm mt-1">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Aucun événement enregistré pour cette commande</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Interventions planifiées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interventions && interventions.length > 0 ? (
              <div className="space-y-4">
                {interventions.map((intervention) => (
                  <div key={intervention.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="font-medium">
                      {intervention.order_items?.service_name || 'Intervention'}
                    </p>
                    <div className="flex items-center mt-1 text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {intervention.scheduled_date 
                          ? formatDate(new Date(intervention.scheduled_date)) 
                          : 'Date à confirmer'}
                      </span>
                    </div>
                    <Badge className={`mt-2 ${
                      intervention.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      intervention.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      intervention.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {intervention.status === 'COMPLETED' ? 'Terminée' :
                       intervention.status === 'CANCELLED' ? 'Annulée' :
                       intervention.status === 'IN_PROGRESS' ? 'En cours' :
                       'Planifiée'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune intervention planifiée</p>
            )}
          </CardContent>
        </Card>
        
        {/* Documents */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Factures */}
              {invoices && invoices.length > 0 && (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {invoice.is_deposit ? 'Facture d\'acompte' : 'Facture'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        N° {invoice.invoice_number}
                      </p>
                      <p className="text-sm">
                        {formatPrice(invoice.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Émise le {formatDate(new Date(invoice.issue_date))}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/api/documents/invoice/${invoice.id}`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
              
              {/* Autres documents */}
              {documents && documents.length > 0 && (
                documents.map((document) => (
                  <div key={document.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.type === 'INVOICE' ? 'Facture' : 
                         document.type === 'QUOTE' ? 'Devis' : 
                         document.type === 'REPORT' ? 'Rapport' : 
                         document.type === 'CONTRACT' ? 'Contrat' : 
                         document.type === 'CERTIFICATE' ? 'Certificat' : 
                         'Document'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ajouté le {formatDate(new Date(document.created_at))}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/api/documents/${document.id}`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
              
              {(!documents || documents.length === 0) && (!invoices || invoices.length === 0) && (
                <div className="md:col-span-2 lg:col-span-3 text-center py-6">
                  <p className="text-muted-foreground">Aucun document disponible pour cette commande</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
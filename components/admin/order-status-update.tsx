'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  statusHistory: {
    id: string;
    status: string;
    notes?: string;
    created_at: string;
  }[];
}

export default function OrderStatusUpdate({ orderId, currentStatus, statusHistory }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Statuts disponibles pour les commandes
  const availableStatuses = [
    { value: 'PENDING', label: 'En attente' },
    { value: 'PAID_DEPOSIT', label: 'Acompte payé' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminée' },
    { value: 'CANCELLED', label: 'Annulée' },
  ];

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
    const statusItem = availableStatuses.find(s => s.value === status);
    return statusItem ? statusItem.label : status;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Une erreur est survenue lors de la mise à jour du statut');
      }

      setSuccess('Statut de la commande mis à jour avec succès');
      
      // Rafraîchir la page après un court délai
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mettre à jour le statut</CardTitle>
          <CardDescription>
            Modifier le statut de la commande et ajouter des notes
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajouter des notes concernant ce changement de statut..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-3 rounded-md flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || status === currentStatus}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour le statut'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Historique des statuts */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des statuts</CardTitle>
          <CardDescription>
            Suivi des changements de statut de la commande
          </CardDescription>
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
                    <div className="flex items-center">
                      <Badge variant="outline" className={getStatusColor(status.status)}>
                        {getStatusLabel(status.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(status.created_at))}
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
    </div>
  );
} 
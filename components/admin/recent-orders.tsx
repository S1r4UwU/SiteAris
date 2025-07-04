import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface AdminRecentOrdersProps {
  orders: Order[];
}

export default function AdminRecentOrders({ orders }: AdminRecentOrdersProps) {
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
  
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune commande récente</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-2">
            <div className="flex flex-col">
              <Link 
                href={`/admin/orders/${order.id}`}
                className="font-medium hover:underline"
              >
                Commande #{order.id.slice(0, 8)}
              </Link>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(order.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 
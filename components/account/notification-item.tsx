"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
}

interface NotificationItemProps {
  notification: Notification;
  icon: React.ReactNode;
}

export default function NotificationItem({ notification, icon }: NotificationItemProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fonction pour marquer une notification comme lue
  const markAsRead = async () => {
    if (notification.read) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
        
      if (error) throw error;
      
      // Rafraîchir la page pour mettre à jour la liste
      router.refresh();
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`border-l-4 ${notification.read ? 'border-gray-200' : 'border-primary'} pl-4 py-3 pr-2 rounded-r-md ${notification.read ? 'bg-white' : 'bg-primary/5'}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDate(new Date(notification.created_at))}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {notification.action_url && (
            <Button variant="outline" size="sm" asChild>
              <Link href={notification.action_url}>
                Voir
              </Link>
            </Button>
          )}
          
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAsRead}
              disabled={isLoading}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Marquer comme lu</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 
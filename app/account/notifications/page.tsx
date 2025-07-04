import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCircle, Info, AlertTriangle, Calendar, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationItem from '@/components/account/notification-item';

interface Notification {
  id: string;
  user_id: string;
  type: 'ORDER_UPDATE' | 'PAYMENT_REMINDER' | 'INTERVENTION_SCHEDULED' | 'DOCUMENT_AVAILABLE' | 'SYSTEM_MESSAGE';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
}

export default async function NotificationsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Récupérer les notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
    
  // Séparer les notifications lues et non lues
  const unreadNotifications = notifications?.filter(notification => !notification.read) || [];
  const readNotifications = notifications?.filter(notification => notification.read) || [];
  
  // Fonction pour obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return <Package2 className="h-5 w-5 text-blue-500" />;
      case 'PAYMENT_REMINDER':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'INTERVENTION_SCHEDULED':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'DOCUMENT_AVAILABLE':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'SYSTEM_MESSAGE':
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Gérez vos notifications et alertes
        </p>
      </div>
      
      <Tabs defaultValue="unread" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="unread" className="relative">
              Non lues
              {unreadNotifications.length > 0 && (
                <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {unreadNotifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="read">Lues</TabsTrigger>
          </TabsList>
          
          {unreadNotifications.length > 0 && (
            <form action="/api/notifications/mark-all-read" method="post">
              <Button type="submit" variant="outline" size="sm">
                Tout marquer comme lu
              </Button>
            </form>
          )}
        </div>
        
        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications non lues
              </CardTitle>
              <CardDescription>
                {unreadNotifications.length} notification{unreadNotifications.length !== 1 ? 's' : ''} non lue{unreadNotifications.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreadNotifications.length > 0 ? (
                <div className="space-y-4">
                  {unreadNotifications.map((notification: Notification) => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                      icon={getNotificationIcon(notification.type)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">Aucune notification non lue</h3>
                  <p className="mt-2 text-muted-foreground">
                    Vous n'avez pas de notifications non lues pour le moment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Toutes les notifications
              </CardTitle>
              <CardDescription>
                {notifications?.length || 0} notification{notifications?.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification: Notification) => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                      icon={getNotificationIcon(notification.type)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">Aucune notification</h3>
                  <p className="mt-2 text-muted-foreground">
                    Vous n'avez pas encore reçu de notifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="read">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications lues
              </CardTitle>
              <CardDescription>
                {readNotifications.length} notification{readNotifications.length !== 1 ? 's' : ''} lue{readNotifications.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readNotifications.length > 0 ? (
                <div className="space-y-4">
                  {readNotifications.map((notification: Notification) => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                      icon={getNotificationIcon(notification.type)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-lg font-medium">Aucune notification lue</h3>
                  <p className="mt-2 text-muted-foreground">
                    Vous n'avez pas encore de notifications marquées comme lues
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
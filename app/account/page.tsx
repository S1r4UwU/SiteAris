import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardSummary from '@/components/account/dashboard-summary';
import UpcomingServices from '@/components/account/upcoming-services';
import RecentDocuments from '@/components/account/recent-documents';
import AccountActions from '@/components/account/account-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ArrowRight } from 'lucide-react';

export default async function AccountDashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  // Récupérer la session utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Récupérer les informations utilisateur
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  // Récupérer les notifications non lues
  const { count: unreadNotificationsCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('read', false);
    
  // Récupérer les notifications récentes
  const { data: recentNotifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // Utiliser 0 comme valeur par défaut si unreadNotificationsCount est null
  const notificationCount = unreadNotificationsCount || 0;
  const hasUnreadNotifications = notificationCount > 0;
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour, {userData?.first_name || 'Bienvenue'}
          </h1>
          <p className="text-muted-foreground">
            Voici un aperçu de vos services et activités
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <Link href="/services">
              Découvrir nos services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Métriques principales */}
      <DashboardSummary userId={session.user.id} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
                {hasUnreadNotifications && (
                  <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                    {notificationCount}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Alertes et messages importants
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotifications && recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="border-l-4 border-primary pl-4 py-2">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href="/account/notifications">
                    Voir toutes les notifications
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">
                  Aucune notification récente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Prochaines interventions */}
        <UpcomingServices userId={session.user.id} />
        
        {/* Documents récents */}
        <RecentDocuments userId={session.user.id} />
      </div>
      
      {/* Actions rapides */}
      <div className="mt-6">
        <AccountActions hasNewNotifications={hasUnreadNotifications} />
      </div>
    </div>
  );
} 
import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { LayoutDashboard, FileText, Bell, Settings, User, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
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
  
  // Récupérer le nombre de notifications non lues
  const { count: notificationsCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('read', false);
  
  const navigation = [
    { name: 'Tableau de bord', href: '/account', icon: LayoutDashboard },
    { name: 'Mes commandes', href: '/account/orders', icon: Package },
    { name: 'Documents', href: '/account/documents', icon: FileText },
    { name: 'Notifications', href: '/account/notifications', icon: Bell, badge: notificationsCount },
    { name: 'Profil', href: '/account/profile', icon: User },
    { name: 'Paramètres', href: '/account/settings', icon: Settings },
  ];
  
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="text-xl font-bold text-primary">
              SiteAris
            </Link>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-primary"
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary" aria-hidden="true" />
                  {item.name}
                  {item.badge ? (
                    <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-primary text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <form action="/api/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white w-full border-b border-gray-200 py-2 px-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          SiteAris
        </Link>
        <div className="flex items-center">
          <Link href="/account/notifications" className="relative p-2 mr-2">
            <Bell className="h-5 w-5" />
            {notificationsCount ? (
              <span className="absolute top-1 right-1 inline-block w-2 h-2 bg-primary rounded-full"></span>
            ) : null}
          </Link>
          <Link href="/account/profile">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              {userData?.first_name?.[0] || session.user.email?.[0] || 'U'}
            </div>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 
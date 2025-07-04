import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { 
  LayoutDashboard, 
  Users, 
  Package2, 
  Settings, 
  Calendar, 
  FileText, 
  LogOut,
  Menu,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Vérifier si l'utilisateur est administrateur
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (!userData || userData.role !== 'ADMIN') {
    redirect('/');
  }
  
  // Menu de navigation administrateur
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Commandes', href: '/admin/orders', icon: Package2 },
    { name: 'Utilisateurs', href: '/admin/users', icon: Users },
    { name: 'Services', href: '/admin/services', icon: FileText },
    { name: 'Interventions', href: '/admin/interventions', icon: Calendar },
    { name: 'Statistiques', href: '/admin/stats', icon: BarChart3 },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/admin" className="text-xl font-bold text-primary">
              SiteAris Admin
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
      <div className="md:hidden bg-white w-full border-b border-gray-200 py-2 px-4 flex items-center justify-between fixed top-0 z-10">
        <Link href="/admin" className="text-xl font-bold text-primary">
          SiteAris Admin
        </Link>
        <button className="p-2">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 
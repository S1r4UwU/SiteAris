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
  BarChart3,
  FileBarChart,
  MessageSquare
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
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
    redirect('/account');
  }
  
  const isAdmin = user.role === 'ADMIN';
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r p-4">
        <div className="flex items-center mb-6">
          <h1 className="text-xl font-bold">Administration</h1>
        </div>
        
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Tableau de bord
          </Link>
          
          {isAdmin && (
            <Link href="/admin/users" className="flex items-center p-2 rounded-md hover:bg-gray-100">
              <Users className="mr-2 h-5 w-5" />
              Utilisateurs
            </Link>
          )}
          
          <Link href="/admin/services" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <Package2 className="mr-2 h-5 w-5" />
            Services
          </Link>
          
          <Link href="/admin/orders" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <FileText className="mr-2 h-5 w-5" />
            Commandes
          </Link>
          
          <Link href="/admin/planning" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <Calendar className="mr-2 h-5 w-5" />
            Planning
          </Link>
          
          <Link href="/admin/stats" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <BarChart3 className="mr-2 h-5 w-5" />
            Statistiques
          </Link>
          
          <Link href="/admin/reports" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <FileBarChart className="mr-2 h-5 w-5" />
            Rapports
          </Link>
          
          <Link href="/admin/support" className="flex items-center p-2 rounded-md hover:bg-gray-100">
            <MessageSquare className="mr-2 h-5 w-5" />
            Support Chat
          </Link>
          
          {isAdmin && (
            <Link href="/admin/settings" className="flex items-center p-2 rounded-md hover:bg-gray-100">
              <Settings className="mr-2 h-5 w-5" />
              Paramètres
            </Link>
          )}
          
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center p-2 rounded-md hover:bg-gray-100 text-red-600">
              <LogOut className="mr-2 h-5 w-5" />
              Déconnexion
            </button>
          </form>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
} 
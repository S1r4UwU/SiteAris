import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/account/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginHistoryTable from '@/components/account/login-history-table';

export default async function ProfilePage() {
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
    
  // Récupérer l'historique de connexion
  const { data: loginHistory } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', session.user.id)
    .order('login_at', { ascending: false })
    .limit(10);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profil utilisateur</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et paramètres de sécurité
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles et professionnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={userData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique de connexion</CardTitle>
              <CardDescription>
                Consultez l'historique de vos connexions récentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginHistoryTable loginHistory={loginHistory || []} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Changer de mot de passe</CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/auth/reset-password" method="post" className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="current-password" className="text-sm font-medium">
                    Mot de passe actuel
                  </label>
                  <input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    className="border rounded-md p-2"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    className="border rounded-md p-2"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="border rounded-md p-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Mettre à jour le mot de passe
                </button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
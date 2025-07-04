import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PreferencesForm from '@/components/account/preferences-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Globe, Moon } from 'lucide-react';

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Récupérer les préférences utilisateur
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
    
  // Si les préférences n'existent pas, créer des préférences par défaut
  if (!preferences) {
    const defaultPreferences = {
      user_id: session.user.id,
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      language: 'fr',
      theme: 'light',
    };
    
    await supabase
      .from('user_preferences')
      .insert(defaultPreferences);
      
    return redirect('/account/settings');
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de compte
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Préférences de notification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Préférences de notification
            </CardTitle>
            <CardDescription>
              Configurez comment vous souhaitez être notifié
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesForm preferences={preferences} />
          </CardContent>
        </Card>
        
        {/* Préférences d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="mr-2 h-5 w-5" />
              Préférences d'affichage
            </CardTitle>
            <CardDescription>
              Personnalisez votre expérience utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Thème</h3>
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 rounded-md border ${
                      preferences.theme === 'light' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background'
                    }`}
                    disabled={preferences.theme === 'light'}
                  >
                    Clair
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md border ${
                      preferences.theme === 'dark' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background'
                    }`}
                    disabled={preferences.theme === 'dark'}
                  >
                    Sombre
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md border ${
                      preferences.theme === 'system' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background'
                    }`}
                    disabled={preferences.theme === 'system'}
                  >
                    Système
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Le thème sombre sera bientôt disponible
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Préférences de langue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Langue
            </CardTitle>
            <CardDescription>
              Choisissez votre langue préférée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Langue de l'interface</h3>
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 rounded-md border ${
                      preferences.language === 'fr' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background'
                    }`}
                    disabled={preferences.language === 'fr'}
                  >
                    Français
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md border ${
                      preferences.language === 'en' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background'
                    }`}
                    disabled={preferences.language === 'en'}
                  >
                    English
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  L'interface en anglais sera bientôt disponible
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Suppression de compte */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-medium mb-2">Supprimer votre compte</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cette action est irréversible et supprimera toutes vos données personnelles, commandes et documents.
              </p>
              <button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md text-sm"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.');
                  }
                }}
              >
                Supprimer mon compte
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase/helpers';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface UserPreferences {
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  language: string;
  theme: string;
}

interface PreferencesFormProps {
  preferences: UserPreferences;
}

export default function PreferencesForm({ preferences }: PreferencesFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email_notifications: preferences.email_notifications,
    sms_notifications: preferences.sms_notifications,
    push_notifications: preferences.push_notifications,
  });
  
  const handleChange = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          email_notifications: formData.email_notifications,
          sms_notifications: formData.sms_notifications,
          push_notifications: formData.push_notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', preferences.user_id);
        
      if (error) throw error;
      
      toast.success('Préférences mises à jour avec succès');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_notifications">Notifications par email</Label>
            <p className="text-sm text-muted-foreground">
              Recevez des mises à jour sur vos commandes et services par email
            </p>
          </div>
          <Switch
            id="email_notifications"
            checked={formData.email_notifications}
            onCheckedChange={() => handleChange('email_notifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms_notifications">Notifications par SMS</Label>
            <p className="text-sm text-muted-foreground">
              Recevez des alertes importantes par SMS (interventions, rappels)
            </p>
          </div>
          <Switch
            id="sms_notifications"
            checked={formData.sms_notifications}
            onCheckedChange={() => handleChange('sms_notifications')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push_notifications">Notifications push</Label>
            <p className="text-sm text-muted-foreground">
              Recevez des notifications dans votre navigateur
            </p>
          </div>
          <Switch
            id="push_notifications"
            checked={formData.push_notifications}
            onCheckedChange={() => handleChange('push_notifications')}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Mise à jour...' : 'Enregistrer les préférences'}
      </Button>
    </form>
  );
} 
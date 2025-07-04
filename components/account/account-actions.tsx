'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart, FileText, Bell, Settings, User, Download } from 'lucide-react';

interface AccountActionsProps {
  hasNewNotifications?: boolean;
}

export default function AccountActions({ hasNewNotifications = false }: AccountActionsProps) {
  // Liste des actions rapides
  const quickActions = [
    {
      label: 'Nos services',
      description: 'Découvrez notre catalogue',
      icon: <ShoppingCart className="h-5 w-5" />,
      href: '/services',
      variant: 'default' as const
    },
    {
      label: 'Mes documents',
      description: 'Factures et rapports',
      icon: <FileText className="h-5 w-5" />,
      href: '/account/documents',
      variant: 'outline' as const
    },
    {
      label: 'Notifications',
      description: hasNewNotifications ? 'Nouvelles notifications' : 'Centre de notifications',
      icon: <Bell className="h-5 w-5" />,
      href: '/account/notifications',
      variant: hasNewNotifications ? 'secondary' as const : 'outline' as const,
      badge: hasNewNotifications
    },
    {
      label: 'Mon profil',
      description: 'Gérer mes informations',
      icon: <User className="h-5 w-5" />,
      href: '/account/profile',
      variant: 'outline' as const
    },
    {
      label: 'Paramètres',
      description: 'Préférences du compte',
      icon: <Settings className="h-5 w-5" />,
      href: '/account/settings',
      variant: 'outline' as const
    },
    {
      label: 'Assistance',
      description: 'Contacter le support',
      icon: <Download className="h-5 w-5" />,
      href: '/support',
      variant: 'outline' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Actions rapides</CardTitle>
        <CardDescription>
          Accès direct aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto flex-col py-4 px-3 justify-start items-start space-y-2 text-left relative"
              asChild
            >
              <Link href={action.href}>
                {action.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                )}
                <div className="bg-primary/10 p-2 rounded-full">
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
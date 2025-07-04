import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  role: string;
  created_at: string;
}

interface AdminRecentUsersProps {
  users: User[];
}

export default function AdminRecentUsers({ users }: AdminRecentUsersProps) {
  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'USER':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  // Fonction pour obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'STAFF':
        return 'Personnel';
      case 'USER':
        return 'Client';
      default:
        return role;
    }
  };
  
  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };
  
  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun utilisateur récent</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback>{getUserInitials(user.id)}</AvatarFallback>
              </Avatar>
              <div>
                <Link 
                  href={`/admin/users/${user.id}`}
                  className="font-medium hover:underline"
                >
                  Utilisateur #{user.id.slice(0, 8)}
                </Link>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 
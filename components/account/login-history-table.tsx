"use client";

import { formatDate } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';

interface LoginHistoryItem {
  id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  login_at: string;
  success: boolean;
}

interface LoginHistoryTableProps {
  loginHistory: LoginHistoryItem[];
}

export default function LoginHistoryTable({ loginHistory }: LoginHistoryTableProps) {
  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return 'Inconnu';
    
    // Extraire des informations pertinentes de l'user agent
    const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera|MSIE)\/?\s*(\d+(\.\d+)?)/i);
    const osMatch = userAgent.match(/(Windows|Mac|Linux|Android|iOS|iPhone|iPad)[\s\w/\.]*(\d+(\.\d+)?)?/i);
    
    const browser = browserMatch ? browserMatch[1] : 'Inconnu';
    const os = osMatch ? osMatch[1] : 'Inconnu';
    
    return `${browser} sur ${os}`;
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Adresse IP</TableHead>
            <TableHead className="hidden md:table-cell">Appareil</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loginHistory.length > 0 ? (
            loginHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {formatDate(new Date(item.login_at))}
                </TableCell>
                <TableCell>{item.ip_address || 'Inconnue'}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatUserAgent(item.user_agent)}
                </TableCell>
                <TableCell>
                  {item.success ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      <span className="hidden sm:inline">Réussi</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="mr-1 h-4 w-4" />
                      <span className="hidden sm:inline">Échec</span>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                Aucun historique de connexion disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 
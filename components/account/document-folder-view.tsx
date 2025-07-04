'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  Search,
  Plus 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  created_at: string;
  file_size: number;
  folder?: string;
}

interface DocumentFolderViewProps {
  documents: DocumentItem[];
  isLoading?: boolean;
}

type FolderStructure = {
  [key: string]: {
    name: string;
    documents: DocumentItem[];
    isOpen?: boolean;
  }
};

export default function DocumentFolderView({ documents = [], isLoading = false }: DocumentFolderViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure>(() => {
    // Initialiser la structure des dossiers
    const structure: FolderStructure = {
      "factures": {
        name: "Factures",
        documents: [],
      },
      "devis": {
        name: "Devis",
        documents: [],
      },
      "rapports": {
        name: "Rapports techniques",
        documents: [],
      },
      "certificats": {
        name: "Certificats",
        documents: [],
      },
      "autres": {
        name: "Autres documents",
        documents: [],
      }
    };
    
    // Distribuer les documents dans les dossiers appropriés
    documents.forEach(doc => {
      if (doc.type === 'INVOICE') {
        structure.factures.documents.push(doc);
      } else if (doc.type === 'QUOTE') {
        structure.devis.documents.push(doc);
      } else if (doc.type === 'REPORT') {
        structure.rapports.documents.push(doc);
      } else if (doc.type === 'CERTIFICATE') {
        structure.certificats.documents.push(doc);
      } else {
        structure.autres.documents.push(doc);
      }
    });
    
    return structure;
  });
  
  // Fonction pour ouvrir/fermer un dossier
  const toggleFolder = (folderId: string) => {
    setFolderStructure(prev => ({
      ...prev,
      [folderId]: {
        ...prev[folderId],
        isOpen: !prev[folderId].isOpen
      }
    }));
  };
  
  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Filtrer les documents selon la recherche
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const hasFilteredResults = searchQuery.length > 0 && filteredDocuments.length > 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Documents par catégorie</CardTitle>
        <div className="relative w-full max-w-xs ml-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un document..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-pulse">Chargement des documents...</div>
          </div>
        ) : hasFilteredResults ? (
          // Affichage des résultats de recherche
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {filteredDocuments.length} résultat{filteredDocuments.length > 1 ? 's' : ''} trouvé{filteredDocuments.length > 1 ? 's' : ''}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      {doc.type === 'INVOICE' ? 'Facture' : 
                       doc.type === 'QUOTE' ? 'Devis' : 
                       doc.type === 'REPORT' ? 'Rapport' : 
                       doc.type === 'CERTIFICATE' ? 'Certificat' : 
                       doc.type === 'CONTRACT' ? 'Contrat' : 
                       'Document'}
                    </TableCell>
                    <TableCell>{formatDate(new Date(doc.created_at))}</TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/api/documents/${doc.id}`}>
                          <Download className="mr-1 h-4 w-4" />
                          Télécharger
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : searchQuery.length > 0 ? (
          // Pas de résultats de recherche
          <div className="text-center py-8">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-30" />
            <h3 className="mt-3 font-medium">Aucun document trouvé</h3>
            <p className="text-sm text-muted-foreground">
              Aucun document ne correspond à votre recherche
            </p>
          </div>
        ) : documents.length > 0 ? (
          // Affichage par dossiers
          <div className="space-y-3">
            {Object.entries(folderStructure).map(([folderId, folder]) => (
              <div key={folderId} className="border rounded-md overflow-hidden">
                <div 
                  className="bg-muted/40 p-2 flex items-center justify-between cursor-pointer hover:bg-muted/60"
                  onClick={() => toggleFolder(folderId)}
                >
                  <div className="flex items-center">
                    {folder.isOpen ? (
                      <FolderOpen className="h-5 w-5 text-muted-foreground mr-2" />
                    ) : (
                      <Folder className="h-5 w-5 text-muted-foreground mr-2" />
                    )}
                    <span className="font-medium">{folder.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({folder.documents.length})
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${folder.isOpen ? 'rotate-90' : ''}`} />
                </div>
                
                {folder.isOpen && folder.documents.length > 0 && (
                  <div className="p-2">
                    <div className="divide-y">
                      {folder.documents.map(doc => (
                        <div key={doc.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-primary/10 p-1.5 rounded mr-3">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(new Date(doc.created_at))} • {formatFileSize(doc.file_size)}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/api/documents/${doc.id}`}>
                              <Download className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {folder.isOpen && folder.documents.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="text-sm">Aucun document dans ce dossier</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Pas de documents du tout
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <h3 className="mt-4 text-lg font-medium">Aucun document</h3>
            <p className="text-muted-foreground mt-2">
              Vous n'avez pas encore de documents disponibles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentFolderView from '@/components/account/document-folder-view';

interface Document {
  id: string;
  name: string;
  description: string | null;
  type: 'INVOICE' | 'QUOTE' | 'REPORT' | 'CONTRACT' | 'CERTIFICATE';
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  order_id: string | null;
}

export default async function DocumentsPage({ 
  searchParams 
}: { 
  searchParams: { type?: string; q?: string } 
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth');
  }
  
  // Construire la requête avec les filtres
  let query = supabase
    .from('documents')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  
  // Filtre par type
  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('type', searchParams.type.toUpperCase());
  }
  
  // Recherche par nom
  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`);
  }
  
  // Exécuter la requête
  const { data: documents, error } = await query;
  
  // Types de documents disponibles pour le filtre
  const documentTypes = [
    { value: 'all', label: 'Tous les documents' },
    { value: 'INVOICE', label: 'Factures' },
    { value: 'QUOTE', label: 'Devis' },
    { value: 'REPORT', label: 'Rapports' },
    { value: 'CONTRACT', label: 'Contrats' },
    { value: 'CERTIFICATE', label: 'Certificats' },
  ];
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mes documents</h1>
        <p className="text-muted-foreground">
          Consultez et téléchargez vos documents (factures, rapports, certificats)
        </p>
      </div>
      
      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filtrer les documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher par nom..."
                defaultValue={searchParams.q || ''}
                className="w-full rounded-md border border-input pl-8 pr-3 py-2 text-sm"
              />
            </div>
            
            {/* Filtre par type */}
            <select
              name="type"
              defaultValue={searchParams.type || 'all'}
              className="rounded-md border border-input px-3 py-2 text-sm"
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Appliquer les filtres</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Contenu principal */}
      <Tabs defaultValue="folders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="folders">Dossiers</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="recent">Récents</TabsTrigger>
        </TabsList>
        
        {/* Vue par dossiers */}
        <TabsContent value="folders">
          <DocumentFolderView documents={documents || []} />
        </TabsContent>
        
        {/* Vue en liste */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Liste des documents</CardTitle>
              <CardDescription>
                {documents?.length || 0} document{documents?.length !== 1 ? 's' : ''} trouvé{documents?.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* La liste traditionnelle est maintenue mais sera affichée en onglet */}
                {documents && documents.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((document: Document) => (
                      <div key={document.id} className="border rounded-md p-4 flex flex-col">
                        <div className="flex items-start mb-4">
                          <div className="mr-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Search className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{document.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {document.type === 'INVOICE' ? 'Facture' : 
                               document.type === 'QUOTE' ? 'Devis' : 
                               document.type === 'REPORT' ? 'Rapport' : 
                               document.type === 'CONTRACT' ? 'Contrat' : 
                               document.type === 'CERTIFICATE' ? 'Certificat' : 
                               'Document'}
                            </p>
                            {document.description && (
                              <p className="text-sm mt-1">{document.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <a href={`/api/documents/${document.id}`} target="_blank" rel="noopener noreferrer">
                              Télécharger
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="mt-4 text-lg font-medium">Aucun document trouvé</h3>
                    <p className="mt-2 text-muted-foreground">
                      Aucun document ne correspond à vos critères de recherche
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Vue récents */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Documents récents</CardTitle>
              <CardDescription>
                Vos documents les plus récemment ajoutés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.slice(0, 5).map((document: Document) => (
                    <div key={document.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Search className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{document.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ajouté le {new Date(document.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/documents/${document.id}`} target="_blank" rel="noopener noreferrer">
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Aucun document récent</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
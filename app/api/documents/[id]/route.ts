import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    
    // Récupérer les informations du document
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .single();
      
    if (documentError || !document) {
      console.error('Erreur lors de la récupération du document:', documentError);
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur a accès au document
    if (document.user_id !== session.user.id && !document.is_public) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce document' },
        { status: 403 }
      );
    }
    
    // Télécharger le fichier depuis le stockage Supabase
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('documents')
      .download(document.file_path);
      
    if (downloadError || !fileData) {
      console.error('Erreur lors du téléchargement du fichier:', downloadError);
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier' },
        { status: 500 }
      );
    }
    
    // Créer une réponse avec le fichier
    const response = new NextResponse(fileData);
    
    // Ajouter les en-têtes pour le téléchargement
    response.headers.set('Content-Type', document.mime_type);
    response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.name)}"`);
    
    return response;
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 
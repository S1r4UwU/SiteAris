import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/helpers';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const supabase = createServerComponentClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" }, 
        { status: 401 }
      );
    }
    
    // Récupérer le document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error || !document) {
      return NextResponse.json(
        { error: "Document non trouvé" }, 
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur a accès à ce document
    // Un admin peut voir tous les documents, un utilisateur ne peut voir que ses propres documents
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    const isAdmin = userData && userData.role === 'ADMIN';
    
    if (!isAdmin && document.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à ce document" }, 
        { status: 403 }
      );
    }
    
    // Dans un environnement réel, on servirait le fichier depuis un bucket de stockage
    // Pour cette simulation, on renvoie simplement les métadonnées du document
    return NextResponse.json({
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        size: document.file_size,
        created_at: document.created_at,
        download_url: document.file_path
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    );
  }
} 
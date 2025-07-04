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
    
    // Récupérer les informations de la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, orders(*)')
      .eq('id', params.id)
      .single();
      
    if (invoiceError || !invoice) {
      console.error('Erreur lors de la récupération de la facture:', invoiceError);
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur a accès à la facture
    if (invoice.orders.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette facture' },
        { status: 403 }
      );
    }
    
    // Si la facture a un PDF stocké, le télécharger
    if (invoice.pdf_url) {
      // Extraire le chemin du fichier depuis l'URL
      const filePath = invoice.pdf_url.split('/').slice(-1)[0];
      
      // Télécharger le fichier depuis le stockage Supabase
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('invoices')
        .download(filePath);
        
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
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', `attachment; filename="facture-${invoice.invoice_number}.pdf"`);
      
      return response;
    } else {
      // Si pas de PDF stocké, générer une facture à la volée (simulé ici)
      return NextResponse.json(
        { error: 'Génération de facture à la volée non implémentée' },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 
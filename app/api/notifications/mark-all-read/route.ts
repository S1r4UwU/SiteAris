import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
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
    
    // Marquer toutes les notifications de l'utilisateur comme lues
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
      .eq('read', false);
      
    if (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des notifications' },
        { status: 500 }
      );
    }
    
    // Rediriger vers la page des notifications
    return NextResponse.redirect(new URL('/account/notifications', req.url));
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 
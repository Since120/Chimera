import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function handleAuthRedirect() {
  const supabase = createClientComponentClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Einfache Prüfung: Wenn kein Session-Token vorhanden ist, zur Login-Seite umleiten
  if (!session) {
    return NextResponse.redirect('/auth/login');
  }

  // Wenn ein Token vorhanden ist, lassen wir die Anfrage durch
  // Die eigentliche Validierung und Weiterleitung erfolgt clientseitig im AuthContext/AuthGuard
  return NextResponse.next();
}
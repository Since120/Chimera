import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function handleAuthRedirect(request: NextRequest) {
  console.log('[Middleware] Running auth check...');
  const res = NextResponse.next(); // Wichtig: Response-Objekt *vorher* erstellen

  // Erstelle den Middleware-Client
  const supabase = createMiddlewareClient({ req: request, res });

  // Hole die Session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
     console.error('[Middleware] Error getting session:', error.message);
     // Im Fehlerfall eventuell zur Fehlerseite oder Login? Fürs Erste durchlassen und auf Client hoffen.
     return res;
  }

  if (!session) {
    // Absolute URL für Redirect erstellen
    const redirectUrl = new URL('/login', request.url); // Sicherstellen, dass /login der korrekte Pfad ist
    console.log(`[Middleware] No session found, redirecting to: ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl);
  }

  console.log('[Middleware] Session found, allowing request.');
  // Wichtig: Das Response-Objekt zurückgeben, damit Cookies aktualisiert/gelesen werden können
  return res;
}

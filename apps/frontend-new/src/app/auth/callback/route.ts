import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = '/dashboard';

  console.log('[Callback Route] Received request. URL:', request.url);

  if (!code) {
    console.error('[Callback Route] No code found in URL.');
    return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin));
  }

  console.log('[Callback Route] Code found:', code);

  // Logge alle verfügbaren Cookies aus dem Header
  console.log('[Callback Route] Checking for cookies in request:');
  const cookieHeader = request.headers.get('cookie');
  let hasPkceCookie = false;

  if (cookieHeader) {
    console.log('[Callback Route] Cookie header found:', cookieHeader);
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || 'sntjwhlryzozusnpaglx';
    const pkceCookieName = `sb-${projectRef}-auth-token-code-verifier`;

    // Suche nach dem PKCE-Cookie im Header
    cookieHeader.split(';').forEach(cookie => {
      const trimmedCookie = cookie.trim();
      console.log(`  ${trimmedCookie}`);

      if (trimmedCookie.startsWith(`${pkceCookieName}=`)) {
        hasPkceCookie = true;
        console.log('[Callback Route] PKCE cookie found in header!');
      }
    });
  } else {
    console.log('[Callback Route] No cookie header found in request');
  }

  // Erstelle den Supabase Client für Route Handler
  // Wichtig: Cookies als Funktion übergeben, die das cookieStore-Objekt zurückgibt
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore
  });

  if (!hasPkceCookie) {
    console.error('[Callback Route] PKCE verifier cookie NOT FOUND in header! This may cause the auth flow to fail.');
    // Trotzdem fortfahren und versuchen, den Code auszutauschen
    console.log('[Callback Route] Attempting to exchange code anyway...');
  }

  try {
    console.log('[Callback Route] Attempting to exchange code for session...');
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[Callback Route] Error exchanging code:', exchangeError.message);
      // Leite zum Login mit spezifischem Fehler weiter
      return NextResponse.redirect(new URL(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin));
    }

    console.log('[Callback Route] Code exchange successful. Redirecting to:', next);
    // Erfolgreiche Weiterleitung zum Dashboard
    return NextResponse.redirect(new URL(next, requestUrl.origin));

  } catch (error) {
    console.error('[Callback Route] Unexpected error during code exchange:', error);
    // Leite zum Login mit generischem Fehler weiter
    return NextResponse.redirect(new URL(`/login?error=callback_exception&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, requestUrl.origin));
  }
}

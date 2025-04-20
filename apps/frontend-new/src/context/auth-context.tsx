'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SessionDto, GuildSelectionInfoDto, User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  availableGuilds: GuildSelectionInfoDto[];
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: (redirect?: boolean) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  availableGuilds: [],
  token: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: async () => {},
  refreshSession: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [availableGuilds, setAvailableGuilds] = useState<GuildSelectionInfoDto[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // --- Stabile Funktionen ---
  const handleLogout = useCallback(async (redirect = true) => {
    console.log('[AuthContext Logout] Initiating explicit state reset...');
    setUser(null);
    setAvailableGuilds([]);
    setToken(null);
    setIsAuthenticated(false);
    setLoading(true); // Loading starten

    console.log('handleLogout: Starting logout process...');
    const currentPath = window.location.pathname;
    console.log(`handleLogout: Current path: ${currentPath}, redirect: ${redirect}`);

    const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
    console.log(`handleLogout: Clearing local storage (token key: ${tokenKey})`);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('selectedGuildId');

    try {
      console.log('handleLogout: Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('handleLogout: Supabase signOut error:', error);
      } else {
        console.log('handleLogout: Supabase signOut successful.');
      }

      // Redirect und Loading beenden nach erfolgreichem oder fehlgeschlagenem signOut
      if (redirect && !currentPath.startsWith('/login')) {
        console.log('[AuthContext Logout] Redirecting to /login.');
        router.replace('/login');
      } else {
        console.log(`[AuthContext Logout] No redirect needed or already on login page.`);
      }
      console.log('[AuthContext Logout] Resetting loading state to false after try.');
      setLoading(false); // Loading hier beenden

    } catch (error) {
      console.error('handleLogout: Unexpected signOut error:', error);
      // Auch im Fehlerfall Loading beenden und ggf. Redirect
      if (redirect && !currentPath.startsWith('/login')) {
        console.log('[AuthContext Logout] Redirecting to /login after catch.');
        router.replace('/login');
      }
      console.log('[AuthContext Logout] Resetting loading state to false after catch.');
      setLoading(false); // Loading auch im Fehlerfall beenden
    }
  }, [router]); // router als Abhängigkeit

  const fetchBackendSession = useCallback(async (supabaseToken: string): Promise<SessionDto | null> => {
    console.log('[AuthContext] fetchBackendSession: Fetching backend session with token:', supabaseToken ? `${supabaseToken.substring(0, 10)}...` : 'No token');
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // <-- BACKEND PORT PRÜFEN!
      console.log(`[AuthContext] fetchBackendSession: Calling GET ${apiUrl}/api/v1/auth/session`); // Methode explizit nennen

      const response = await fetch(`${apiUrl}/api/v1/auth/session`, {
        method: 'GET', // Sicherstellen, dass GET korrekt ist
        headers: { Authorization: `Bearer ${supabaseToken}` },
      });

      console.log(`[AuthContext] fetchBackendSession: Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Status ${response.status}`);
        console.error(`[AuthContext] fetchBackendSession: Backend error ${response.status}: ${errorText}`);
        // Hier direkt ausloggen, KEIN FALLBACK
        await handleLogout(false);
        return null;
      }

      const sessionData: SessionDto = await response.json();
      console.log('[AuthContext] fetchBackendSession: Success. User:', sessionData.user?.username);

      // State aktualisieren
      setToken(supabaseToken);
      setUser(sessionData.user);
      setAvailableGuilds(sessionData.availableGuilds || []);
      setIsAuthenticated(true);

      // Token speichern
      const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
      localStorage.setItem(tokenKey, supabaseToken);

      return sessionData; // Session zurückgeben

    } catch (error) {
      console.error('[AuthContext] fetchBackendSession: Network or other fetch error:', error);
      await handleLogout(false);
      return null; // Null zurückgeben
    } finally {
       setLoading(false); // Sicherstellen, dass Loading beendet wird
    }
  }, [handleLogout]); // handleLogout als einzige Abhängigkeit ist korrekt

  // --- Auth State Listener ---
  useEffect(() => {
    console.log('[AuthContext Init Effect] Explicitly resetting state to loading...');
    setUser(null);
    setAvailableGuilds([]);
    setToken(null);
    setIsAuthenticated(false);
    setLoading(true); // Explizit auf true setzen

    console.log('[AuthContext Init Effect] Setting up onAuthStateChange listener and checking session');

    let authListener: { subscription?: { unsubscribe: () => void } } = {};

    try {
      // Zuerst prüfen, ob wir bereits eine Session haben
      const checkExistingSession = async () => {
        console.log('[AuthContext] Checking for existing session...');
        try {
          const { data, error } = await supabase.auth.getSession();

          console.log('[AuthContext] Existing session check result:', {
            hasSession: !!data?.session,
            hasToken: !!data?.session?.access_token,
            error: error ? error.message : null
          });

          if (error) {
            console.error('[AuthContext] Error getting existing session:', error.message);
            setLoading(false);
            return;
          }

          if (data?.session?.access_token) {
            console.log('[AuthContext] Found existing session, fetching backend session...');
            // Direkt den Authentifizierungsstatus setzen, ohne auf Backend zu warten
            setToken(data.session.access_token);
            setIsAuthenticated(true);
            localStorage.setItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token', data.session.access_token);

            // Dann im Hintergrund die Benutzerdaten abrufen
            fetchBackendSession(data.session.access_token);
          } else {
            console.log('[AuthContext] No existing session found');
            setLoading(false);
          }
        } catch (sessionError) {
          console.error('[AuthContext] Unexpected error checking session:', sessionError);
          setLoading(false);
        }
      };

      // Prüfe zuerst auf bestehende Session
      checkExistingSession();

      // Dann setze den Auth State Listener
      const result = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log('[AuthContext] Auth event received:', event, 'Session present:', !!session, 'Token:', session?.access_token ? `${session.access_token.substring(0, 10)}...` : 'none');
          try {
            // Bei SIGNED_OUT nur State zurücksetzen, KEINEN Redirect auslösen
            if (event === 'SIGNED_OUT') {
              console.log('[AuthContext] Processing SIGNED_OUT event - resetting local state only.');
              setUser(null);
              setAvailableGuilds([]);
              setToken(null);
              setIsAuthenticated(false);
              // setLoading hier NICHT ändern, da der Haupt-Logout-Flow dies steuert
              return;
            }

            // Bei allen anderen Events: Wenn Token vorhanden, verwenden
            if (session?.access_token) {
              console.log(`[AuthContext] Processing ${event} with token`);

              // Token im localStorage speichern
              const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
              localStorage.setItem(tokenKey, session.access_token);

              // Backend-Session abrufen
              await fetchBackendSession(session.access_token);
            } else {
              // Kein Token vorhanden bei anderen Events -> Fallback zum State Reset
              console.warn(`[AuthContext] ${event} without token, resetting state.`);
              setUser(null);
              setAvailableGuilds([]);
              setToken(null);
              setIsAuthenticated(false);
              setLoading(false); // Hier Loading beenden, da kein gültiger Login mehr vorliegt
            }
          } catch (error) {
            console.error('[AuthContext] Error in auth state change handler:', error);
            setLoading(false);
          }
        }
      );

      authListener = result.data;
    } catch (error) {
      console.error('[AuthContext] Error setting up auth state change listener:', error);
      setLoading(false);
    }

    return () => {
      console.log('[AuthContext] Removing onAuthStateChange listener');
      try {
        authListener?.subscription?.unsubscribe();
      } catch (error) {
        console.error('[AuthContext] Error unsubscribing from auth listener:', error);
      }
    };
  }, [fetchBackendSession, handleLogout]); // Stabile Abhängigkeiten

  // --- Other Functions ---
  const login = useCallback(async () => {
    console.log('[AuthContext Login] Attempting to initiate Discord OAuth flow...');
    localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token');
    localStorage.removeItem('selectedGuildId');
    setLoading(true); // Ladezustand setzen

    try {
      const callbackUrl = `${window.location.protocol}//${window.location.host}/auth/callback`;
      console.log('[AuthContext Login] Using callback URL:', callbackUrl);

      // Lösche alte PKCE-Cookies zur Sicherheit
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || 'sntjwhlryzozusnpaglx'; // Hole Ref aus Env oder hardcode
      document.cookie = `sb-${projectRef}-auth-token-code-verifier=; path=/; max-age=0; SameSite=Lax; secure=${window.location.protocol === 'https:'}`;
      console.log('[AuthContext Login] Attempted to clear old PKCE cookie.');

      // Logge alle vorhandenen Cookies vor dem Login
      console.log('[AuthContext Login] Existing cookies before OAuth flow:');
      document.cookie.split(';').forEach(cookie => {
        console.log(`  ${cookie.trim()}`);
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: callbackUrl,
          scopes: 'identify guilds',
        },
      });

      if (error) {
        console.error('[AuthContext Login] Supabase signInWithOAuth Error:', error);
        // Zeige Fehler dem Benutzer an? z.B. mit toast
        // toast.error(`Login Fehler: ${error.message}`);
        setLoading(false); // Ladezustand beenden
        throw error; // Fehler weiterwerfen oder behandeln
      }

      console.log('[AuthContext Login] signInWithOAuth successful. Redirect URL:', data?.url);
      console.log('[AuthContext Login] Checking for PKCE cookie immediately after call...');
      // Lese ALLE Cookies direkt nach dem Aufruf
      const allCookies = document.cookie;
      console.log('[AuthContext Login] document.cookie after signInWithOAuth:', allCookies);
      // Versuche, das spezifische Cookie zu finden
      const pkceCookieName = `sb-${projectRef}-auth-token-code-verifier`;
      const pkceCookie = allCookies.split('; ').find(row => row.startsWith(`${pkceCookieName}=`));
      console.log(`[AuthContext Login] PKCE Cookie (${pkceCookieName}) found immediately after call:`, pkceCookie ? 'Yes' : 'No');

      if (pkceCookie) {
        console.log('[AuthContext Login] PKCE Cookie value (first 10 chars):', pkceCookie.split('=')[1].substring(0, 10) + '...');

        // Versuche, die Cookie-Attribute zu ermitteln
        try {
          // Simuliere einen Cookie-Zugriff, um zu sehen, ob er zugänglich ist
          const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${pkceCookieName}=`))
            ?.split('=')[1];

          console.log('[AuthContext Login] Cookie accessible via document.cookie:', !!cookieValue);
        } catch (e) {
          console.error('[AuthContext Login] Error accessing cookie:', e);
        }
      } else {
        console.error('[AuthContext Login] PKCE Cookie NOT FOUND immediately after signInWithOAuth call!');
        console.log('[AuthContext Login] This suggests the cookie is not being set correctly by Supabase.');
        console.log('[AuthContext Login] Please check Supabase configuration in the Supabase dashboard.');
        console.log('[AuthContext Login] Ensure PKCE is enabled for the Discord provider.');
      }

      // Logge alle Cookies nach dem Initiieren des OAuth-Flows
      console.log('[AuthContext Login] All cookies after initiating OAuth flow:');
      document.cookie.split(';').forEach(cookie => {
        console.log(`  ${cookie.trim()}`);
      });

      // Normalerweise erfolgt hier ein Redirect durch Supabase/Browser,
      // der Ladezustand bleibt bestehen, bis der Nutzer zurückkehrt.
      // Wir setzen loading NICHT zurück auf false hier.

    } catch (error) {
      console.error('[AuthContext Login] Unexpected error during login initiation:', error);
      setLoading(false); // Ladezustand im Fehlerfall beenden
      // Ggf. Fehler im UI anzeigen
    }
  }, [supabase.auth, setLoading]); // Abhängigkeiten hinzufügen

  const refreshSession = useCallback(async () => {
    console.log('[AuthContext] refreshSession called...');
    try {
      setLoading(true); // Setze loading auf true während der Aktualisierung

      console.log('[AuthContext] refreshSession: Getting current session from Supabase...');
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthContext] refreshSession: Error getting session:', error.message);
        await handleLogout(false); // Ohne Redirect, da wir vielleicht schon auf der Login-Seite sind
        return;
      }

      console.log('[AuthContext] refreshSession: Session result:', {
        hasSession: !!data?.session,
        hasToken: !!data?.session?.access_token
      });

      if (data?.session?.access_token) {
        console.log('[AuthContext] refreshSession: Valid session found, fetching backend session...');
        await fetchBackendSession(data.session.access_token);
      } else {
        console.warn('[AuthContext] refreshSession: No valid Supabase session found.');
        await handleLogout(true); // Mit Redirect zur Login-Seite
      }
    } catch (error) {
      console.error('[AuthContext] refreshSession: Unexpected error:', error);
      setLoading(false); // Stelle sicher, dass loading zurückgesetzt wird
      await handleLogout(false);
    }
  }, [fetchBackendSession, handleLogout]);

  // --- Redirect Effect ---
  useEffect(() => {
    console.log(`[AuthContext Redirect Check] loading: ${loading}, isAuthenticated: ${isAuthenticated}, pathname: ${pathname}`);

    // Wenn wir nicht mehr laden und authentifiziert sind, aber nicht auf dem Dashboard oder der Callback-Seite
    if (!loading && isAuthenticated &&
        !pathname.startsWith('/dashboard') &&
        !pathname.startsWith('/auth/callback')) {

      // Kurze Verzögerung, um Race Conditions zu vermeiden
      const redirectTimer = setTimeout(() => {
        console.log('[AuthContext Redirect Action] Redirecting to /dashboard...');
        router.replace('/dashboard');
      }, 100);

      return () => clearTimeout(redirectTimer);
    }

    // Wenn wir nicht mehr laden und NICHT authentifiziert sind, aber auf einer geschützten Seite
    if (!loading && !isAuthenticated && pathname.startsWith('/dashboard')) {
      // Kurze Verzögerung, um Race Conditions zu vermeiden
      const redirectTimer = setTimeout(() => {
        console.log('[AuthContext Redirect Action] Not authenticated, redirecting to /login...');
        router.replace('/login');
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [loading, isAuthenticated, pathname, router]);

  // --- Memoized Context Value ---
  const contextValue = useMemo(() => {
    console.log('[AuthContext] Recalculating context value.');
    return {
      user,
      availableGuilds,
      token,
      loading,
      isAuthenticated,
      login,
      logout: handleLogout,
      refreshSession,
    };
  }, [user, availableGuilds, token, loading, isAuthenticated, login, handleLogout, refreshSession]);

  console.log(`[AuthContext Render] State before providing - loading: ${contextValue.loading}, isAuthenticated: ${contextValue.isAuthenticated}`);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

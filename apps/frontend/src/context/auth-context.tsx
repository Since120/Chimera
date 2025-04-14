'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SessionDto, GuildSelectionInfoDto, UserProfileDto } from 'shared-types';

// Typdefinitionen
export type User = Omit<UserProfileDto, 'created_at' | 'updated_at'>;

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
    console.log('handleLogout: Starting logout...');
    const currentPath = window.location.pathname;
    
    // State zurücksetzen
    setUser(null);
    setAvailableGuilds([]);
    setToken(null);
    setIsAuthenticated(false);
    setLoading(false);

    // Lokalen Storage leeren
    const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('selectedGuildId');

    // Supabase abmelden
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('handleLogout: Supabase signOut error:', error);
      else console.log('handleLogout: Supabase signOut successful.');
    } catch (error) {
      console.error('handleLogout: Unexpected signOut error:', error);
    }

    // Ggf. Redirect
    if (redirect && !currentPath.startsWith('/auth/login')) {
      console.log('handleLogout: Redirecting to /auth/login');
      router.push('/auth/login');
    }
  }, [router]);

  const fetchBackendSession = useCallback(async (supabaseToken: string): Promise<SessionDto | null> => {
    console.log('[AuthContext] fetchBackendSession: Fetching backend session...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/v1/auth/session`, {
        headers: { Authorization: `Bearer ${supabaseToken}` },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Status ${response.status}`);
        console.error(`[AuthContext] fetchBackendSession: Error ${response.status}: ${errorText}`);
        await handleLogout(false);
        return null;
      }

      const sessionData: SessionDto = await response.json();
      console.log('[AuthContext] fetchBackendSession: Success. User:', sessionData.user?.username);

      // State aktualisieren, aber nur wenn sich wirklich etwas geändert hat
      if (token !== supabaseToken) setToken(supabaseToken);
      
      // Optimierung - nur setzen wenn sich etwas geändert hat
      const userChanged = JSON.stringify(user) !== JSON.stringify(sessionData.user);
      if (userChanged) setUser(sessionData.user);
      
      const guildsChanged = JSON.stringify(availableGuilds) !== JSON.stringify(sessionData.availableGuilds);
      if (guildsChanged) setAvailableGuilds(sessionData.availableGuilds);

      setIsAuthenticated(true);

      // Token speichern
      const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token';
      localStorage.setItem(tokenKey, supabaseToken);
      return sessionData;
    } catch (error) {
      console.error('[AuthContext] fetchBackendSession: Unexpected error:', error);
      await handleLogout(false);
      return null;
    } finally {
      // Ensure loading is false after attempting fetch
      setLoading(false);
    }
  }, [handleLogout, user, token, availableGuilds]);

  // --- Auth State Listener ---
  useEffect(() => {
    console.log('[AuthContext] Setting up onAuthStateChange listener');
    setLoading(true); // Set loading true when listener starts

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Event:', event, 'Session present:', !!session);
        if (event === 'INITIAL_SESSION') {
            if (session?.access_token) {
                await fetchBackendSession(session.access_token);
            } else {
                // No initial session, we are not authenticated
                await handleLogout(false); // Reset state without redirect
            }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.access_token) {
               await fetchBackendSession(session.access_token);
            } else {
               // Should not happen for SIGNED_IN/TOKEN_REFRESHED, but handle defensively
               await handleLogout(false);
            }
        } else if (event === 'SIGNED_OUT') {
          await handleLogout(true); // Logout with redirect
        }
      }
    );

    return () => {
      console.log('[AuthContext] Removing onAuthStateChange listener');
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchBackendSession, handleLogout]); // Stabile Abhängigkeiten

  // --- Other Functions ---
  const login = useCallback(async () => {
    console.log('Login: Starting Supabase Discord OAuth Flow...');
    localStorage.removeItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token');
    localStorage.removeItem('selectedGuildId');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`,
        scopes: 'identify guilds',
      },
    });
    if (error) console.error('Login Error:', error);
  }, []);

  const refreshSession = useCallback(async () => {
    console.log('[AuthContext] refreshSession called...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      await fetchBackendSession(session.access_token);
    } else {
      console.warn('[AuthContext] refreshSession: No valid Supabase session found.');
      await handleLogout(true);
    }
  }, [fetchBackendSession, handleLogout]);

  // --- Redirect Effect ---
  useEffect(() => {
    console.log(`[AuthContext Redirect Check] loading: ${loading}, isAuthenticated: ${isAuthenticated}, pathname: ${pathname}`);
    if (!loading && isAuthenticated && !pathname.startsWith('/dashboard') && !pathname.startsWith('/auth/callback')) {
      console.log('[AuthContext Redirect Action] Redirecting to /dashboard...');
      router.replace('/dashboard');
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
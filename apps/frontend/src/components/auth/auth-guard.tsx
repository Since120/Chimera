'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useGuild } from '@/context/guild-context';

interface AuthGuardProps {
  children: React.ReactNode;
  requireGuild?: boolean;
}

/**
 * AuthGuard: Schützt Routen vor nicht authentifizierten Benutzern
 * und leitet zur Guild-Auswahl weiter, wenn keine Guild ausgewählt ist
 */
export function AuthGuard({ children, requireGuild = true }: AuthGuardProps) {
  const { isAuthenticated, loading, user, token } = useAuth();
  const { currentGuild } = useGuild();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Debug-Ausgabe
  console.log('AuthGuard Status:', {
    isAuthenticated,
    loading,
    user,
    hasToken: !!token,
    selectedGuild: currentGuild,
    isChecking,
    redirectAttempted,
    requireGuild
  });

  useEffect(() => {
    const checkAuth = async () => {
      // Warten, bis der Auth-Status geladen ist
      if (!loading) {
        console.log('Auth loading completed, checking authentication state');

        // Authentifizierungsstatus aus dem AuthContext verwenden

        // Prüfen, ob wir uns auf der Callback-Seite befinden
        const isCallbackPage = window.location.pathname.includes('/auth/callback');

        if (isCallbackPage) {
          console.log('On callback page, skipping auth check');
          setIsChecking(false);
          return;
        }

        if (!isAuthenticated && !redirectAttempted) {
          // Benutzer ist nicht authentifiziert, zur Login-Seite weiterleiten
          console.log('User not authenticated, redirecting to login');
          setRedirectAttempted(true);
          router.push('/auth/login');
        } else if (isAuthenticated && requireGuild && !currentGuild && !redirectAttempted) {
          // Benutzer ist authentifiziert, aber keine Guild ausgewählt
          // Wir leiten nicht mehr zur Guild-Auswahl weiter, sondern zeigen den Inhalt an
          console.log('User authenticated but no guild selected, showing content anyway');
          setIsChecking(false);
        } else {
          // Benutzer ist authentifiziert und (Guild ausgewählt oder nicht erforderlich)
          console.log('Authentication check passed, rendering protected content');
          setIsChecking(false);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, loading, router, redirectAttempted, currentGuild, requireGuild, token, user]);

  // Während der Prüfung oder wenn der Auth-Status noch geladen wird, einen Ladebildschirm anzeigen
  if (loading || isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <svg className="inline-block h-10 w-10 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Authentifizierung wird überprüft...</p>
        </div>
      </div>
    );
  }

  // Benutzer ist authentifiziert, Kinder-Komponenten anzeigen
  return <>{children}</>;
}
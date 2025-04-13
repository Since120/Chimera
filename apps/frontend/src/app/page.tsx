'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  // Effekt für automatische Weiterleitung zum Dashboard, wenn bereits eingeloggt
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log('Benutzer bereits eingeloggt, leite zum Dashboard weiter');
      setRedirectInProgress(true);
      router.push('/dashboard');
    } else if (!loading && !isAuthenticated) {
      // Wenn nicht eingeloggt, zur Login-Seite weiterleiten
      console.log('Benutzer nicht eingeloggt, leite zur Login-Seite weiter');
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, user, router]);

  // Wenn Weiterleitung erfolgt, zeige Lade-Indikator
  if (redirectInProgress || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Chimera Dashboard</h1>
            <div className="mt-8">
              <div className="flex justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">
                {isAuthenticated ? 'Du wirst zum Dashboard weitergeleitet...' : 'Du wirst zur Login-Seite weitergeleitet...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Diese Ansicht sollte eigentlich nie angezeigt werden, da wir immer weiterleiten
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Chimera Dashboard</h1>
          <p className="mt-2 text-gray-600">Wähle eine Option:</p>

          <div className="mt-8 space-y-4">
            <Link
              href="/auth/login"
              className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Zum Login
            </Link>

            <Link
              href="/dashboard"
              className="w-full flex justify-center items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

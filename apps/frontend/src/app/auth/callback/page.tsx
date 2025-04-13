'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

/**
 * Callback-Seite für die Discord OAuth2-Weiterleitung
 */
export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('AuthCallback: Callback-Verarbeitung gestartet');
      try {
        // Supabase-Sitzung abrufen
        console.log('AuthCallback: Rufe Supabase-Sitzung ab...');
        const { data, error } = await supabase.auth.getSession();

        console.log('AuthCallback: Supabase-Sitzung Ergebnis:', {
          hasSession: !!data?.session,
          error: error ? error.message : null
        });

        if (error || !data.session) {
          console.error('AuthCallback: Fehler bei der Authentifizierung:', error?.message || 'Keine Sitzung gefunden');
          setError('Fehler bei der Authentifizierung: ' + (error?.message || 'Keine Sitzung gefunden'));
          setLoading(false);
          return;
        }

        // Token im localStorage speichern
        localStorage.setItem('auth_token', data.session.access_token);

        // Anmeldestatus zurücksetzen
        localStorage.removeItem('auth_login_in_progress');

        // Session aktualisieren
        console.log('AuthCallback: Aktualisiere Session mit refreshSession()...');
        try {
          await refreshSession();
          console.log('AuthCallback: Session erfolgreich aktualisiert');
        } catch (refreshError) {
          console.error('AuthCallback: Fehler bei der Session-Aktualisierung:', refreshError);
          // Trotzdem fortfahren, da wir bereits ein gültiges Token haben
        }

        // Erfolg anzeigen
        setSuccess(true);
        setLoading(false);

        // Sofort zum Dashboard weiterleiten
        console.log('AuthCallback: Login erfolgreich, leite zum Dashboard weiter...');
        try {
          router.replace('/dashboard'); // replace statt push verwenden, um die Browser-Historie zu ersetzen
        } catch (routerError) {
          console.error('AuthCallback: Fehler bei der Weiterleitung mit router.replace:', routerError);
          // Fallback: Versuche es mit window.location
          console.log('AuthCallback: Versuche Fallback mit window.location...');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('AuthCallback: Fehler bei der Verarbeitung des Callbacks:', error);

        // Detailliertere Fehlermeldung
        let errorMessage = 'Fehler bei der Anmeldung. Bitte versuche es erneut.';
        if (error instanceof Error) {
          errorMessage += ' Details: ' + error.message;
          console.error('AuthCallback: Fehlerdetails:', error.message);

          // Stack-Trace für besseres Debugging
          if (error.stack) {
            console.error('AuthCallback: Stack-Trace:', error.stack);
          }
        }

        setError(errorMessage);
        setLoading(false);

        // Anmeldestatus zurücksetzen
        localStorage.removeItem('auth_login_in_progress');
      }
    };

    handleCallback();
  }, [router, refreshSession]);

  // Manuelle Weiterleitung erlauben
  const handleManualRedirect = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Anmeldung wird verarbeitet</h1>
            <div className="mt-4">
              <div className="flex justify-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Einen Moment bitte, die Authentifizierung wird abgeschlossen.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Anmeldefehler</h1>
            <div className="mt-4">
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={() => handleManualRedirect('/auth/login')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600">Login erfolgreich!</h1>
            <div className="mt-4">
              <svg className="mx-auto h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="mt-4 text-gray-600">Du wirst zum Dashboard weitergeleitet...</p>
              <button
                onClick={() => handleManualRedirect('/dashboard')}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Direkt zum Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sollte eigentlich nicht erreicht werden
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-600">Unerwarteter Status</h1>
          <div className="mt-4">
            <p className="text-gray-600">Die Anwendung befindet sich in einem unerwarteten Zustand.</p>
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => handleManualRedirect('/dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Zum Dashboard
              </button>
              <button
                onClick={() => handleManualRedirect('/auth/login')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Zum Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



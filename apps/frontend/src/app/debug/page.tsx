'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getAuthToken } from '@/lib/auth';
import Link from 'next/link';

export default function DebugPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [cookies, setCookies] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    // Aktuelle Werte erfassen
    setToken(getAuthToken());
    setCookies(document.cookie);
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/graphql');

    // API-Test durchführen
    testApi();
  }, []);

  const testApi = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/graphql';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          query: `query { isAuthenticated }`
        })
      });

      const data = await response.json();
      setApiStatus({
        success: true,
        message: `API erreichbar. Response: ${JSON.stringify(data)}`
      });
      return true;
    } catch (error) {
      console.error('API-Test Fehler:', error);
      setApiStatus({
        success: false,
        message: `API-Test fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
      });
      return false;
    }
  };

  const clearAuthData = () => {
    // In localStorage löschen
    localStorage.removeItem('pyro_auth_token');
    localStorage.removeItem('debug_token');
    
    // Cookies löschen
    document.cookie = 'pyro_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Seite neuladen
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Debug-Seite</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Authentifizierungsstatus</h2>
        <div className="space-y-2">
          <p><span className="font-semibold">Loading:</span> {loading ? 'Ja' : 'Nein'}</p>
          <p><span className="font-semibold">Authentifiziert:</span> {isAuthenticated ? 'Ja' : 'Nein'}</p>
          <p><span className="font-semibold">Benutzer:</span> {user ? 'Vorhanden' : 'Nicht vorhanden'}</p>
          {user && (
            <div className="mt-2 p-3 bg-white rounded border">
              <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Auth Token</h2>
        <p><span className="font-semibold">Token vorhanden:</span> {token ? 'Ja' : 'Nein'}</p>
        {token && (
          <div className="mt-2 p-3 bg-white rounded border">
            <p className="text-sm break-all">{token}</p>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Cookies</h2>
        <div className="mt-2 p-3 bg-white rounded border">
          <p className="text-sm break-all">{cookies || 'Keine Cookies gefunden'}</p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-purple-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">API-Verbindung</h2>
        <p><span className="font-semibold">API URL:</span> {apiUrl}</p>
        {apiStatus && (
          <div className={`mt-2 p-3 rounded border ${apiStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="text-sm">{apiStatus.message}</p>
          </div>
        )}
        <button 
          onClick={testApi}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          API erneut testen
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={clearAuthData}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Auth-Daten löschen
        </button>
        
        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Zum Dashboard
        </Link>
        
        <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material'; // Import necessary MUI components

export default function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<{success: boolean; message: string} | null>(null);

  // Redirect logic is now handled by the middleware
  // useEffect(() => {
  //   // Log the state values whenever this effect runs
  //   // Added more detailed logging
  //   console.log(`[Home Page Effect Check] loading: ${loading}, isAuthenticated: ${isAuthenticated}, user exists: ${!!user}`);
  //
  //   // Redirect immediately when authenticated and not loading
  //   if (!loading && isAuthenticated && user) {
  //     console.log('[Home Page Effect Action] Conditions met! Redirecting to /dashboard...');
  //     router.replace('/dashboard'); // Use replace to avoid adding home page to history after login
  //   } else {
  //     console.log('[Home Page Effect Action] Conditions NOT met, no redirect.');
  //   }
  // }, [loading, isAuthenticated, user, router]);

  // API connection test function
  const testBackendConnection = async () => {
    setApiStatus(null); // Reset status before test
    try {
      // Use the correct API base URL from environment variables, default to 3000
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      console.log('Teste Backend-Verbindung zu (Root):', apiUrl);

      // Use fetch to test the root endpoint (usually handled by AppController)
      const response = await fetch(apiUrl, {
        method: 'GET', // Use GET for the root endpoint
        mode: 'cors', // Ensure CORS is handled
      });

      if (response.ok) {
        // Check if the response is likely the expected "Hello World!" or similar
        const text = await response.text();
        console.log('Fetch-Anfrage erfolgreich:', response.status, text);
        setApiStatus({ success: true, message: 'Verbindung zum Backend erfolgreich!' });
      } else {
        console.error('Fetch-Anfrage fehlgeschlagen:', response.status, response.statusText);
        setApiStatus({ success: false, message: `Backend nicht erreichbar oder antwortet nicht korrekt (Status: ${response.status})` });
      }
    } catch (error) {
       // This usually indicates a network error (server down, DNS issue, CORS blocked by browser)
      console.error('API-Verbindungstest fehlgeschlagen (Netzwerkfehler/CORS?):', error);
      // Type check for error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      setApiStatus({ success: false, message: `Netzwerkfehler - Backend nicht erreichbar (${errorMessage})` });
    }
  };

  // Effect to run the API test on page load
  useEffect(() => {
    testBackendConnection();
  }, []); // Empty dependency array ensures it runs only once on mount

  // Show loading indicator while checking auth state
  // Important: Check loading *after* the redirect effect to avoid rendering this unnecessarily
  if (loading) {
     return (
       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
         <CircularProgress />
       </Box>
     );
   }

  // If loading is finished and user is authenticated, the redirect effect should have already triggered.
  // If not authenticated, render the main page content.
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
            Pyro Dashboard
          </p>
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white lg:static lg:h-auto lg:w-auto lg:bg-none">
            {/* Link zum Login */}
            <Link
              href="/auth/login"
              className="pointer flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            >
              Zum Login
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">API-Verbindungsstatus</h2>
          {apiStatus ? (
            <div className={`p-4 rounded ${apiStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-medium ${apiStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                {apiStatus.success ? '✅ ' : '❌ '}{apiStatus.message}
              </p>
            </div>
          ) : (
            <p>Teste API-Verbindung...</p>
          )}
          <button
            onClick={testBackendConnection}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            API-Verbindung erneut testen
          </button>
        </div>
      </main>
    );
  }

  // If authenticated, show a minimal loading/redirecting indicator while the effect runs
  if (isAuthenticated) {
     return (
       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
         <CircularProgress />
         <p style={{ marginLeft: '1rem' }}>Lade Dashboard...</p>
       </Box>
     );
  }

  // If not authenticated and not loading, render the main page content
  // Removed the duplicate return block
  // return ( ... );
}

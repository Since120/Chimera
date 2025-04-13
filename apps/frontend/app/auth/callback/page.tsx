'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.replace('/auth/login?error=session_error');
          return;
        }

        if (session?.access_token) {
          // Check if we're already on dashboard to prevent loops
          if (!window.location.pathname.startsWith('/dashboard')) {
            router.replace('/dashboard');
          }
        } else {
          router.replace('/auth/login?error=no_session');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        router.replace('/auth/login?error=unexpected');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authentifizierung läuft...</h1>
        <p>Sie werden in Kürze weitergeleitet</p>
      </div>
    </div>
  );
}
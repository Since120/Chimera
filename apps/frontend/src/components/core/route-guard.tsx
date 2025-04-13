'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface RouteGuardProps {
  children: ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('RouteGuard - Auth Status:', { isAuthenticated, user, loading });
    
    // Kleine Verzögerung, um Race Conditions zu vermeiden
    const timeoutId = setTimeout(() => {
      // Wenn nicht mehr geladen wird und kein Benutzer vorhanden ist, zur Login-Seite umleiten
      if (!loading) {
        if (!user) {
          console.log('RouteGuard - Nicht authentifiziert, leite zur Login-Seite weiter');
          router.push('/auth/login');
        } else {
          console.log('RouteGuard - Authentifizierung erfolgreich');
          setIsChecking(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [user, loading, router, isAuthenticated]);

  // Zeige Ladezustand
  if (loading || isChecking) {
    return (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }} variant="body1">
          Überprüfe Authentifizierung...
        </Typography>
      </Box>
    );
  }

  // Wenn nicht authentifiziert, rendere nichts
  if (!user) {
    return null;
  }

  // Wenn authentifiziert, rendere den geschützten Inhalt
  return <>{children}</>;
}
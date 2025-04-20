'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Box, Flex, Text } from '@chakra-ui/react';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Definiere die Ladekomponente separat für Lesbarkeit
const LoadingIndicator = ({ message }: { message: string }) => (
  <Flex
    minH="100vh"
    align="center"
    justify="center"
    bg="#111822"
    direction="column"
  >
    <Box as="span" position="relative" display="inline-block" w="40px" h="40px" mb={4}>
      <Box
        as="span"
        position="absolute"
        top="0"
        left="0"
        w="full"
        h="full"
        borderRadius="50%"
        border="4px solid"
        borderColor="gray.700"
        opacity={0.3}
      />
      <Box
        as="span"
        position="absolute"
        top="0"
        left="0"
        w="full"
        h="full"
        borderRadius="50%"
        border="4px solid transparent"
        borderTopColor="nav.activeGreen"
        animation="spin 0.65s linear infinite"
      />
    </Box>
    <Text color="gray.400">{message}</Text>
  </Flex>
);

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Dieser Effekt ist primär für den Fall, dass sich der Auth-Status *nach* dem initialen Laden ändert
    // oder wenn der Context den Redirect nicht schnell genug macht.
    if (!loading && !isAuthenticated) {
      console.log('[AuthGuard Effect] Not authenticated, ensuring redirect to login...');
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // --- Neue Render-Logik ---
  if (loading) {
    // Zustand 1: Wir laden noch, zeige Indikator
    console.log('[AuthGuard Render] Status: Loading...');
    return <LoadingIndicator message="Authentifizierung wird überprüft..." />;
  }

  if (!isAuthenticated) {
    // Zustand 2: Laden fertig, aber NICHT authentifiziert, zeige Redirect-Indikator
    // Der useEffect oben sollte bereits den Redirect auslösen.
    console.log('[AuthGuard Render] Status: Not Authenticated, showing redirect indicator...');
    return <LoadingIndicator message="Weiterleitung zur Anmeldeseite..." />;
  }

  // Zustand 3: Laden fertig UND authentifiziert -> Kinder rendern
  console.log('[AuthGuard Render] Status: Authenticated, rendering children.');
  return <>{children}</>;
}

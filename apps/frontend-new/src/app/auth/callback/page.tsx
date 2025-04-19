'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Box, Flex, Text, Heading, Spinner } from '@chakra-ui/react';

export default function AuthCallbackPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(`[Callback Page Effect] Auth Loading: ${loading}, Is Authenticated: ${isAuthenticated}`);
    // Wenn Auth nicht mehr lädt UND wir authentifiziert sind, DANN weiterleiten
    if (!loading && isAuthenticated) {
      console.log('[Callback Page Effect] Authenticated! Redirecting to dashboard...');
      router.replace('/dashboard');
    }
    // Wenn Auth nicht mehr lädt UND NICHT authentifiziert -> Fehler ist in route.ts passiert, User sollte schon auf /login sein.
    else if (!loading && !isAuthenticated) {
        console.warn('[Callback Page Effect] Not authenticated after loading, redirecting to login as fallback.');
        router.replace('/auth/login?error=auth_context_failed');
    }
  }, [isAuthenticated, loading, router]);

  // Immer Ladezustand anzeigen
  return (
    <Flex minH="100vh" align="center" justify="center" bg="#111822" p={4}>
      <Box
        textAlign="center"
        maxW="md"
        w="full"
        p={8}
        borderRadius="xl"
        bg="#0c111b"
        boxShadow="0 10px 25px -5px rgba(0,0,0,0.3)"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.08)"
      >
        <Spinner size="xl" color="green.500" mb={4} />
        <Heading as="h2" size="lg" color="white" mb={2}>
          Authentifizierung läuft...
        </Heading>
        <Text color="gray.400">
          Du wirst gleich weitergeleitet.
        </Text>
      </Box>
    </Flex>
  );
}

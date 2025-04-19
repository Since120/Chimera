'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Box, Flex, Text } from '@chakra-ui/react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('[AuthGuard] Not authenticated, redirecting to login...');
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Wenn noch geladen wird, zeige einen Ladeindikator
  if (loading) {
    return (
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
        <Text color="gray.400">Authentifizierung wird überprüft...</Text>
      </Flex>
    );
  }

  // Wenn nicht authentifiziert und nicht mehr lädt, wird durch den useEffect zur Login-Seite weitergeleitet
  // Wir könnten hier auch null zurückgeben, aber ein Ladeindikator ist benutzerfreundlicher
  if (!isAuthenticated) {
    return (
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
        <Text color="gray.400">Weiterleitung zur Anmeldeseite...</Text>
      </Flex>
    );
  }

  // Wenn authentifiziert, zeige die Kinder-Komponenten
  return <>{children}</>;
}

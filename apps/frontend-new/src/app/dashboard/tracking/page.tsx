// apps/frontend-new/src/app/dashboard/tracking/page.tsx
'use client';

import { Flex, Heading, Text } from '@chakra-ui/react';
import { NotchedBox } from '@/components/core/NotchedBox'; // Korrekten Pfad sicherstellen

export default function TrackingPage() {
  return (
    <Flex direction="column" h="full" gap={4}>
      <Heading as="h1" size="lg" mb={2}>
        Tracking Overview
      </Heading>

      {/* Hier die NotchedBox verwenden */}
      <NotchedBox
        flex="1" // Nimmt verfügbaren Platz ein
        w="full"
         // Padding wird von der Komponente gehandhabt (pt speziell)
         // p={6} // Kann weggelassen oder überschrieben werden
      >
        {/* Beispiel-Inhalt */}
        <Heading size="md" color="gray.800">
          Inhalt der Tracking-Seite
        </Heading>
        <Text color="gray.600" mt={4}>
          Hier kommen die Tracking-Daten und Einstellungen rein...
        </Text>
        {/* Fügen Sie hier den tatsächlichen Inhalt ein */}

      </NotchedBox>
    </Flex>
  );
}

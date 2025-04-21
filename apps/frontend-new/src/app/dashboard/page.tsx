// apps/frontend-new/src/app/dashboard/page.tsx
import { Box, Heading, Text } from "@chakra-ui/react";
import { NotchedBox } from "@/components/core/NotchedBox"; // Importiere die NotchedBox

export default function DashboardPage() {
  return (
    <Box>
      {/* Seiten-spezifischer Titel */}
      <Heading as="h1" size="lg" mb={6}>
        Dashboard Overview
      </Heading>
      {/* NotchedBox statt Platzhalter-Box */}
      <NotchedBox
        minHeight="50vh" // Behalte nötige Layout-Props bei
        display="flex"
        alignItems="center"
        justifyContent="center"
        // Das p={8} vom alten Box wird durch das Standard-p={6} von NotchedBox ersetzt,
        // kann aber bei Bedarf hier überschrieben werden: p={8}
      >
        <Text color="fg.muted" fontSize="lg">
          Inhaltsbereich für das Dashboard... (Jetzt in NotchedBox)
        </Text>
      </NotchedBox>
    </Box>
  );
}

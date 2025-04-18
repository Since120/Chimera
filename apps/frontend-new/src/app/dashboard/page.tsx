// apps/frontend-new/src/app/dashboard/page.tsx
import { Box, Heading, Text } from "@chakra-ui/react";

export default function DashboardPage() {
  return (
    <Box>
      {/* Seiten-spezifischer Titel */}
      <Heading as="h1" size="lg" mb={6}>
        Dashboard Overview
      </Heading>
      {/* Platzhalter-Box */}
      <Box
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="border.subtle"
        borderRadius="xl" // Stark abgerundet (>=12px)
        p={8} // Großzügiges Padding
        minHeight="50vh" // Deutliche Mindesthöhe
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="fg.muted" fontSize="lg">
          Inhaltsbereich für das Dashboard...
        </Text>
      </Box>
    </Box>
  );
}

// apps/frontend-new/src/app/dashboard/page.tsx
import { Box, Heading, Text } from "@chakra-ui/react";

export default function DashboardPage() {
  return (
    <Box>
      <Heading as="h1" fontSize="2xl" mb={4}>
        Dashboard
      </Heading>
      <Text>Willkommen im neuen Dashboard!</Text>
    </Box>
  );
}

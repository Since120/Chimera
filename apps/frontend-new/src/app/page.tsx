import { Box, Button, Heading, HStack, Stack } from "@chakra-ui/react";

export default function Home() {
  return (
    <Stack p={8} align="center" gap={4}>
      <Heading>Willkommen im neuen Dashboard!</Heading>
      <HStack>
        <Button colorPalette="teal">Button 1</Button>
        <Button variant="outline">Button 2</Button>
      </HStack>
      <Box bg="bg.subtle" p={4} rounded="md">
        Ein Chakra UI Box Element.
      </Box>
    </Stack>
  );
}
// apps/frontend-new/src/app/page.tsx
import { Button, Heading, VStack, Text, HStack } from "@chakra-ui/react";
import Link from 'next/link';
import { LuLogIn } from "react-icons/lu";

export default function HomePage() {
  return (
    <VStack
      minH="80vh" // Etwas weniger als volle Höhe, falls Header/Footer geplant sind
      align="center"
      justify="center"
      gap={6} // Mehr Abstand
      p={8}
      textAlign="center"
      // Hintergrund passend zum Dashboard/Login
      bg="#111822"
      color="white"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 40% 30% at 50% 0%, rgba(27, 37, 52, 0.5) 0%, transparent 80%),
          radial-gradient(ellipse 30% 25% at 15% 15%, rgba(39, 55, 77, 0.4) 0%, transparent 70%),
          radial-gradient(ellipse 50% 35% at 80% 90%, rgba(27, 37, 52, 0.3) 0%, transparent 75%)
        `
      }}
    >
      <Heading as="h1" size="2xl" fontWeight="bold" color="white">
        Willkommen zu Project Chimera
      </Heading>
      <Text fontSize="lg" color="gray.300" maxW="lg">
        Das fortschrittliche Dashboard zur Verwaltung deines Discord Bot-Ökosystems.
      </Text>
      <Link href="/login">
        <Button
          bg="nav.activeGreen" // Verwende die Theme-Farbe
          color="black"
          size="lg"
          fontWeight="bold"
          px={8} // Breiterer Button
          _hover={{ bg: "green.400" }} // Anpassung des Hover-Effekts
        >
          <HStack gap={2}>
            <LuLogIn size={20} />
            <Text>Zum Login</Text>
          </HStack>
        </Button>
      </Link>
    </VStack>
  );
}
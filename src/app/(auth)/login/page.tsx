"use client";

import { Box, Button, Flex, Heading, Icon, Text, VStack, chakra } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaDiscord } from "react-icons/fa";
import { LuShieldCheck, LuLock, LuKeyRound } from "react-icons/lu";

// Motion-Komponente erstellen
const MotionBox = motion(chakra.div);

export default function LoginPage() {
  // Hintergrund-Gradient aus dem Dashboard-Layout
  const bgGradient = `
    radial-gradient(circle at 15% 50%, rgba(101, 25, 250, 0.05), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(13, 148, 136, 0.05), transparent 25%)
  `;

  // Handler für den Login-Button
  const handleDiscordLogin = () => {
    console.log('Login mit Discord geklickt');
    // Hier später die tatsächliche Discord-Authentifizierung implementieren
  };

  return (
    <Flex
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      bg="#111822"
      bgGradient={bgGradient}
      p={4}
      flexDirection="column"
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        bg="dark.800"
        borderRadius="2xl"
        boxShadow="xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.08)"
        p={10}
        maxW="md"
        width="100%"
        overflow="hidden"
      >
        <VStack spacing={6} align="stretch" width="100%">
          {/* Zentriertes Icon */}
          <Box display="flex" justifyContent="center">
            <Icon
              as={LuKeyRound}
              boxSize={10}
              color="gray.500"
              mb={2}
            />
          </Box>

          <Heading
            as="h2"
            size="lg"
            fontWeight="semibold"
            textAlign="center"
            color="fg"
          >
            Willkommen bei Project Chimera
          </Heading>

          <Text
            fontSize="sm"
            color="fg.muted"
            textAlign="center"
            maxW="xs"
            mx="auto"
          >
            Bitte melde dich mit Discord an, um fortzufahren.
          </Text>

          <Button
            size="lg"
            width="100%"
            bgGradient="linear(to-r, brand.500, brand.400)"
            color="black"
            borderRadius="lg"
            fontWeight="medium"
            leftIcon={<Icon as={FaDiscord} boxSize={5} />}
            _hover={{
              bgGradient: "linear(to-r, brand.600, brand.500)",
              transform: 'scale(1.02)',
              boxShadow: 'md'
            }}
            _active={{
              bgGradient: "linear(to-r, brand.700, brand.600)",
              transform: 'scale(0.98)'
            }}
            _focusVisible={{
              ring: 3,
              ringColor: "brand.500",
              ringOffset: 2,
              ringOffsetColor: "dark.800"
            }}
            transition="all 0.2s ease-in-out"
            onClick={handleDiscordLogin}
          >
            Mit Discord anmelden
          </Button>
        </VStack>
      </MotionBox>

      {/* Footer unter der Karte */}
      <Flex mt={6} justifyContent="center" alignItems="center">
        <Icon as={LuLock} boxSize={3} color="gray.600" mr={1.5} />
        <Text fontSize="xs" color="gray.600">Sichere OAuth2 Verbindung</Text>
      </Flex>
    </Flex>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { mainGradientBackground } from '@/styles/backgrounds'; // Import der zentralen Hintergrund-Definition
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Icon,
  useToken,
  chakra
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Discord icon component
const DiscordIcon = (props: React.ComponentProps<typeof Icon>) => (
  <Icon viewBox="0 -28.5 256 256" width="5" height="5" {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -28.5 256 256">
      <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842618 183.854737,172.420991 176.223542,175.320677 C180.230393,183.341335 184.861538,190.991543 190.096624,198.16899 C211.238746,191.588113 232.743023,181.531331 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor" fillRule="nonzero">
      </path>
    </svg>
  </Icon>
);

// BotManager logo - similar to Salesforce style
const BotManagerLogo = (props: React.ComponentProps<typeof Icon>) => (
  <Icon viewBox="0 0 40 40" width={{ base: "32px", md: "40px" }} height={{ base: "32px", md: "40px" }} {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <rect width="40" height="40" rx="20" fill="#061C3F"/>
      <path d="M15.418 24.7447L12.274 28.0887C11.979 28.3837 11.504 28.3837 11.209 28.0887L9.73398 26.6137C9.43898 26.3187 9.43898 25.8437 9.73398 25.5487L12.878 22.2507C13.173 21.9557 13.648 21.9557 13.943 22.2507L15.418 23.7257C15.713 24.0207 15.713 24.4957 15.418 24.7447Z" fill="white"/>
      <path d="M23.7981 16.3644L15.4181 24.7444C15.1231 25.0394 14.6481 25.0394 14.3531 24.7444L12.8781 23.2694C12.5831 22.9744 12.5831 22.4994 12.8781 22.2044L21.2581 13.8244C21.5531 13.5294 22.0281 13.5294 22.3231 13.8244L23.7981 15.2994C24.0931 15.5944 24.0931 16.0694 23.7981 16.3644Z" fill="white"/>
      <path d="M30.2679 9.9346L23.7979 16.4046C23.5029 16.6996 23.0279 16.6996 22.7329 16.4046L21.2579 14.9296C20.9629 14.6346 20.9629 14.1596 21.2579 13.8646L27.7279 7.39462C28.0229 7.09962 28.4979 7.09962 28.7929 7.39462L30.2679 8.86962C30.5629 9.16462 30.5629 9.63962 30.2679 9.9346Z" fill="white"/>
    </svg>
  </Icon>
);



// MotionBox für Framer-Motion-Animationen
const MotionBox = motion(chakra.div);



export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Fehler aus URL-Parametern auslesen
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    if (errorParam) {
      let displayError = '';

      switch (errorParam) {
        case 'exchange_failed':
          displayError = `Fehler bei der Authentifizierung: ${errorMessage || 'Bitte versuche es erneut'}`;
          break;
        case 'exchange_error':
          displayError = `Fehler beim Austausch des Auth-Codes: ${errorMessage || 'Bitte versuche es erneut'}`;
          break;
        case 'no_code':
          displayError = 'Kein Authentifizierungscode gefunden. Bitte versuche es erneut.';
          break;
        case 'callback_exception':
          displayError = `Ein unerwarteter Fehler ist aufgetreten: ${errorMessage || 'Bitte versuche es erneut'}`;
          break;
        case 'callback_timeout':
          displayError = 'Die Authentifizierung hat zu lange gedauert. Bitte versuche es erneut.';
          break;
        default:
          displayError = `Fehler bei der Anmeldung: ${errorMessage || 'Bitte versuche es erneut'}`;
      }

      setError(displayError);
      console.error('Login error:', { errorParam, errorMessage, displayError });
    }
  }, [searchParams]);

  // Wenn der Benutzer bereits authentifiziert ist, zum Dashboard weiterleiten
  useEffect(() => {
    // Direkt mit Supabase prüfen, ob eine Sitzung vorhanden ist
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('[LoginPage] Session found, redirecting to dashboard...');
          // Stelle sicher, dass der Token im localStorage gespeichert ist
          localStorage.setItem(
            process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'chimera_auth_token',
            data.session.access_token
          );
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('[LoginPage] Error checking session:', error);
      }
    };

    checkSession();

    // Auch auf den AuthContext hören
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Verwende die login-Funktion aus dem Auth-Context
    login();
  };

  // Verwendung der zentralen Hintergrund-Definition

  // Animationen aus dem Theme verwenden
  const [blinkAnimation, pulseSlowAnimation, typingAnimation, sweepAnimation, pingAnimation, scanAnimation, buttonSpotlightAnimation] =
    useToken('animations', ['blink', 'pulseSlow', 'typing', 'sweep', 'ping', 'scan', 'buttonSpotlight']);

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={6}
      fontFamily="body"
      position="relative"
      overflow="hidden"
      style={mainGradientBackground} // Verwendung der zentralen Hintergrund-Definition
    >


      {/* Login container - perfekt zentriert */}
      <MotionBox
        maxW="md"
        w={{ base: "90%", sm: "85%", md: "full" }}
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        zIndex={10}
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        onMouseMove={handleMouseMove}
        px={{ base: 4, md: 0 }}
      >
        {/* Header mit Logo */}
        <Flex align="center" justify="center" mb={{ base: 4, md: 8 }}>
          <Box position="relative">
            <BotManagerLogo />
            {/* Animierte Ringe um das Logo */}
            <Box
              position="absolute"
              inset="-1"
              borderRadius="full"
              border="1px solid"
              borderColor="whiteAlpha.200"
              animation="spin 12s linear infinite"
            />
            <Box
              position="absolute"
              inset="-2"
              borderRadius="full"
              border="1px solid"
              borderColor="nav.activeGreen"
              opacity={0.1}
              animation="spin 16s linear infinite reverse"
            />
          </Box>
        </Flex>

        {/* Login card mit 3D-Tilt-Effekt */}
        <Box position="relative">
          {/* Ambient-Schatten unter der Karte für mehr Tiefe */}
          <Box
            position="absolute"
            width="90%"
            height="20px"
            bottom="-30px"
            left="5%"
            borderRadius="50%"
            bg="black"
            filter="blur(20px)"
            opacity={0.4}
            transform="scale(0.95, 0.2)"
            zIndex={0}
          />

          <MotionBox
            bg="login.card.background"
            _dark={{ bg: "login.card.background" }}
            opacity={0.9}
            backdropFilter="blur(16px)"
            borderRadius="3xl"
            boxShadow="shadows.loginCard"
            overflow="hidden"
            border="1px solid"
            borderColor="login.card.border"
            position="relative"
            zIndex={1}
            _before={{
              content: '""',
              position: 'absolute',
              inset: '-1px',
              borderRadius: '3xl',
              padding: '1px',
              background: 'var(--chakra-colors-login-card-glassGradient)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none'
            }}
            style={{
              perspective: '1000px',
              transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg) translateZ(60px)`,
              transition: 'transform 0.1s ease-out'
            }}
        >
          {/* Header Bar mit Login-Tab */}
          <Flex justify="center" p={2} bg="login.header.background" opacity={0.7}>
            <Box
              bg="nav.activeGreen"
              borderRadius="full"
              px={6}
              py={1.5}
              fontSize="sm"
              fontWeight="medium"
              color="black"
            >
              Login
            </Box>
          </Flex>

          {/* Content area */}
          <Box p={{ base: 4, sm: 6, md: 8 }} position="relative">
            {/* Dynamischer Lichtschweif-Effekt */}
            <Box position="absolute" inset="0" overflow="hidden">
              <Box
                position="absolute"
                width="100%"
                height="100%"
                bgGradient="linear(90deg, transparent, whiteAlpha.100, transparent)"
                transform="skewX(-20deg)"
                animation={sweepAnimation}
              />
            </Box>

            <Box textAlign="center" mb={{ base: 4, md: 8 }} position="relative">
              <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="light" color="white" mb={2}>
                Willkommen bei Project Chimera
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Melde dich mit Discord an, um fortzufahren
              </Text>

              {/* Fehleranzeige */}
              {error && (
                <Box mt={4} p={3} borderRadius="md" bg="login.error.background" borderLeft="4px solid" borderColor="login.error.borderColor">
                  <Flex direction="column" align="flex-start">
                    <Heading as="h4" size="xs" color="red.400" mb={1}>
                      Anmeldefehler
                    </Heading>
                    <Text fontSize="xs" color="gray.300">
                      {error}
                    </Text>
                    <Button size="xs" variant="ghost" colorScheme="red" mt={2} onClick={() => setError(null)}>
                      Schließen
                    </Button>
                  </Flex>
                </Box>
              )}
            </Box>

            {/* Bot preview pane */}
            <Box position="relative" mb={{ base: 4, md: 8 }}>
              <Box
                position="absolute"
                inset="0"
                borderRadius="xl"
                bgGradient="linear(to-r, transparent, nav.activeGreen, transparent)"
                opacity={0.05}
                animation={pulseSlowAnimation}
              />

              {/* Bot preview mit holografischem Effekt */}
              <Box
                bg="login.botPreview.background"
                opacity={0.8}
                borderRadius="xl"
                p={{ base: 3, sm: 4, md: 5 }}
                border="1px solid"
                borderColor="transparent"
                position="relative"
                overflow="hidden"
                backdropFilter="blur(8px)"
                style={{
                  backgroundImage: 'var(--chakra-colors-login-botPreview-gradient)',
                  boxShadow: 'var(--chakra-colors-login-botPreview-shadow)'
                }}
              >
                {/* Holografische Linien */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  overflow="hidden"
                  opacity={0.1}
                  pointerEvents="none"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    height: '100%',
                    width: '300%',
                    background: `repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 1px,
                      rgba(144, 255, 0, 0.5) 1px,
                      rgba(144, 255, 0, 0.5) 2px
                    )`,
                    animation: scanAnimation,
                  }}
                />

                {/* Bot-Repräsentation */}
                <Flex align="center" justify="center">
                  <Box position="relative" w="16" h="16" display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Box
                      position="absolute"
                      inset="0"
                      borderRadius="full"
                      bgGradient="login.botPreview.iconGradient"
                      animation={pulseSlowAnimation}
                    />
                    <Box position="absolute" inset="0" borderRadius="full">
                      {/* Pulsierende Ringe */}
                      <Box
                        position="absolute"
                        inset="2"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="nav.activeGreen"
                        opacity={0.4}
                        animation={pingAnimation}
                      />
                      <Box
                        position="absolute"
                        inset="3"
                        borderRadius="full"
                        border="1px solid"
                        borderColor="nav.activeGreen"
                        opacity={0.2}
                        animation={pingAnimation}
                        style={{ animationDelay: '300ms' }}
                      />
                    </Box>
                    <Icon
                      as={(props) => (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
                          <path fill="currentColor" d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M13.9,13.9l-2.4,2.4c-0.6,0.6-1.6,0.6-2.2,0l0,0c-0.6-0.6-0.6-1.6,0-2.2l2.4-2.4c0.6-0.6,1.6-0.6,2.2,0l0,0C14.5,12.3,14.5,13.3,13.9,13.9z M14.7,10.4l-3.2-3.2c-0.6-0.6-0.6-1.6,0-2.2l0,0c0.6-0.6,1.6-0.6,2.2,0l3.2,3.2c0.6,0.6,0.6,1.6,0,2.2l0,0C16.3,11,15.3,11,14.7,10.4z" />
                        </svg>
                      )}
                      position="relative"
                      w={{ base: 6, md: 8 }}
                      h={{ base: 6, md: 8 }}
                      color="white"
                    />
                  </Box>
                </Flex>

                {/* Bot-Name mit Typing-Effekt */}
                <Box textAlign="center">
                  <Flex align="center" h="6" overflow="hidden" justify="center">
                    <Heading
                      as="h3"
                      color="white"
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="medium"
                      overflow="hidden"
                      whiteSpace="nowrap"
                      display="inline-block"
                      css={{
                        animation: typingAnimation
                      }}
                    >
                      CHIMERA
                    </Heading>
                    <Box
                      ml={1}
                      h={4}
                      w={1}
                      bg="nav.activeGreen"
                      css={{
                        animation: blinkAnimation
                      }}
                    />
                  </Flex>
                  <Text color="nav.activeGreen" fontSize="xs" mt={1}>
                    Discord Bot Manager
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Login button mit verbesserten Animationseffekten */}
            <Box position="relative" mb={{ base: 4, md: 6 }}>
              {/* Button Glow-Effekt beim Hover */}
              <Box
                position="absolute"
                inset="-0.5"
                bgGradient="linear(to-r, nav.activeGreen, nav.activeGreen)"
                borderRadius="full"
                opacity="0"
                filter="blur(8px)"
                _groupHover={{ opacity: 0.5 }}
                transition="opacity 0.3s"
              />

              <Button
                role="group"
                position="relative"
                w="full"
                bg="nav.activeGreen"
                _hover={{ bg: "nav.activeGreen" }}
                color="black"
                fontWeight="medium"
                borderRadius="full"
                py={{ base: 2.5, md: 3 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.2s"
                _groupHover={{ boxShadow: "lg" }}
                onClick={handleLogin}
                disabled={isLoading}
                overflow="hidden"
              >
                {/* Button Spotlight-Effekt */}
                <Box
                  position="absolute"
                  inset="0"
                  w="full"
                  h="full"
                  bgGradient="linear(90deg, transparent, whiteAlpha.100, transparent)"
                  opacity="0"
                  _groupHover={{ opacity: 1 }}
                  style={{
                    left: '-100%',
                    animation: buttonSpotlightAnimation
                  }}
                />

                {isLoading ? (
                  <Flex align="center">
                    <Icon
                      animation="spin 1s linear infinite"
                      mr={2}
                      h={5}
                      w={5}
                      color="black"
                      viewBox="0 0 24 24"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <circle
                          opacity={0.25}
                          cx={12}
                          cy={12}
                          r={10}
                          stroke="currentColor"
                          strokeWidth={4}
                        />
                        <path
                          opacity={0.75}
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </Icon>
                    <Text position="relative">Verbinde mit Discord...</Text>
                  </Flex>
                ) : (
                  <Flex align="center">
                    <DiscordIcon />
                    <Text ml={2} position="relative">Mit Discord anmelden</Text>
                  </Flex>
                )}
              </Button>
            </Box>

            {/* Secure connection notice */}
            <Flex textAlign="center" color="gray.400" fontSize="xs" align="center" justify="center">
              <Icon
                viewBox="0 0 24 24"
                h={3}
                w={3}
                mr={1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </Icon>
              <Text position="relative">Sichere OAuth2-Verbindung</Text>
            </Flex>
          </Box>
        </MotionBox>
        </Box>

        {/* Footer */}
        <Text mt={4} textAlign="center" color="gray.500" fontSize="xs">
          © 2025 Project Chimera • Alle Rechte vorbehalten
        </Text>
      </MotionBox>

      {/* Globale CSS-Animationen */}
      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateX(0); }
          100% { transform: translateX(33.33%); }
        }

        @keyframes ping {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes button-spotlight {
          0% { transform: translateX(0); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </Flex>
  );
};


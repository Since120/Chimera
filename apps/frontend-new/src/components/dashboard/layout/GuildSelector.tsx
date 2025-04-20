// apps/frontend-new/src/components/dashboard/layout/GuildSelector.tsx
'use client';

import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  Portal,
} from '@chakra-ui/react';
import { Popover } from '@chakra-ui/react';
import { useGuild } from '@/context/guild-context';
import { LuPlus, LuChevronDown } from 'react-icons/lu';
import { useState } from 'react';

interface GuildSelectorProps {
  variant: 'collapsed' | 'expanded' | 'mobile';
}

// TODO: Hole diese aus Environment-Variablen
const DISCORD_BOT_INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'YOUR_CLIENT_ID'}&permissions=8&scope=bot%20applications.commands`;

// Definiere einen sehr hohen z-Index für das Dropdown-Menü
const DROPDOWN_Z_INDEX = 9999;

export default function GuildSelector({ variant }: GuildSelectorProps) {
  const { availableGuilds, selectedGuild, setSelectedGuild, isLoading } = useGuild();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h={variant === 'mobile' ? "auto" : "10"} w={variant === 'collapsed' ? "10" : "auto"} p={variant === 'mobile' ? 3 : 0}>
        <Spinner size="sm" color="gray.500" />
      </Flex>
    );
  }

  if (!selectedGuild && availableGuilds.length === 0) {
    if (variant === 'mobile') {
      return (
        <Flex align="center" gap={2} p={3}>
          <Box w="6" h="6" bg="gray.700" borderRadius="full" />
          <Text fontSize="sm" color="gray.500">Keine Server</Text>
        </Flex>
      )
    }
    return null; // Nichts anzeigen, wenn keine Auswahl möglich
  }

  const handleSelectGuild = (guild: typeof availableGuilds[0]) => {
    setSelectedGuild(guild);
  };

  // --- Trigger-Rendering basierend auf Variante ---
  const renderTrigger = () => {
    if (!selectedGuild) {
      // Zeige Platzhalter, wenn keine Guild ausgewählt ist (sollte nur kurz auftreten)
      return (
        <Button variant="ghost" loading={isLoading} size="sm">
          Server wählen...
        </Button>
      );
    }

    switch (variant) {
      case 'collapsed':
        return (
          <Box
            cursor="pointer"
            w="10"
            h="10"
            borderRadius="md"
            border="2px solid"
            borderColor="transparent" // Unsichtbar, Platzhalter
            _hover={{ borderColor: 'nav.activeGreen' }}
            _focusVisible={{ outline: "2px solid", outlineColor: "nav.activeGreen", outlineOffset: "2px" }}
            transition="border-color 0.2s"
            overflow="hidden"
            position="relative"
          >
            {selectedGuild.icon_url ? (
              <img
                src={selectedGuild.icon_url}
                alt={selectedGuild.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Flex
                w="full"
                h="full"
                bg="gray.700"
                color="white"
                fontWeight="bold"
                fontSize="md"
                align="center"
                justify="center"
              >
                {selectedGuild.name.charAt(0).toUpperCase()}
              </Flex>
            )}
          </Box>
        );
      case 'expanded':
        return (
          <Button
            variant="ghost"
            w="auto" // Nicht mehr volle Breite, sondern nur so breit wie nötig
            h="auto"
            py={1.5}
            px={2} // Weniger Padding
            textAlign="left"
            display="flex"
            alignItems="center"
            justifyContent="space-between" // Pfeil rechts
            _hover={{ bg: "whiteAlpha.100" }}
            _active={{ bg: "whiteAlpha.200" }}
            borderRadius="md"
          >
            <Flex align="center" gap={2} minW="0"> {/* Kein flex="1" mehr, damit die Breite nicht expandiert */}
              {selectedGuild.icon_url ? (
                <img
                  src={selectedGuild.icon_url}
                  alt={selectedGuild.name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Flex
                  w="6"
                  h="6"
                  bg="gray.700"
                  color="white"
                  fontWeight="bold"
                  fontSize="xs"
                  align="center"
                  justify="center"
                  borderRadius="md"
                >
                  {selectedGuild.name.charAt(0).toUpperCase()}
                </Flex>
              )}
              <Text fontSize="sm" fontWeight="medium" color="gray.100" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" maxW="120px">
                {selectedGuild.name}
              </Text>
            </Flex>
            <Box as={LuChevronDown} boxSize={4} color="gray.400" />
          </Button>
        );
      case 'mobile':
        return (
          <Button
            variant="ghost"
            w="full"
            h="auto"
            py={3}
            px={3}
            textAlign="left"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            _hover={{ bg: "whiteAlpha.100" }}
            _active={{ bg: "whiteAlpha.200" }}
            borderRadius="md"
          >
            <Flex align="center" gap={3} flex="1" minW="0">
              {selectedGuild.icon_url ? (
                <img
                  src={selectedGuild.icon_url}
                  alt={selectedGuild.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Flex
                  w="8"
                  h="8"
                  bg="gray.700"
                  color="white"
                  fontWeight="bold"
                  fontSize="sm"
                  align="center"
                  justify="center"
                  borderRadius="md"
                >
                  {selectedGuild.name.charAt(0).toUpperCase()}
                </Flex>
              )}
              <Text fontSize="md" fontWeight="medium" color="gray.100" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {selectedGuild.name}
              </Text>
            </Flex>
            <Box as={LuChevronDown} boxSize={5} color="gray.400" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Popover.Root
      positioning={{ placement: variant === 'collapsed' ? "right" : "bottom" }}
      onOpenChange={(details) => setIsOpen(details.open)}
    >
      <Popover.Trigger asChild>
        <Box
          bg={isOpen ? "whiteAlpha.200" : "transparent"} // Graue Hervorhebung wenn aktiv
          borderRadius="md"
        >
          {renderTrigger()}
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            zIndex={DROPDOWN_Z_INDEX}
            bg="#10141C" // Dunkler, undurchsichtiger Hintergrund
            backdropFilter="none" // Verhindert Transparenz-Effekte
            borderColor="transparent"
            boxShadow="0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)"
            borderRadius="lg"
            p="1.5"
            minW="240px" // Noch breiteres Popover
            w="240px" // Feste Breite
            maxW="240px" // Maximale Breite
            mt="1" // Vertikaler Abstand nach unten
            ml={variant === 'collapsed' ? "2" : "2"} // Abstand nach rechts, damit das Popover in Flucht mit dem Trigger ist
            maxH="40vh" // Scrollbar wenn viele Server
            overflowY="auto"
            position="relative" // Für korrektes Stacking
            style={{
              backdropFilter: 'none',
              backgroundColor: '#10141C',
              position: 'relative',
              zIndex: DROPDOWN_Z_INDEX,
              isolation: 'isolate' // Erzeugt einen neuen Stacking-Kontext
            }} // Verhindert Transparenz-Effekte und setzt Hintergrundfarbe
          >
            <Popover.Body p="0">
              {availableGuilds.map((guild) => (
                <Box
                  key={guild.id}
                  onClick={() => handleSelectGuild(guild)}
                  bg={selectedGuild?.id === guild.id ? 'whiteAlpha.200' : 'transparent'} // Ausgewählte hervorheben mit dezentem Grau wie beim Hovern über SideNav
                  color={selectedGuild?.id === guild.id ? 'white' : 'gray.100'}
                  fontSize="sm"
                  borderRadius="md"
                  px="2.5"
                  py="1.5"
                  _hover={{ bg: "whiteAlpha.200", color: "white" }}
                  cursor="pointer"
                >
                  <Flex align="center" gap={2} w="full" maxW="100%" overflow="hidden">
                    <Box flexShrink={0} minW="24px"> {/* Feste Breite für das Icon, verhindert Quetschen */}
                      {guild.icon_url ? (
                        <img
                          src={guild.icon_url}
                          alt={guild.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <Flex
                          w="6"
                          h="6"
                          bg="gray.700"
                          color="white"
                          fontWeight="bold"
                          fontSize="xs"
                          align="center"
                          justify="center"
                          borderRadius="md"
                          flexShrink={0}
                        >
                          {guild.name.charAt(0).toUpperCase()}
                        </Flex>
                      )}
                    </Box>
                    <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" flex="1">
                      {guild.name}
                    </Text>
                  </Flex>
                </Box>
              ))}

              <Box as="hr" borderColor="whiteAlpha.100" my="1.5" />

              <Box
                bg="transparent"
                color="green.300"
                fontSize="sm"
                borderRadius="md"
                px="2.5"
                py="1.5"
                _hover={{ bg: "whiteAlpha.50", color: "green.200" }}
                onClick={() => window.open(DISCORD_BOT_INVITE_URL, '_blank', 'noopener,noreferrer')}
                cursor="pointer"
              >
                <Flex align="center" gap={2}>
                  <Box as={LuPlus} boxSize={4} color="green.400" />
                  <Text>Bot zu Server einladen</Text>
                </Flex>
              </Box>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}

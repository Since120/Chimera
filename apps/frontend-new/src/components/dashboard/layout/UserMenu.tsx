// apps/frontend-new/src/components/dashboard/layout/UserMenu.tsx
"use client";
import {
  Box,
  Text,
  Icon,
  Button,
  Flex,
  useDisclosure
} from "@chakra-ui/react";
import { useAuth } from "@/context/auth-context";
import { LuLogOut, LuBell, LuSettings } from "react-icons/lu";
import { useRef, useEffect } from "react";

interface UserMenuProps {
  showBellInMenu?: boolean;
  showSettingsInMenu?: boolean;
}

export default function UserMenu({ showBellInMenu = false, showSettingsInMenu = false }: UserMenuProps) {
  const { user, logout } = useAuth();
  const userName = user?.username || 'Benutzer'; // Fallback-Name
  const { open: isOpen, onOpen, onClose } = useDisclosure();
  const avatarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Schließen des Menüs bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        avatarRef.current &&
        menuRef.current &&
        !avatarRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout(true); // Mit Redirect zur Login-Seite
    onClose();
  };

  return (
    <Box position="relative" display="inline-block">
      {/* Avatar/Initialen-Kreis als Trigger */}
      <Box
        ref={avatarRef}
        as="button"
        w="10"
        h="10"
        borderRadius="full"
        bg="gray.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontWeight="bold"
        fontSize="md"
        cursor="pointer"
        border="2px solid"
        borderColor="whiteAlpha.300"
        _hover={{ borderColor: "nav.activeGreen" }}
        _focusVisible={{ outline: "2px solid", outlineColor: "nav.activeGreen", outlineOffset: "2px" }}
        transition="all 0.2s"
        overflow="hidden"
        onClick={isOpen ? onClose : onOpen}
      >
        {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
      </Box>

      {/* Dropdown-Menü */}
      {isOpen && (
          <Box
            ref={menuRef}
            position="absolute"
            top="calc(100% + 8px)" // 8px Abstand vom Avatar
            right="0" // Ausrichtung an der rechten Kante des Avatars
            bg="#10141C" // Dunklerer, satterer Hintergrund
            borderColor="transparent" // Rand entfernen
            borderWidth="0"
            boxShadow="0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)" // Weicherer, mehrstufiger Schatten
            borderRadius="lg" // Etwas stärker abgerundet als 'md'
            p="1.5" // Kompakteres Padding (6px statt 8px)
            minW="220px" // Etwas breiter
            zIndex={1000}
          >
            {/* Benutzername Section */}
            <Box px={2.5} py={2} mb={1}>
              <Text fontWeight="semibold" color="gray.100" fontSize="sm" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {userName}
              </Text>
            </Box>

            {/* Konditionaler Trenner */}
            {(showBellInMenu || showSettingsInMenu) && (
              <Box borderBottomWidth="1px" borderColor="whiteAlpha.100" my="1" />
            )}

            {/* Konditionales Bell Item */}
            {showBellInMenu && (
              <Button
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  console.log("Navigate to Notifications");
                  onClose();
                }}
                bg="transparent"
                color="gray.100" // Hellerer Text
                fontSize="sm" // Kleinere Schriftgröße
                borderRadius="md" // Passend zur Liste
                px="2.5" // Konsistentes Padding
                py="1.5"
                h="auto"
                width="100%"
                _hover={{ bg: "whiteAlpha.50", color: "white" }} // Subtilerer Hover
              >
                <Flex gap={2} align="center">
                  <Icon as={LuBell} boxSize={4} color="gray.400" /> {/* Subtilere Icon-Farbe */}
                  <Text>Benachrichtigungen</Text>
                </Flex>
              </Button>
            )}

            {/* Konditionales Settings Item */}
            {showSettingsInMenu && (
              <Button
                variant="ghost"
                justifyContent="flex-start"
                onClick={() => {
                  console.log("Navigate to Settings");
                  onClose();
                }}
                bg="transparent"
                color="gray.100"
                fontSize="sm"
                borderRadius="md"
                px="2.5"
                py="1.5"
                h="auto"
                width="100%"
                _hover={{ bg: "whiteAlpha.50", color: "white" }}
              >
                <Flex gap={2} align="center">
                  <Icon as={LuSettings} boxSize={4} color="gray.400" />
                  <Text>Einstellungen</Text>
                </Flex>
              </Button>
            )}

            {/* Immer sichtbarer Trenner vor Logout */}
            <Box borderBottomWidth="1px" borderColor="whiteAlpha.100" my="1" />

            {/* Logout Item */}
            <Button
              variant="ghost"
              justifyContent="flex-start"
              onClick={handleLogout}
              bg="transparent"
              color="red.400" // Farbe beibehalten
              fontSize="sm"
              borderRadius="md"
              px="2.5"
              py="1.5"
              h="auto"
              width="100%"
              _hover={{ bg: "rgba(239, 68, 68, 0.1)", color: "red.300" }} // Subtilerer roter Hover
            >
              <Flex gap={2} align="center">
                <Icon as={LuLogOut} boxSize={4} color="red.400" /> {/* Farbe beibehalten */}
                <Text>Abmelden</Text>
              </Flex>
            </Button>
          </Box>
      )}
    </Box>
  );
}

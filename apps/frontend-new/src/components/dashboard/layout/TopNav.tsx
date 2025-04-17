// apps/frontend-new/src/components/dashboard/layout/TopNav.tsx
"use client";

import { Flex, Box, Icon, Button, Text, HStack, IconButton } from "@chakra-ui/react";
import { LuBell, LuSettings, LuLayoutGrid, LuCalendar, LuClipboardList, LuFileText, LuUsers } from "react-icons/lu";
import UserMenu from "./UserMenu";

export default function TopNav() {
  const user = { displayName: "User Name", avatarUrl: undefined }; // Platzhalter

  // Beispiel-Daten für sekundäre Navigation
  const secondaryNavItems = [
    { label: "Estimates", value: "estimates" },
    { label: "Invoices", value: "invoices", isActive: true }, // Aktiv markieren
    { label: "Payments", value: "payments" },
    { label: "Recurring Invoices", value: "recurring" },
    { label: "Checkouts", value: "checkouts" },
  ];

  // Beispiel-Daten für rechte Icons
  const actionIcons = [
    LuFileText, LuCalendar, LuClipboardList, LuUsers // Beispiel-Icons
  ];

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      pt={10} // Mehr Abstand nach oben
      pb={2}
      px={6}
      h="20" // Erhöhte Höhe für mehr Platz
      fontFamily="'Lufga', sans-serif" // Direkte Anwendung der Lufga-Schriftart
      position="sticky"
      top="0"
      zIndex="docked"
      // Entferne den expliziten Hintergrund, damit er vom Layout geerbt wird
    >
      {/* Linker Bereich: Nur Logo */}
      <Flex gap={4} align="center">
        {/* Platzhalter für Logo */}
        <Text fontWeight="bold" color="fg">
          Logo
        </Text>
      </Flex>

      {/* Mittlerer Bereich: Nav-Toggle + Sekundäre Navigation + Rechte Icons */}
      <Flex justify="center" align="center" flex="1" gap={4}>
        {/* Nav Toggle Button (als Kreis) - links neben der weißen Navigationsleiste */}
        <Button
          aria-label="Toggle Navigation"
          variant="outline"
          size="sm"
          borderRadius="full"
          p={2}
          minW={0}
          height="36px"
          width="36px"
          borderColor="nav.iconBorderColor" // Abgeschwächte Rahmenfarbe
          borderWidth="0.5px" // Noch dünnerer Rahmen
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
        >
          <Icon as={LuLayoutGrid} boxSize={4} />
        </Button>

        {/* Weiße Navigationsleiste */}
        <Flex
          borderRadius="full" // Stark abgerundet
          px={2} // Innenabstand
          py={3} // Weiter erhöht für mehr Höhe
          gap={1} // Abstand zwischen Buttons
          boxShadow="sm" // Leichter Schatten
          align="center"
          h="12" // Größere explizite Höhe (48px)
          bg="nav.bg" // Semantischer Token
        >
          {/* Dunkler Kreis mit Icon ganz links */}
          <Box
            borderRadius="full"
            p={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW="36px"
            height="36px"
            width="36px"
            bg="nav.iconCircleBg" // Semantischer Token
          >
            <Icon as={LuLayoutGrid} boxSize={4} color="nav.iconColor" />
          </Box>

          {/* Sekundäre Navigationspunkte */}
          {secondaryNavItems.map((item) => (
            <Button
              key={item.value}
              variant={undefined} // Variante entfernen (Test)
              size="sm"
              borderRadius="full"
              bg={item.isActive ? "nav.activeGreen" : "transparent"}
              color={item.isActive ? "black" : "gray.600"}
              _hover={{ bg: item.isActive ? "nav.activeGreen" : "blackAlpha.100" }}
              px={4} // Mehr Padding für besseres Aussehen
              h="10" // Höhere Buttons für die Navigation
              fontWeight={item.isActive ? "semibold" : "normal"}
              display="flex"
              alignItems="center"
              gap={1.5} // Abstand zwischen Punkt und Text
            >
              {item.isActive && (
                <Box
                  w="4px"
                  h="4px"
                  borderRadius="full"
                  bg="black"
                  mt="1px" // Leichte Anpassung der vertikalen Position
                />
              )}
              {item.label}
            </Button>
          ))}
        </Flex>

        {/* Dunkle Aktions-Icons (als Kreise) */}
        <Flex gap={2} align="center">
          {/* Nav Toggle Button entfernt - wird links neben der weißen Navigationsleiste platziert */}
          {actionIcons.map((ActionIcon, index) => (
            <Button
              key={index}
              aria-label={`Action ${index + 1}`}
              variant="outline"
              size="sm"
              borderRadius="full"
              p={2}
              minW={0}
              height="36px"
              width="36px"
              borderColor="nav.iconBorderColor" // Abgeschwächte Rahmenfarbe
              borderWidth="0.05px" // Noch dünnerer Rahmen
              color="nav.iconColor"
              _hover={{ bg: "dark.700" }}
            >
              <Icon as={ActionIcon} boxSize={4} />
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Rechter Bereich: Finale Aktionen & User */}
      <Flex gap={3} align="center">
        <Button
          aria-label="Benachrichtigungen"
          variant="ghost"
          size="sm"
          borderRadius="full"
          p={2}
          minW={0}
          height="36px"
          width="36px"
          bg="nav.iconCircleBg"
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
        >
          <Icon as={LuBell} boxSize={4} />
        </Button>
        <Button
          aria-label="Einstellungen"
          variant="ghost"
          size="sm"
          borderRadius="full"
          p={2}
          minW={0}
          height="36px"
          width="36px"
          bg="nav.iconCircleBg"
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
        >
          <Icon as={LuSettings} boxSize={4} />
        </Button>
        <UserMenu userName={user?.displayName} avatarUrl={user?.avatarUrl} />
      </Flex>
    </Flex>
  );
}

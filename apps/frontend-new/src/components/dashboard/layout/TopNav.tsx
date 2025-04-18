// apps/frontend-new/src/components/dashboard/layout/TopNav.tsx
"use client";

import { Flex, Box, Icon, Button, Text, HStack, IconButton, Menu, useBreakpointValue, Popover, Portal, useMediaQuery } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { LuBell, LuSettings, LuLayoutGrid, LuCalendar, LuClipboardList, LuFileText, LuUsers, LuMenu, LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";
import UserMenu from "./UserMenu";

interface TopNavProps {
  isExpanded?: boolean;
  toggleSidebar?: () => void;
}

export default function TopNav({ isExpanded = false, toggleSidebar }: TopNavProps) {
  const user = { displayName: "User Name", avatarUrl: undefined }; // Platzhalter

  // State für den aktiven Navigationspunkt und Popover
  const [activeSecondaryNav, setActiveSecondaryNav] = useState("invoices");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Bestimmen, ob wir auf einem kleinen Bildschirm sind (unter md)
  const isMobileView = useBreakpointValue({ base: true, md: false });

  // Effekt zum Schließen des Popovers auf größeren Bildschirmen
  useEffect(() => {
    if (!isMobileView) {
      setIsPopoverOpen(false);
    }
  }, [isMobileView]);

  // Breakpoint-basierte Anzeige der Icons mit festen Breakpoints
  // Bei 1485px die Aktions-Icons in das Dropdown verwandeln
  const shouldCollapseIcons = useBreakpointValue({
    base: true, // Auf kleinen Bildschirmen immer ausblenden
    lg: true, // Auf mittleren Bildschirmen auch ausblenden
    xl: true, // Auf großen Bildschirmen auch ausblenden
    "2xl": false, // Erst ab 2xl (1536px) anzeigen, was nahe an 1485px ist
  });

  // Bei 1200px das Settings-Icon ausblenden
  const shouldCollapseSettings = useBreakpointValue({
    base: true, // Auf kleinen Bildschirmen immer ausblenden
    lg: true, // Auf mittleren Bildschirmen auch ausblenden
    xl: false, // Ab xl (1280px) anzeigen, was nahe an 1200px ist
  });

  // Bei 1185px das Nav-Icon in der weißen Navigationsleiste ausblenden
  const shouldCollapseNavIcon = useBreakpointValue({
    base: true, // Auf kleinen Bildschirmen immer ausblenden
    md: true, // Auf mittleren Bildschirmen auch ausblenden
    lg: true, // Auf großen Bildschirmen auch ausblenden
    xl: false, // Ab xl (1280px) anzeigen, was nahe an 1185px ist
  });

  // Bei 850px das Glocken-Icon ausblenden - benutzerdefinierter Media Query
  const [isLargerThan850] = useMediaQuery(["(min-width: 850px)"]);
  const shouldCollapseBellIcon = !isLargerThan850;

  // Bei 375px das Logo ausblenden - benutzerdefinierter Media Query
  const [isLargerThan375] = useMediaQuery(["(min-width: 375px)"]);
  const shouldShowLogo = isLargerThan375;

  // Daten für sekundäre Navigation
  const secondaryNavItems = [
    { label: "Estimates", value: "estimates" },
    { label: "Invoices", value: "invoices" },
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
      // Ref entfernt
    >
      {/* Linker Bereich: Nur Logo */}
      <Flex gap={4} align="center">
        {/* Platzhalter für Logo */}
        <Text
          fontWeight="bold"
          color="fg"
          display={shouldShowLogo ? "inline-block" : "none"} // Nur ab 375px anzeigen
        >
          Logo
        </Text>
      </Flex>

      {/* Mittlerer Bereich: Nav-Toggle + Sekundäre Navigation + Rechte Icons */}
      <Flex justify="center" align="center" flex="1" gap={{ base: 2, md: 3, lg: 4 }}>
        {/* Nav Toggle Button (als Kreis) - links neben der weißen Navigationsleiste */}
        <IconButton
          aria-label={isExpanded ? "Sidebar schließen" : "Sidebar öffnen"}
          variant="outline"
          size="sm"
          borderRadius="full"
          width="36px"
          height="36px"
          padding={0}
          borderColor={isExpanded ? "nav.activeGreen" : "nav.iconOutlineColor"} // Grüner Rahmen wenn Sidebar geöffnet
          borderWidth="1px"
          transition="border-color 0.2s ease-in-out"
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
          onClick={toggleSidebar} // Sidebar ein-/ausklappen
        >
          <Icon as={isExpanded ? LuPanelLeftClose : LuPanelLeftOpen} boxSize={4} />
        </IconButton>

        {/* Weiße Navigationsleiste mit Popover für kleine Bildschirme */}
        <Popover.Root open={isMobileView ? isPopoverOpen : false} onOpenChange={(details) => isMobileView && setIsPopoverOpen(details.open)}>
          <Popover.Trigger asChild>
            <Flex
              borderRadius="full" // Stark abgerundet
              px={{ base: 1, md: 1.5, lg: 2 }} // Noch kompakterer Innenabstand bei mittleren Größen
              py={{ base: 2, md: 2.5, lg: 3 }} // Angepasste vertikale Polsterung für verschiedene Bildschirmgrößen
              gap={{ base: 0.5, md: 0.5, lg: 1 }} // Reduzierter Abstand zwischen Buttons bei mittleren Größen
              boxShadow="sm" // Leichter Schatten
              align="center"
              h={{ base: "10", md: "11", lg: "12" }} // Angepasste Höhe für verschiedene Bildschirmgrößen
              bg="nav.bg" // Semantischer Token
              maxW={{ base: "180px", sm: "220px", md: "fit-content" }} // Responsive Breite
              minH="10" // Mindesthoehe beibehalten
              cursor={{ base: "pointer", md: "default" }} // Klickbar auf Mobile
              // Ref entfernt
            >
          {/* Dunkler Kreis mit Icon ganz links - wird ausgeblendet, wenn kein Platz mehr vorhanden ist */}
          <Box
            borderRadius="full"
            p={2}
            display={shouldCollapseNavIcon ? "none" : "flex"} // Dynamisch basierend auf verfügbarem Platz
            alignItems="center"
            justifyContent="center"
            minW="36px"
            height="36px"
            width="36px"
            bg="nav.iconCircleBg" // Semantischer Token
            // Ref entfernt
          >
            <Icon as={LuLayoutGrid} boxSize={4} color="nav.iconColor" />
          </Box>

          {/* Sekundäre Navigationspunkte */}
          {secondaryNavItems.map((item) => {
            const isActive = item.value === activeSecondaryNav;
            return (
              <Button
                key={item.value}
                variant={undefined} // Variante entfernen (Test)
                size="sm"
                borderRadius="full"
                bg={isActive ? "nav.activeGreen" : "transparent"}
                color={isActive ? "black" : "gray.600"}
                _hover={{ bg: isActive ? "nav.activeGreen" : "blackAlpha.100" }}
                px={{ base: 2, md: 2.5, lg: 4 }} // Noch kompakteres Padding bei mittleren Größen
                h={{ base: "9", md: "9", lg: "10" }} // Etwas kleinere Buttons bei mittleren Größen
                fontWeight={isActive ? "semibold" : "normal"}
                display={{ base: isActive ? "flex" : "none", md: "flex" }} // Nur aktiven auf base/sm zeigen
                alignItems="center"
                gap={1.5} // Abstand zwischen Punkt und Text
                onClick={() => {
                  setActiveSecondaryNav(item.value);
                  if (isMobileView) {
                    setIsPopoverOpen(false); // Popover schließen nach Auswahl auf mobilen Geräten
                  }
                }}
              >
                {isActive && (
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
            );
          })}
            </Flex>
          </Popover.Trigger>

          {/* Popover-Inhalt für kleine Screens */}
          <Portal>
            <Popover.Positioner>
              <Popover.Content w="auto" maxW="250px">
                <Popover.Arrow bg="bg.subtle" />
                <Popover.Body bg="bg.subtle" p={2}>
                  <Flex direction="column" gap={1}>
                    {secondaryNavItems.map((item) => (
                      <Popover.CloseTrigger key={item.value} asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          justifyContent="flex-start"
                          onClick={() => {
                            setActiveSecondaryNav(item.value);
                            setIsPopoverOpen(false); // Popover schließen nach Auswahl
                          }}
                          bg={item.value === activeSecondaryNav ? "nav.activeGreen" : "transparent"}
                          color={item.value === activeSecondaryNav ? "black" : "inherit"}
                        >
                          {item.label}
                        </Button>
                      </Popover.CloseTrigger>
                    ))}
                  </Flex>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        {/* Dunkle Aktions-Icons (als Kreise) - nur anzeigen, wenn genug Platz vorhanden ist */}
        <Flex gap={2} align="center" display={shouldCollapseIcons ? "none" : "flex"}>
          {/* Nav Toggle Button entfernt - wird links neben der weißen Navigationsleiste platziert */}
          {actionIcons.map((ActionIcon, index) => (
            <IconButton
              key={index}
              aria-label={`Action ${index + 1}`}
              variant="outline"
              size="sm"
              borderRadius="full"
              width="36px"
              height="36px"
              padding={0}
              borderColor="nav.iconOutlineColor" // Subtilere Rahmenfarbe für Outline-Buttons
              color="nav.iconColor"
              _hover={{ bg: "dark.700" }}
            >
              <Icon as={ActionIcon} boxSize={4} />
            </IconButton>
          ))}
        </Flex>

        {/* Menu für zusammengefasste Icons - nur anzeigen, wenn nicht genug Platz vorhanden ist */}
        <Box display={shouldCollapseIcons ? "block" : "none"}>
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                aria-label="Weitere Aktionen"
                variant="outline"
                size="sm"
                borderRadius="full"
                width="36px"
                height="36px"
                padding={0}
                borderColor="nav.iconOutlineColor" // Subtilere Rahmenfarbe für Outline-Buttons
                color="nav.iconColor"
                _hover={{ bg: "dark.700" }}
              >
                <Icon as={LuMenu} boxSize={4} />
              </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content
                bg="dark.800"
                borderColor="dark.700"
                boxShadow="lg"
                borderRadius="md"
                p={2} // Weniger Padding für ein kompakteres Quadrat
                width="120px" // Kleinere Breite für ein kompakteres Quadrat
                height="120px" // Kleinere Höhe für ein kompakteres Quadrat
              >
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(2, 1fr)"
                  gridTemplateRows="repeat(2, 1fr)"
                  gap={1} // Weniger Abstand zwischen den Icons
                  height="100%"
                  placeItems="center" // Zentriert die Items in ihren Grid-Zellen
                >
                  {actionIcons.map((ActionIcon, index) => (
                    <Menu.Item
                      key={index}
                      value={`action-${index}`}
                      asChild
                    >
                      <IconButton
                        aria-label={`Action ${index + 1}`}
                        variant="outline" // Gleicher Stil wie die ursprünglichen Icons
                        size="sm"
                        borderRadius="full" // Runder Button wie die ursprünglichen Icons
                        width="36px"
                        height="36px"
                        padding={0}
                        borderColor="nav.iconOutlineColor" // Subtilere Rahmenfarbe für Outline-Buttons
                        color="nav.iconColor"
                        _hover={{ bg: "dark.700" }}
                        onClick={() => console.log(`Action ${index + 1} clicked`)}
                      >
                        <Icon as={ActionIcon} boxSize={4} />
                      </IconButton>
                    </Menu.Item>
                  ))}
                </Box>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
      </Flex>

      {/* Rechter Bereich: Finale Aktionen & User */}
      <Flex gap={3} align="center" position="relative">
        <IconButton
          aria-label="Benachrichtigungen"
          variant="ghost"
          size="sm"
          borderRadius="full"
          width="36px"
          height="36px"
          padding={0}
          display={shouldCollapseBellIcon ? "none" : "inline-flex"} // Bei 850px ausblenden
          bg="nav.iconCircleBg"
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
        >
          <Icon as={LuBell} boxSize={4} />
        </IconButton>
        <IconButton
          aria-label="Einstellungen"
          variant="ghost"
          size="sm"
          borderRadius="full"
          width="36px"
          height="36px"
          padding={0}
          display={shouldCollapseSettings ? "none" : "inline-flex"} // Dynamisch basierend auf verfügbarem Platz
          bg="nav.iconCircleBg"
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
          // Ref entfernt
        >
          <Icon as={LuSettings} boxSize={4} />
        </IconButton>
        <UserMenu userName={user?.displayName} avatarUrl={user?.avatarUrl} />
      </Flex>
    </Flex>
  );
}

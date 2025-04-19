// apps/frontend-new/src/components/dashboard/layout/TopNav.tsx
"use client";

import { Flex, Box, Button, Text, IconButton, Menu, useBreakpointValue, Popover, Portal, useMediaQuery, Icon } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import React, { useState, useEffect } from "react";
import { LuBell, LuSettings, LuCalendar, LuClipboardList, LuFileText, LuUsers, LuMenu, LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";
import UserMenu from "./UserMenu";
import { useRouter, usePathname } from "next/navigation";
import { mainNavItems, defaultNavIcon } from "@/config/navigation";

// Datenstruktur für die Sub-Navigation
const sectionSubNavs = {
  dashboard: [
    { label: "Übersicht", href: "/dashboard", exact: true },
    { label: "Aktivitäts-Feed", href: "/dashboard/activity" },
    { label: "Benachrichtigungen", href: "/dashboard/notifications" },
  ],
  categories: [
    { label: "Alle Kategorien", href: "/dashboard/categories", exact: true },
    { label: "Zonen Übersicht", href: "/dashboard/categories/zones" },
    { label: "Berechtigungen", href: "/dashboard/categories/permissions" },
    { label: "Setup Konfiguration", href: "/dashboard/categories/setup" },
  ],
  trading: [
    { label: "Marktplatz", href: "/dashboard/trading", exact: true },
    { label: "Meine Angebote", href: "/dashboard/trading/my-listings" },
    { label: "Transaktionen", href: "/dashboard/trading/history" },
    { label: "Item Datenbank", href: "/dashboard/trading/items" },
  ],
  settings: [
    { label: "Allgemein", href: "/dashboard/settings", exact: true },
    { label: "Mein Profil", href: "/dashboard/settings/profile" },
    { label: "Guild Einstellungen", href: "/dashboard/settings/guild" },
    { label: "Integrationen", href: "/dashboard/settings/integrations" },
  ],
  tracking: [ // Beispiel für weiteren Bereich
    { label: "Statistiken", href: "/dashboard/tracking", exact: true },
    { label: "Leaderboard", href: "/dashboard/tracking/leaderboard" },
  ],
  // Fallback oder Default
  default: [
     { label: "Übersicht", href: "/dashboard", exact: true },
  ]
};

// Hilfsfunktion zur Ermittlung des Bereichs
function getCurrentSectionKey(pathname: string): keyof typeof sectionSubNavs {
  const pathSegments = pathname.split('/').filter(Boolean); // ['dashboard', 'categories', ...]
  if (pathSegments.length >= 2 && pathSegments[1] in sectionSubNavs) {
    return pathSegments[1] as keyof typeof sectionSubNavs;
  }
  if (pathname === '/dashboard') return 'dashboard';
  return 'default'; // Fallback
}

// Motion-Komponenten definieren
const MotionFlex = motion(Flex);
const MotionBox = motion(Box);

// Varianten für die Animation der SubNav-Items
const itemVariants = {
  hidden: { opacity: 0, y: 15 }, // Startet unten, unsichtbar
  visible: { opacity: 1, y: 0 },  // Endet auf normaler Position, sichtbar
  exit: { opacity: 0, y: -15 }    // Geht nach oben raus, unsichtbar
};

// Varianten für den Container mit Staffelung
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,   // Kleine Verzögerung bevor das erste Kind startet
      staggerChildren: 0.07 // Verzögerung zwischen den Kindern
    }
  },
  exit: { opacity: 0 }
};

// Beispiel-Daten für rechte Icons
const actionIcons = [
  LuFileText, LuCalendar, LuClipboardList, LuUsers // Beispiel-Icons
];

interface TopNavProps {
  isExpanded?: boolean;
  toggleSidebar?: () => void;
  openDrawer?: () => void;
  isLargerThan1100?: boolean;
  breakpoint?: string;
}

export default function TopNav({ isExpanded = false, toggleSidebar, openDrawer, isLargerThan1100 = false }: TopNavProps) {
  // Benutzerinformationen werden direkt im UserMenu aus dem Auth-Context geladen
  const router = useRouter();
  const pathname = usePathname();

  // Ermittle den aktuellen Bereich und die entsprechenden Sub-Nav-Items
  const currentSectionKey = getCurrentSectionKey(pathname);
  const currentSubNavItems = sectionSubNavs[currentSectionKey];

  // Finde das passende Icon basierend auf dem currentSectionKey
  const activeNavItem = mainNavItems.find(item => item.key === currentSectionKey);
  const ActiveIcon = activeNavItem ? activeNavItem.icon : defaultNavIcon;

  // State für den Popover
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
  // Bei 1536px (2xl) die Aktions-Icons in das Dropdown verwandeln
  const shouldCollapseIcons = useBreakpointValue({
    base: true, // Auf kleinen Bildschirmen immer ausblenden
    sm: true,
    md: true,
    lg: true, // Auf mittleren Bildschirmen auch ausblenden
    xl: true, // Auf großen Bildschirmen auch ausblenden
    "2xl": false, // Erst ab 2xl (1536px) anzeigen
  });

  // Bei 1280px (xl) das Settings-Icon ausblenden
  const shouldCollapseSettings = useBreakpointValue({
    base: true, // Auf kleinen Bildschirmen immer ausblenden
    sm: true,
    md: true,
    lg: true, // Auf mittleren Bildschirmen auch ausblenden
    xl: false, // Ab xl (1280px) anzeigen
  });

  // Bei 1280px (xl) das Nav-Icon in der weißen Navigationsleiste ausblenden
  const shouldCollapseNavIcon = useBreakpointValue({
    base: true, // Auf kleinen Bildschirmen immer ausblenden
    sm: true,
    md: true,
    lg: true, // Auf großen Bildschirmen auch ausblenden
    xl: false, // Ab xl (1280px) anzeigen
  });

  // Bei 1150px das Glocken-Icon ausblenden - benutzerdefinierter Media Query
  const [isLargerThan1150] = useMediaQuery(["(min-width: 1150px)"]);
  const shouldCollapseBellIcon = !isLargerThan1150;

  // Bei 375px das Logo ausblenden - benutzerdefinierter Media Query
  const [isLargerThan375] = useMediaQuery(["(min-width: 375px)"]);
  const shouldShowLogo = isLargerThan375;

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
        {/* Sidebar Toggle Button - nur auf größeren Bildschirmen (>= 1100px) */}
        <Tooltip content={isExpanded ? "Sidebar schließen" : "Sidebar öffnen"} placement="bottom" showArrow>
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
            display={isLargerThan1100 ? "inline-flex" : "none"} // Nur sichtbar ab 1100px
          >
            <Icon as={isExpanded ? LuPanelLeftClose : LuPanelLeftOpen} boxSize={4} />
          </IconButton>
        </Tooltip>

        {/* Mobile Menu Toggle Button - nur auf kleinen Bildschirmen (< md) */}
        <IconButton
          aria-label="Mobile Menü öffnen"
          variant="outline"
          size="sm"
          borderRadius="full"
          width="36px"
          height="36px"
          padding={0}
          borderColor="nav.iconOutlineColor"
          borderWidth="1px"
          color="nav.iconColor"
          _hover={{ bg: "dark.700" }}
          onClick={() => openDrawer && openDrawer()} // Mobile Drawer öffnen mit Null-Check
          display={{ base: "inline-flex", md: "none" }} // Nur auf kleinen Bildschirmen anzeigen
          zIndex={10} // Höherer z-index
        >
          <Icon as={LuPanelLeftOpen} boxSize={4} />
        </IconButton>

        {/* Weiße Navigationsleiste mit Popover für kleine Bildschirme */}
        <Popover.Root open={isMobileView ? isPopoverOpen : false} onOpenChange={(details) => isMobileView && setIsPopoverOpen(details.open)}>
          <Popover.Trigger asChild>
            <MotionFlex
              layout
              transition={{ layout: { type: "spring", stiffness: 150, damping: 25, mass: 1.5 } }} // Sehr sanfter Feder-Effekt für Breitenanimation
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
          >
            {ActiveIcon ? <Icon as={ActiveIcon} boxSize={4} color="nav.iconColor" /> : <span>•</span>}
          </Box>

          {/* Bedingte Animation basierend auf dem Zustand der SubNav */}
          {isMobileView ? (
            // Einfaches Rendering ohne Animation für Mobile/Collapsed View
            currentSubNavItems.map((item) => {
              // Bestimme, ob der aktuelle Pfad mit dem Link übereinstimmt
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Button
                  key={item.href}
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
                    router.push(item.href); // Client-seitige Navigation
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
            })
          ) : (
            // Animiertes Rendering für Desktop/Expanded View
            <AnimatePresence mode="wait">
              <MotionFlex
                key={currentSectionKey} // Wichtig für AnimatePresence, um Wechsel zu erkennen
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout // Wichtig für Breitenanimation
                transition={{ layout: { type: "spring", stiffness: 150, damping: 25, mass: 1.5 } }} // Sehr sanfter Feder-Effekt für Breitenanimation
                display="flex"
                alignItems="center"
                gap={{ base: 0.5, md: 0.5, lg: 1 }}
              >
                {currentSubNavItems.map((item) => {
                  // Bestimme, ob der aktuelle Pfad mit dem Link übereinstimmt
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <motion.div key={item.href} variants={itemVariants}>
                      <Button
                        variant={undefined} // Variante entfernen (Test)
                        size="sm"
                        borderRadius="full"
                        bg={isActive ? "nav.activeGreen" : "transparent"}
                        color={isActive ? "black" : "gray.600"}
                        _hover={{ bg: isActive ? "nav.activeGreen" : "blackAlpha.100" }}
                        px={{ base: 2, md: 2.5, lg: 4 }} // Noch kompakteres Padding bei mittleren Größen
                        h={{ base: "9", md: "9", lg: "10" }} // Etwas kleinere Buttons bei mittleren Größen
                        fontWeight={isActive ? "semibold" : "normal"}
                        display="flex" // Immer anzeigen im Desktop-Modus
                        alignItems="center"
                        gap={1.5} // Abstand zwischen Punkt und Text
                        onClick={() => {
                          router.push(item.href); // Client-seitige Navigation
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
                    </motion.div>
                  );
                })}
              </MotionFlex>
            </AnimatePresence>
          )}
            </MotionFlex>
          </Popover.Trigger>

          {/* Popover-Inhalt für kleine Screens */}
          <Portal>
            <Popover.Positioner>
              <Popover.Content w="auto" maxW="250px">
                <Popover.Arrow bg="bg.subtle" />
                <Popover.Body bg="bg.subtle" p={2}>
                  <Flex direction="column" gap={1}>
                    {currentSubNavItems.map((item) => {
                      // Bestimme, ob der aktuelle Pfad mit dem Link übereinstimmt
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                      return (
                        <Popover.CloseTrigger key={item.href} asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            justifyContent="flex-start"
                            onClick={() => {
                              router.push(item.href); // Client-seitige Navigation
                              setIsPopoverOpen(false); // Popover schließen nach Auswahl
                            }}
                            bg={isActive ? "nav.activeGreen" : "transparent"}
                            color={isActive ? "black" : "inherit"}
                          >
                            {item.label}
                          </Button>
                        </Popover.CloseTrigger>
                      );
                    })}
                  </Flex>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>

        {/* Dunkle Aktions-Icons (als Kreise) - nur anzeigen, wenn genug Platz vorhanden ist */}
        <Flex gap={2} align="center" display={shouldCollapseIcons ? "none" : "flex"}>
          {/* Nav Toggle Button entfernt - wird links neben der weißen Navigationsleiste platziert */}
          {actionIcons.map((ActionIcon, index) => {
            // Tooltip-Texte für die Aktionsbuttons
            const tooltipTexts = [
              "Dokumente",
              "Kalender",
              "Aufgaben",
              "Benutzer"
            ];

            return (
              <Tooltip key={index} content={tooltipTexts[index]} placement="bottom" showArrow>
                <IconButton
                  aria-label={tooltipTexts[index]}
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
              </Tooltip>
            );
          })}
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
                bg="#10141C" // Dunklerer, satterer Hintergrund
                borderColor="transparent" // Rand entfernen
                boxShadow="0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)" // Weicherer, mehrstufiger Schatten
                borderRadius="lg" // Größerer Radius
                p="1.5" // Angepasstes Padding
                width="120px" // Kleinere Breite für ein kompakteres Quadrat
                height="120px" // Kleinere Höhe für ein kompakteres Quadrat
                zIndex="popover" // zIndex setzen
              >
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(2, 1fr)"
                  gridTemplateRows="repeat(2, 1fr)"
                  gap={1} // Weniger Abstand zwischen den Icons
                  height="100%"
                  placeItems="center" // Zentriert die Items in ihren Grid-Zellen
                >
                  {actionIcons.map((ActionIcon, index) => {
                    // Tooltip-Texte für die Aktionsbuttons
                    const tooltipTexts = [
                      "Dokumente",
                      "Kalender",
                      "Aufgaben",
                      "Benutzer"
                    ];

                    return (
                      <Menu.Item
                        key={index}
                        value={`action-${index}`}
                        asChild
                      >
                        <Tooltip content={tooltipTexts[index]} placement="bottom" showArrow>
                          <IconButton
                            aria-label={tooltipTexts[index]}
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
                        </Tooltip>
                      </Menu.Item>
                    );
                  })}
                </Box>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
      </Flex>

      {/* Rechter Bereich: Finale Aktionen & User */}
      <Flex gap={3} align="center" position="relative">
        <Tooltip content="Benachrichtigungen" placement="bottom" showArrow>
          <IconButton
            aria-label="Benachrichtigungen"
            variant="ghost"
            size="sm"
            borderRadius="full"
            width="36px"
            height="36px"
            padding={0}
            display={shouldCollapseBellIcon ? "none" : "inline-flex"} // Bei 1150px ausblenden
            bg="nav.iconCircleBg"
            color="nav.iconColor"
            _hover={{ bg: "dark.700" }}
          >
            <Icon as={LuBell} boxSize={4} />
          </IconButton>
        </Tooltip>
        <Tooltip content="Einstellungen" placement="bottom" showArrow>
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
        </Tooltip>
        {/* UserMenu mit den neuen Props */}
        <UserMenu showBellInMenu={shouldCollapseBellIcon} showSettingsInMenu={shouldCollapseSettings} />
      </Flex>
    </Flex>
  );
}

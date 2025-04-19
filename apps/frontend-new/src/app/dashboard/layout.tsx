// apps/frontend-new/src/app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Flex, useBreakpointValue, useMediaQuery } from "@chakra-ui/react";
import SideNav from "@/components/dashboard/layout/SideNav";
import TopNav from "@/components/dashboard/layout/TopNav";
import MobileDrawer from "@/components/dashboard/layout/MobileDrawer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Neuer State für Mount-Status

  // Setze Mount-Status nach dem ersten Render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Verwende useMediaQuery für den 1100px Breakpoint
  const [isLargerThan1100] = useMediaQuery(["(min-width: 1100px)"]);
  // Breakpoint-Werte für andere responsive Anpassungen
  const breakpoint = useBreakpointValue({ base: "base", md: "md", lg: "lg" });

  // Berechne die effektive Sidebar-Expansion basierend auf Breakpoint und State
  // - Über 1100px: Manuell steuerbar durch isSidebarExpanded
  // - Unter 1100px: Immer eingeklappt (Icon-Ansicht)
  // - Unter md (768px): Sidebar komplett ausgeblendet (wird durch Drawer ersetzt)
  // Effektive Expansion erst berechnen, wenn gemountet und Breakpoint bekannt
  // Wenn nicht gemountet, immer 'false' annehmen, um Flash zu vermeiden
  const actuallyExpanded = isMounted && isLargerThan1100 ? isSidebarExpanded : false;

  // Angepasste toggleSidebar-Funktion, die nur über 1100px funktioniert
  const toggleSidebar = () => {
    if (isMounted && isLargerThan1100) { // Auch hier Mount-Check hinzufügen
      setIsSidebarExpanded(!isSidebarExpanded);
    }
  };

  // Funktion zum Öffnen des Drawers
  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  return (
    <Flex
      h="100vh"
      overflowX="hidden" // Verhindert horizontale Scrollbars
      overflowY="hidden" // Verhindert vertikale Scrollbars
      // Direkte Styling-Anwendung mit style-Prop
      style={{
        backgroundColor: "#111822", // Direkter Hex-Code statt Token
        backgroundImage: `
          radial-gradient(ellipse 40% 30% at 50% 0%, rgba(27, 37, 52, 0.5) 0%, transparent 80%),
          radial-gradient(ellipse 30% 25% at 15% 15%, rgba(39, 55, 77, 0.4) 0%, transparent 70%),
          radial-gradient(ellipse 50% 35% at 80% 90%, rgba(27, 37, 52, 0.3) 0%, transparent 75%)
        `
      }}
    >
    {/* Sidebar - unter md ausblenden, unter lg immer eingeklappt */}
    <Box display={{ base: "none", md: "block" }}>
      <SideNav isExpanded={actuallyExpanded} />
    </Box>

      {/* Hauptbereich (TopNav + Seiteninhalt) */}
      <Flex
        direction="column"
        flex="1"
        overflowY="auto"
        // overflowX="hidden" wurde auf das äußere Flex-Element verschoben
        position="relative"
        boxShadow={actuallyExpanded ?
          "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3)" :
          "none"
        } // Noch stärkerer Schatten für den Elevation-Effekt
        borderWidth={actuallyExpanded ? "8px" : "0"} // Deutlich breiterer Rand
        borderColor={actuallyExpanded ? "#0c111b" : "transparent"} // Rand in der Farbe der Sidebar
        borderRadius={actuallyExpanded ? "lg" : "0"} // Stärker abgerundete Ecken wenn angehoben
        bg={actuallyExpanded ? "rgba(16, 23, 34, 0.98)" : "transparent"} // Leicht hellerer Hintergrund
        zIndex="2" // Stellt sicher, dass der Hauptinhalt über der Sidebar liegt
        transition="all 0.3s ease-in-out"
        transform={actuallyExpanded ? "perspective(800px) translateZ(40px) scale(0.98)" : "none"} // Angepasste Z-Translation und Skalierung für Elevation-Effekt ohne Y-Translation
      >
        {/* Unterer Schatten-Overlay für zusätzliche Tiefenwirkung */}
        <Box
          display={actuallyExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
          position="absolute"
          left="0"
          right="0"
          bottom="0"
          height="15px" // Größere Höhe des Verlaufs
          bgGradient="linear(to-t, rgba(0,0,0,0.3), transparent)" // Stärkerer Schatten am unteren Rand
          pointerEvents="none"
          zIndex={1}
        />

        {/* Oberer Schatten-Overlay für zusätzliche Tiefenwirkung */}
        <Box
          display={actuallyExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
          position="absolute"
          left="0"
          right="0"
          top="0"
          height="15px" // Größere Höhe des Verlaufs
          bgGradient="linear(to-b, rgba(0,0,0,0.3), transparent)" // Stärkerer Schatten am oberen Rand
          pointerEvents="none"
          zIndex={1}
        />

        {/* Linker Schatten-Overlay für zusätzliche Tiefenwirkung */}
        <Box
          display={actuallyExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
          position="absolute"
          left="0"
          top="0"
          bottom="0"
          width="15px" // Größere Breite des Verlaufs
          bgGradient="linear(to-r, rgba(0,0,0,0.3), transparent)" // Stärkerer Schatten am linken Rand
          pointerEvents="none"
          zIndex={1}
        />

        {/* Rechter Schatten-Overlay für zusätzliche Tiefenwirkung */}
        <Box
          display={actuallyExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
          position="absolute"
          right="0"
          top="0"
          bottom="0"
          width="15px" // Größere Breite des Verlaufs
          bgGradient="linear(to-l, rgba(0,0,0,0.3), transparent)" // Stärkerer Schatten am rechten Rand
          pointerEvents="none"
          zIndex={1}
        />

        {/* Zusätzlicher Schatten-Effekt für mehr Tiefe */}
        <Box
          display={actuallyExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
          position="absolute"
          left="0"
          right="0"
          top="0"
          bottom="0"
          boxShadow="inset 0 0 15px rgba(0,0,0,0.2)" // Innerer Schatten für mehr Tiefe
          borderRadius="lg" // Abgerundete Ecken passend zum Container
          pointerEvents="none"
          zIndex={1}
        />

        {/* Top Navigation */}
        <TopNav
          isExpanded={actuallyExpanded}
          toggleSidebar={toggleSidebar}
          openDrawer={openDrawer}
          isLargerThan1100={isLargerThan1100}
          breakpoint={breakpoint}
        />

        {/* Seiteninhalt */}
        <Box as="main" pt={8} px={6} pb={6} flex="1">
          {children}
        </Box>
      </Flex>

      {/* Mobile Drawer - Sichtbarkeit wird durch isOpen gesteuert */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Flex>
  );
}

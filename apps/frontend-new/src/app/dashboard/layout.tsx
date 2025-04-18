// apps/frontend-new/src/app/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import SideNav from "@/components/dashboard/layout/SideNav";
import TopNav from "@/components/dashboard/layout/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Responsive Verhalten: Auf kleinen Bildschirmen automatisch einklappen
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Sidebar auf kleinen Bildschirmen automatisch einklappen
  useEffect(() => {
    if (isMobile) {
      setIsSidebarExpanded(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <Flex
      h="100vh"
      overflow="hidden" // Verhindert Scrollbars
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
      {/* Sidebar - auf kleinen Bildschirmen ausblenden */}
      <Box display={{ base: "none", md: "block" }}>
        <SideNav isExpanded={isSidebarExpanded} />
      </Box>

      {/* Hauptbereich (TopNav + Seiteninhalt) */}
      <Flex
        direction="column"
        flex="1"
        overflowY="auto"
        overflowX="hidden" // Verhindert horizontale Scrollbars
        position="relative"
        boxShadow={isSidebarExpanded ?
          "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3)" :
          "none"
        } // Noch stärkerer Schatten für den Elevation-Effekt
        borderWidth={isSidebarExpanded ? "8px" : "0"} // Deutlich breiterer Rand
        borderColor={isSidebarExpanded ? "#0c111b" : "transparent"} // Rand in der Farbe der Sidebar
        borderRadius={isSidebarExpanded ? "lg" : "0"} // Stärker abgerundete Ecken wenn angehoben
        bg={isSidebarExpanded ? "rgba(16, 23, 34, 0.98)" : "transparent"} // Leicht hellerer Hintergrund
        zIndex="2" // Stellt sicher, dass der Hauptinhalt über der Sidebar liegt
        transition="all 0.3s ease-in-out"
        transform={isSidebarExpanded ? "perspective(800px) translateZ(40px) translateY(-4px) scale(0.98)" : "none"} // Angepasste Z-Translation, Y-Translation und Skalierung für Elevation-Effekt ohne Scrollbars
      >
        {/* Unterer Schatten-Overlay für zusätzliche Tiefenwirkung */}
        <Box
          display={isSidebarExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
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
          display={isSidebarExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
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
          display={isSidebarExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
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
          display={isSidebarExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
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
          display={isSidebarExpanded ? 'block' : 'none'} // Nur wenn Sidebar offen ist
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
        <TopNav isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />

        {/* Seiteninhalt */}
        <Box as="main" pt={8} px={6} pb={6} flex="1">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

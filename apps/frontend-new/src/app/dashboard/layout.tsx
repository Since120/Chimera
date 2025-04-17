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
        <SideNav isExpanded={isSidebarExpanded} onToggle={toggleSidebar} />
      </Box>

      {/* Hauptbereich (TopNav + Seiteninhalt) */}
      <Flex direction="column" flex="1" overflowY="auto">
        {/* Top Navigation */}
        <TopNav />

        {/* Seiteninhalt */}
        <Box as="main" pt={8} px={6} pb={6} flex="1">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

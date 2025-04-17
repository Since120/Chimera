// apps/frontend-new/src/components/dashboard/layout/SideNav.tsx
"use client";

import { Box, Button, Flex, Text, useBreakpointValue } from "@chakra-ui/react";

interface SideNavProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Categories", href: "/dashboard/categories" },
  { label: "Trading", href: "/dashboard/trading" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function SideNav({ isExpanded, onToggle }: SideNavProps) {
  // Bestimmen, ob wir auf einem kleinen Bildschirm sind (unter md)
  const isMobile = useBreakpointValue({ base: true, md: false });
  // Sidebar ist nur auf größeren Bildschirmen erweiterbar
  const showExpanded = isExpanded && !isMobile;

  return (
    <Box
      as="nav"
      // Responsive Breite: Immer '20' auf Mobile, sonst abhängig von isExpanded
      w={isMobile ? "20" : (isExpanded ? "60" : "20")}
      bg="bg.subtle"
      h="100%"
      p={4}
      display="flex"
      flexDirection="column"
      transition="width 0.2s ease-in-out"
      boxShadow="md"
      borderRightWidth="1px"
      borderColor="border.subtle"
      // Optional: Sidebar auf Mobile ausblenden
      // display={{ base: "none", md: "flex" }} // Nur auf md und größer anzeigen
    >
      {/* Firmenlogo / Titel */}
      <Box mb={6} h="8">
        {/* Logo/Titel nur anzeigen, wenn erweitert UND nicht mobile */}
        {showExpanded && <Text fontWeight="bold">Project Chimera</Text>}
      </Box>

      {/* Navigationspunkte */}
      <Flex direction="column" gap={2} flex="1">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            justifyContent="flex-start"
            size="sm"
          >
            {showExpanded ? item.label : item.label.charAt(0)}
          </Button>
        ))}
      </Flex>

      {/* Einklapp-Button am Ende - auf Mobile ausblenden */}
      {!isMobile && (
        <Button
          onClick={onToggle}
          variant="ghost"
          size="sm"
          alignSelf="center"
          mt={4}
        >
          {isExpanded ? "<<" : ">>"}
        </Button>
      )}
    </Box>
  );
}

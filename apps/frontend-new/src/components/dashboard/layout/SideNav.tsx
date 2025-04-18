// apps/frontend-new/src/components/dashboard/layout/SideNav.tsx
"use client";

import { Box, Button, Flex, Text, useMediaQuery, chakra, Icon, Link } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LuFolderKanban, LuLayoutDashboard, LuListTodo, LuActivity, LuSettings } from "react-icons/lu";

// Motion-Komponenten definieren
const MotionBox = motion(chakra.div);
const MotionFlex = motion(chakra.div);
const MotionLink = motion(chakra.a);

interface SideNavProps {
  isExpanded: boolean;
}

// NavItem Komponente mit Animationen
interface NavItemProps {
  label: string;
  href: string;
  isExpanded: boolean;
  icon: React.ElementType;
}

const NavItem = ({ label, href, isExpanded, icon }: NavItemProps) => {
  return (
    <MotionLink
      href={href}
      display="flex"
      alignItems="center"
      justifyContent={isExpanded ? "flex-start" : "center"}
      width="100%"
      px={isExpanded ? 3 : 0}
      py={2}
      borderRadius="md"
      textDecoration="none"
      color="inherit"
      _hover={{
        bg: isExpanded ? "whiteAlpha.200" : "transparent",
        textDecoration: "none"
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <MotionBox
        animate={{
          scale: isExpanded ? 1 : 1, // Keine Skalierung
          filter: isExpanded ? "brightness(0.9)" : "brightness(1)" // Leichte Abdunklung für die Sidebar
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15
        }}
        layout
      >
        <Icon as={icon} boxSize={5} />
      </MotionBox>

      {isExpanded && (
        <MotionBox
          ml={3}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.15,
            duration: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          fontWeight="medium"
        >
          {label}
        </MotionBox>
      )}
    </MotionLink>
  );
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { label: "Categories", href: "/dashboard/categories", icon: LuListTodo },
  { label: "Trading", href: "/dashboard/trading", icon: LuActivity },
  { label: "Settings", href: "/dashboard/settings", icon: LuSettings },
];

export default function SideNav({ isExpanded }: SideNavProps) {
  // Bestimmen, ob wir auf einem kleinen Bildschirm sind (unter 1100px)
  const [isLargerThan1100] = useMediaQuery(["(min-width: 1100px)"]);
  const isMobile = !isLargerThan1100;
  // Sidebar ist nur auf größeren Bildschirmen erweiterbar
  const showExpanded = isExpanded && !isMobile;

  // Definiere einen sehr dunklen Hintergrund für die Sidebar (tiefer liegend)
  const basementBg = "#0c111b"; // Sehr dunkles Blau für die Sidebar

  // Kein Schatten für die Sidebar, da sie tiefer liegt
  const sidebarShadow = "none";

  // Definiere einen subtilen Farbverlauf für zusätzliche Tiefe
  const basementGradient = "linear-gradient(to right, #0c111b, #0f1523)"

  return (
    <MotionBox
      as="nav"
      // Animierte Breite mit Framer Motion
      animate={{
        width: isMobile ? "80px" : (showExpanded ? "240px" : "80px")
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      // Konditionales Styling basierend auf isExpanded
      bg={showExpanded ? basementBg : "transparent"} // Extrem dunkler Hintergrund für maximalen Kontrast
      bgGradient={showExpanded ? basementGradient : "none"}
      position="relative" // Für den Schatten-Overlay
      h="100%"
      px={showExpanded ? 4 : 3}
      py={4}
      display={isMobile ? "none" : "flex"} // Nur auf Bildschirmen über 1100px anzeigen
      flexDirection="column"
      zIndex="0" // Stellt sicher, dass die Sidebar unter dem Hauptinhalt liegt
      boxShadow={showExpanded ? sidebarShadow : "none"} // Kein Schatten für die Sidebar
      borderRightWidth="0px"
      borderColor="transparent" // Kein Rand für die Sidebar
    >
      {/* Firmenlogo / Titel */}
      <Flex mb={6} h="8" alignItems="center" justifyContent={showExpanded ? "flex-start" : "center"}>
        {showExpanded ? (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Text fontWeight="bold">Project Chimera</Text>
          </MotionBox>
        ) : (
          <Icon as={LuFolderKanban} boxSize={6} />
        )}
      </Flex>


      {/* Navigationspunkte */}
      <Flex direction="column" gap={3} flex="1">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            href={item.href}
            icon={item.icon}
            isExpanded={showExpanded}
          />
        ))}
      </Flex>

      {/* Einklapp-Button am Ende wurde entfernt - Steuerung erfolgt jetzt über TopNav */}
    </MotionBox>
  );
}

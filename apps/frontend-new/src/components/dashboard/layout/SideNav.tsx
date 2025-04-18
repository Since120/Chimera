// apps/frontend-new/src/components/dashboard/layout/SideNav.tsx
"use client";

import { Flex, chakra, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { mainNavItems } from "@/config/navigation";
import React from "react";

// Motion-Komponenten definieren
const MotionBox = motion(chakra.div);

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
  // Erstelle ein Wrapper-Element für den Link-Inhalt
  const LinkContent = () => (
    <Flex
      as="span"
      alignItems="center"
      justifyContent={isExpanded ? "flex-start" : "center"}
      width="100%"
      px={isExpanded ? 3 : 0}
      py={2}
      borderRadius="md"
      _hover={{
        bg: isExpanded ? "whiteAlpha.200" : "transparent",
      }}
      css={{
        '&:hover': {
          transform: 'scale(1.05)',
          transition: 'transform 0.2s'
        }
      }}
    >
      {!isExpanded ? (
        <Tooltip content={label} placement="right" showArrow>
          <MotionBox
            animate={{
              scale: 1, // Keine Skalierung
              filter: "brightness(1)" // Keine Abdunklung
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15
            }}
            layout
          >
            {/* Verwende Chakra UI Icon-Komponente mit Fallback */}
            {icon ? <Icon as={icon} boxSize={5} /> : <span>•</span>}
          </MotionBox>
        </Tooltip>
      ) : (
        <MotionBox
          animate={{
            scale: 1, // Keine Skalierung
            filter: "brightness(0.9)" // Leichte Abdunklung für die Sidebar
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15
          }}
          layout
        >
          {/* Verwende Chakra UI Icon-Komponente mit Fallback */}
          {icon ? <Icon as={icon} boxSize={5} /> : <span>•</span>}
        </MotionBox>
      )}

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
    </Flex>
  );

  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <LinkContent />
    </Link>
  );
};

// Verwende die zentrale Navigation aus config/navigation.ts

export default function SideNav({ isExpanded }: SideNavProps) {
  // Wir verwenden direkt den isExpanded-Prop ohne weitere Bedingungen
  // Die Logik für die Anzeige basierend auf Breakpoints wird im Layout und über CSS gesteuert
  const showExpanded = isExpanded;

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
        width: isExpanded ? "240px" : "64px" // Immer 64px wenn nicht expandiert
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      // Konditionales Styling basierend auf isExpanded
      bg={showExpanded ? basementBg : "transparent"} // Extrem dunkler Hintergrund für maximalen Kontrast
      bgGradient={showExpanded ? basementGradient : "none"}
      position="relative" // Für den Schatten-Overlay
      h="100%"
      px={showExpanded ? 4 : 3}
      py={4}
      display={{ base: "none", md: "flex" }} // Unter md ausblenden, ab md anzeigen
      flexDirection="column"
      zIndex="0" // Stellt sicher, dass die Sidebar unter dem Hauptinhalt liegt
      boxShadow={showExpanded ? sidebarShadow : "none"} // Kein Schatten für die Sidebar
      borderRightWidth="0px"
      borderColor="transparent" // Kein Rand für die Sidebar
    >
      {/* Navigationspunkte - immer vertikal zentriert */}
      <Flex
        direction="column"
        gap={3}
        flex="1"
        justifyContent="center" // Immer zentrieren, unabhängig vom Zustand
        height="100%"
      >
        {mainNavItems.map((item) => (
          <NavItem
            key={item.key}
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

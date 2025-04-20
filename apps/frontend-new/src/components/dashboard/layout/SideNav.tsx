// apps/frontend-new/src/components/dashboard/layout/SideNav.tsx
"use client";

import { Flex, chakra, Icon, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { mainNavItems } from "@/config/navigation";
import React from "react";
import { usePathname } from "next/navigation";
import GuildSelector from "./GuildSelector"; // Importieren

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
  isActive?: boolean;
}

const NavItem = ({ label, href, isExpanded, icon, isActive = false }: NavItemProps) => {
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
      position="relative"
      bg={isActive ? (isExpanded ? "whiteAlpha.200" : "transparent") : "transparent"}
      _hover={{
        bg: isExpanded ? "whiteAlpha.200" : "transparent",
      }}
      css={{
        '&:hover': {
          transform: isActive ? 'none' : 'scale(1.05)',
          transition: 'transform 0.2s'
        }
      }}
    >
      {/* Aktiver Indikator - links vom Icon */}
      {isActive && (
        <Box
          position="absolute"
          left={0}
          top="50%"
          transform="translateY(-50%)"
          width="3px"
          height="70%"
          bg="nav.activeGreen"
          borderRadius="full"
        />
      )}

      {!isExpanded ? (
        <Tooltip content={label} placement="right" showArrow>
          <MotionBox
            // Keine x-Animation, nur Skalierung und Helligkeit
            animate={{
              scale: isActive ? 1.1 : 1,
              filter: isActive ? "brightness(1.2)" : "brightness(1)"
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              // Schnellere Animation für bessere Reaktionsfähigkeit
              duration: 0.15
            }}
            layout
          >
            {/* Verwende Chakra UI Icon-Komponente mit Fallback */}
            {icon && (
              <Icon
                as={icon}
                boxSize={5}
                color={isActive ? "nav.activeGreen" : "inherit"}
              />
            )}
          </MotionBox>
        </Tooltip>
      ) : (
        <MotionBox
          // Keine x-Animation, nur Skalierung und Helligkeit
          animate={{
            scale: isActive ? 1.1 : 1,
            filter: isActive ? "brightness(1.2)" : "brightness(0.9)"
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            // Schnellere Animation für bessere Reaktionsfähigkeit
            duration: 0.15
          }}
          layout
        >
          {/* Verwende Chakra UI Icon-Komponente mit Fallback */}
          {icon && (
            <Icon
              as={icon}
              boxSize={5}
              color={isActive ? "nav.activeGreen" : "inherit"}
            />
          )}
        </MotionBox>
      )}

      {isExpanded && (
        <MotionBox
          ml={3}
          // Keine initial-Animation beim ersten Rendern
          animate={{ opacity: 1, x: 0 }}
          // Nur Animation für Änderungen, nicht für das erste Rendern
          transition={{
            duration: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          fontWeight={isActive ? "bold" : "medium"}
          color={isActive ? "nav.activeGreen" : "inherit"}
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
  const pathname = usePathname();

  // Funktion zum Prüfen, ob ein NavItem aktiv ist
  const isItemActive = (href: string, exact?: boolean): boolean => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Definiere einen sehr dunklen Hintergrund für die Sidebar (tiefer liegend)
  const basementBg = "#0c111b"; // Sehr dunkles Blau für die Sidebar

  // Kein Schatten für die Sidebar, da sie tiefer liegt
  const sidebarShadow = "none";

  // Definiere einen subtilen Farbverlauf für zusätzliche Tiefe
  const basementGradient = "linear-gradient(to right, #0c111b, #0f1523)"

  // Varianten für die Icon-Animation
  const iconContainerVariants = {
    expanded: {
      width: "240px",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 30,
        mass: 1.2
      }
    },
    collapsed: {
      width: "64px",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 30,
        mass: 1.2
      }
    }
  };

  return (
    <MotionBox
      as="nav"
      // Animierte Breite mit Framer Motion
      variants={iconContainerVariants}
      animate={isExpanded ? "expanded" : "collapsed"}
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
      {/* Neuer Bereich für GuildSelector - auf gleicher Höhe wie TopNav Logo */}
      <Flex
        justifyContent={showExpanded ? "flex-start" : "center"} // Zentriert wenn collapsed
        mb={6} // Abstand nach unten
        mt={4} // Abstand nach oben hinzugefügt, damit es tiefer ist
        px={showExpanded ? 0 : 0} // Kein extra Padding hier
        alignItems="center" // Vertikal zentrieren im Flex
        h="10" // Höhe passend zum Avatar
      >
        <GuildSelector variant={showExpanded ? 'expanded' : 'collapsed'} />
      </Flex>

      {/* Navigationspunkte - immer vertikal zentriert */}
      <Flex
        direction="column"
        gap={3}
        flex="1"
        justifyContent="center" // Immer zentrieren, unabhängig vom Zustand
        height="100%" // Volle Höhe für Zentrierung
      >
        <AnimatePresence mode="sync">
          {mainNavItems.map((item) => (
            <motion.div
              key={item.key}
              initial={false} // Keine initiale Animation
              animate={{ opacity: 1 }} // Immer sichtbar
              exit={{ opacity: 1 }} // Keine Exit-Animation
              transition={{ duration: 0 }} // Sofortige Übergänge
            >
              <NavItem
                label={item.label}
                href={item.href}
                icon={item.icon}
                isExpanded={showExpanded}
                isActive={isItemActive(item.href, item.exact)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Flex>

      {/* Einklapp-Button am Ende wurde entfernt - Steuerung erfolgt jetzt über TopNav */}
    </MotionBox>
  );
}

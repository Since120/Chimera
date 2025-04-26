// apps/frontend-new/src/app/dashboard/categories/page.tsx
'use client';

import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import './page.css';
import { DataTable } from "@/components/core/DataTable";

import { NotchedBox } from "@/components/core/NotchedBox";
import { FilterBar } from "@/components/core/FilterBar";
import { ContentBox } from "@/components/core/ContentBox";

// Icons für die Buttons
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { FiEye, FiStar, FiCheckCircle } from "react-icons/fi";

// Komponenten für Kategorien und Zonen
import { KategorieTabelle, Kategorie } from "@/components/categories/KategorieTabelle";
import { ZonenTabelle, Zone } from "@/components/zones/ZonenTabelle";

// Daten
import { kategorien, zonenProKategorie } from "@/data/categoriesData";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



export default function CategoriesPage() {
  // States für den Vollbildmodus der verschiedenen Komponenten
  const [isContentBox1Fullscreen, setIsContentBox1Fullscreen] = useState(false);
  const [isContentBox2Fullscreen, setIsContentBox2Fullscreen] = useState(false);
  const [isNotchedBoxFullscreen, setIsNotchedBoxFullscreen] = useState(false);

  // State für die ausgewählte Kategorie
  const [selectedKategorie, setSelectedKategorie] = useState<Kategorie | null>(null);

  // Funktion zum Auswählen einer Kategorie
  const handleSelectKategorie = (kategorie: Kategorie | null) => {
    setSelectedKategorie(kategorie);
  };

  // Funktion zum Zurücksetzen der Auswahl, wenn außerhalb geklickt wird
  const handleOutsideClick = (e: React.MouseEvent) => {
    // Prüfen, ob das Klick-Event von einem Element stammt, das nicht zur Kategorie- oder Zonen-Tabelle gehört
    const target = e.target as HTMLElement;
    if (!target.closest('.kategorie-tabelle') && !target.closest('.zonen-tabelle')) {
      setSelectedKategorie(null);
    }
  };

  // Funktionen zum Umschalten des Vollbildmodus
  const toggleContentBox1Fullscreen = () => {
    setIsContentBox1Fullscreen(!isContentBox1Fullscreen);
    // Stelle sicher, dass die anderen Komponenten nicht im Vollbildmodus sind
    if (!isContentBox1Fullscreen) {
      setIsContentBox2Fullscreen(false);
      setIsNotchedBoxFullscreen(false);
    }
  };

  const toggleContentBox2Fullscreen = () => {
    setIsContentBox2Fullscreen(!isContentBox2Fullscreen);
    // Stelle sicher, dass die anderen Komponenten nicht im Vollbildmodus sind
    if (!isContentBox2Fullscreen) {
      setIsContentBox1Fullscreen(false);
      setIsNotchedBoxFullscreen(false);
    }
  };

  const toggleNotchedBoxFullscreen = () => {
    const newIsFullscreen = !isNotchedBoxFullscreen;
    console.log('Categories toggleNotchedBoxFullscreen:', { newIsFullscreen });
    setIsNotchedBoxFullscreen(newIsFullscreen);
    // Stelle sicher, dass die anderen Komponenten nicht im Vollbildmodus sind
    if (newIsFullscreen) {
      setIsContentBox1Fullscreen(false);
      setIsContentBox2Fullscreen(false);
    }
  };



  // ---- Filter Bar Inhalt (wie zuvor, als Variable für Lesbarkeit) ----
  const filterBar = (
    <FilterBar
      filters={[
        {
          id: 'filter1',
          label: 'Filter 1',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
        {
          id: 'filter2',
          label: 'Filter 2',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
        {
          id: 'filter3',
          label: 'Filter 3',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
        {
          id: 'filter4',
          label: 'Filter 4',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
        {
          id: 'filter5',
          label: 'Filter 5',
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
          ],
        },
      ]}
    />
  );
  // ----------------------------------------------

  return (
    <Flex
      direction="column"
      h={{ base: "auto", lg: "100%" }} // Auf Desktop: Füllt den verfügbaren Platz, auf Tablets: Automatische Höhe
      minH={{ base: "100%", lg: "0" }} // Auf Tablets: Mindesthöhe 100%, auf Desktop: Wichtig für Flex-Kinder
      gap={4}
      overflow={{ base: "visible", lg: "hidden" }} // Auf Tablets: Erlaubt Scrolling, auf Desktop: Verhindert Scrolling
      onClick={handleOutsideClick} // Klick-Handler zum Zurücksetzen der Auswahl
    >
      {/* 1. Seitenüberschrift - animiert im Vollbildmodus */}
      <AnimatePresence>
        {(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Heading as="h1" size="lg" mb={2}>
              Categories & Zones
            </Heading>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container für die gesamte Ansicht */}
      <Box
        position="relative"
        h={{ base: "auto", lg: "calc(100% - 40px)" }} // Auf Desktop: Feste Höhe, auf Tablets: Automatische Höhe
        overflow={{ base: "visible", lg: "hidden" }} // Auf Tablets: Erlaubt Scrolling, auf Desktop: Verhindert Scrolling
        id="dashboard-container"
        className={`fullscreen-transition ${isNotchedBoxFullscreen ? 'fullscreen-active' : ''}`}
      >
        {/* Flex-Container für die gesamte Ansicht */}
        <Flex
          direction="column"
          h={{ base: "auto", lg: "100%" }} // Auf Desktop: 100% Höhe, auf Tablets: Automatische Höhe
          position="relative"

        >
          {/* Oberer Bereich mit ContentBoxes */}
          <Box
            flex={{ base: "none", lg: "1" }} // Auf Desktop: Flex 1, auf Tablets: Keine Flex-Anpassung
            h={{ base: "auto", lg: "auto" }} // Auf Tablets: Automatische Höhe, auf Desktop: Automatische Höhe
            mb={4}
            className="content-box-container fullscreen-transition"
          >
            <Flex
              direction={{ base: "column", lg: "row" }} // Auf Tablets: Vertikal, auf Desktop: Horizontal
              gap={4}
              h={{ base: "auto", lg: "100%" }} // Auf Tablets: Automatische Höhe, auf Desktop: 100% Höhe
              position="relative"
            >
              {/* Statistikbox 1 - 3/5 der Breite */}
              <ContentBox
                size="xl" // 5/7 der Breite
                display="flex"
                flexDirection="column"
                justifyContent="center"
                backdropFilter="blur(5px)"
                canFullscreen={true}
                isFullscreen={isContentBox1Fullscreen}
                onFullscreenChange={toggleContentBox1Fullscreen}
                title="Kategorie-Übersicht"
                h={{ base: "200px", lg: "auto" }} // Auf Tablets: Feste Höhe, auf Desktop: Automatische Höhe
              >
                <Flex direction="column" gap={3} w="full">
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text color="gray.400" fontSize="xs">Gesamt</Text>
                      <Text color="white" fontSize="2xl" fontWeight="bold">24</Text>
                    </Box>
                    <Box>
                      <Text color="gray.400" fontSize="xs">Aktiv</Text>
                      <Text color="green.400" fontSize="2xl" fontWeight="bold">18</Text>
                    </Box>
                    <Box>
                      <Text color="gray.400" fontSize="xs">Inaktiv</Text>
                      <Text color="red.400" fontSize="2xl" fontWeight="bold">6</Text>
                    </Box>
                  </Flex>

                  {/* Einfaches Balkendiagramm */}
                  <Box mt={2}>
                    <Flex h="8px" w="full" bg="gray.700" borderRadius="full" overflow="hidden">
                      <Box w="75%" bg="green.400" borderLeftRadius="full" />
                      <Box w="25%" bg="red.400" borderRightRadius="full" />
                    </Flex>
                    <Flex justify="space-between" mt={1}>
                      <Text color="green.400" fontSize="xs">75% Aktiv</Text>
                      <Text color="red.400" fontSize="xs">25% Inaktiv</Text>
                    </Flex>
                  </Box>
                </Flex>
              </ContentBox>

              {/* Statistikbox 2 - 2/5 der Breite */}
              <ContentBox
                size="md" // 3/7 der Breite
                display="flex"
                flexDirection="column"
                justifyContent="center"
                backdropFilter="blur(5px)"
                canFullscreen={true}
                isFullscreen={isContentBox2Fullscreen}
                onFullscreenChange={toggleContentBox2Fullscreen}
                title="Zonen-Aktivität"
                h={{ base: "200px", lg: "auto" }} // Auf Tablets: Feste Höhe, auf Desktop: Automatische Höhe
                mb={{ base: 4, lg: 0 }} // Auf Tablets: Abstand nach unten, auf Desktop: Kein Abstand
              >
                <Flex direction="column" gap={3} w="full">

                  {/* Kreisdiagramm (vereinfacht) */}
                  <Flex justify="center" align="center" position="relative" h="80px">
                    <Box
                      position="absolute"
                      w="80px"
                      h="80px"
                      borderRadius="full"
                      bg="transparent"
                      border="8px solid"
                      borderColor="blue.400"
                      borderRightColor="transparent"
                      transform="rotate(-45deg)"
                    />
                    <Box
                      position="absolute"
                      w="80px"
                      h="80px"
                      borderRadius="full"
                      bg="transparent"
                      border="8px solid"
                      borderColor="purple.400"
                      borderTopColor="transparent"
                      borderLeftColor="transparent"
                      transform="rotate(45deg)"
                    />
                    <Text color="white" fontSize="xl" fontWeight="bold" zIndex={1}>42</Text>
                  </Flex>

                  {/* Legende */}
                  <Flex justify="space-around" mt={1}>
                    <Flex align="center" gap={1}>
                      <Box w="10px" h="10px" bg="blue.400" borderRadius="sm" />
                      <Text color="gray.300" fontSize="xs">Trading (65%)</Text>
                    </Flex>
                    <Flex align="center" gap={1}>
                      <Box w="10px" h="10px" bg="purple.400" borderRadius="sm" />
                      <Text color="gray.300" fontSize="xs">Farming (35%)</Text>
                    </Flex>
                  </Flex>
                </Flex>
              </ContentBox>
            </Flex>
          </Box>

          {/* Filterleiste */}
          <Box h="60px" mb={4} className="filter-bar-container fullscreen-transition">
            {filterBar}
          </Box>

          {/* NotchedBox-Container */}
          <Box
            flex={{ base: "none", lg: "1.5" }} // Auf Desktop: Flex 1.5, auf Tablets: Keine Flex-Anpassung
            minH={{ base: "500px", lg: "0" }} // Auf Tablets: Mindesthöhe, auf Desktop: Mindesthöhe 0 für Flex
            h={{ base: "auto", lg: "100%" }} // Auf Desktop: 100% Höhe, auf Tablets: Automatische Höhe
            position="relative" // Wichtig für die korrekte Positionierung der Kinder
            overflow={{ base: "visible", lg: "hidden" }} // Auf Desktop: Kein Overflow, auf Tablets: Overflow erlaubt
            className="notched-box-container fullscreen-transition"
          >
            <NotchedBox
              w="full"
              h="full"
              p={6}
              position="relative"
              display="flex"
              flexDirection="column"
              overflow={{ base: "visible", lg: "visible" }} // Erlaubt Überlauf für den Border, aber kontrolliert den Inhalt
              maxH={{ base: "none", lg: "100%" }} // Auf Desktop: Maximale Höhe 100%, auf Tablets: Keine Begrenzung
              buttons={[
                {
                  label: 'Alle Kategorien',
                  isActive: true,
                  icon: <FiEye size={14} />,
                  iconPosition: 'left'
                },
                {
                  label: 'Entwurf',
                  isActive: false,
                  icon: <FiStar size={14} />,
                  iconPosition: 'left'
                },
                {
                  label: 'Aktiv',
                  isActive: false,
                  icon: <FiCheckCircle size={14} />,
                  iconPosition: 'left'
                },
              ]}
              buttonSpacing={2}
              activeButtonBg="#90FF00" // Grün aus der TopBar-SubNavigation (nav.activeGreen)
              inactiveButtonBg="#1E2536" // Grau aus dem Icon-Kreis der FilterBox
              activeButtonColor="black"
              inactiveButtonColor="white"
              // Hover-Farben
              activeButtonHoverBg="#7FE000" // Etwas dunkleres Grün für Hover
              inactiveButtonHoverBg="#2A3349" // Etwas helleres Grau für Hover
              activeButtonHoverColor="black"
              inactiveButtonHoverColor="white"
              // Neue Props
              title="Kategorien"
              titleSize="lg"
              titleColor="gray.700"
              rightButtons={[
                {
                  label: 'Neu Kategorie erstellen',
                  onClick: () => console.log('Neue Kategorie erstellen'),
                  icon: <FiPlus size={14} />,
                  iconPosition: 'left'
                }
              ]}
              // Vollbildmodus-Props
              canFullscreen={true}
              isFullscreen={isNotchedBoxFullscreen}
              onFullscreenChange={toggleNotchedBoxFullscreen}
            >
              <Flex
                direction={{ base: "column", lg: "row" }} // Auf Tablets: Vertikal, auf Desktop: Horizontal
                w="full"
                h="full"
                flex="1"
                display="flex"
                overflow={{ base: "visible", lg: "hidden" }} // Auf Desktop: Kein Overflow, auf Tablets: Overflow erlaubt
                gap={4} // Abstand zwischen den Elementen
              >
                {/* Linke Seite: Kategorie-Tabelle (volle Breite oder 3/7 der Breite, je nach Auswahl) */}
                <Box
                  w={{ base: "100%", lg: selectedKategorie && zonenProKategorie[selectedKategorie.id] ? "42.8%" : "100%" }} // 3/7 der Breite auf Desktop wenn ausgewählt, sonst volle Breite
                  borderRadius="lg"
                  flex={{ base: "1", lg: "0 0 auto" }}
                  display="flex"
                  flexDirection="column"
                  minH={{ base: "0", lg: "0" }} // Wichtig für Flex-Kinder
                  h={{ base: "auto", lg: "full" }} // Auf Desktop: Volle Höhe, auf Tablets: Automatische Höhe
                  mb={{ base: "4", lg: "0" }} // Auf Tablets: Abstand nach unten, auf Desktop: Kein Abstand
                  pt="20px"
                  pb="10px"
                  overflow="auto" // Immer Scrolling erlauben
                  maxH={{ base: "none", lg: "calc(100% - 5px - 5px)" }} // Auf Desktop: Maximale Höhe, auf Tablets: Keine Begrenzung
                  className="custom-scrollbar kategorie-tabelle" // Klasse für Klick-Handler
                  transition="width 0.3s ease-in-out" // Animation für die Breitenänderung
                >
                  <KategorieTabelle
                    data={kategorien}
                    selectedKategorieId={selectedKategorie?.id || null}
                    onSelectKategorie={handleSelectKategorie}
                    compactMode={selectedKategorie && zonenProKategorie[selectedKategorie.id] ? true : false}
                  />
                </Box>

                {/* Rechte Seite: Zonen-Tabelle (4/7 der Breite) - immer anzeigen, aber mit unterschiedlicher Sichtbarkeit */}
                <Box
                  w={{ base: "100%", lg: selectedKategorie && zonenProKategorie[selectedKategorie.id] ? "57.2%" : "0%" }}
                  position="relative"
                  h={{ base: "auto", lg: "calc(100% - 40px)" }}
                  flex={{ base: "none", lg: selectedKategorie && zonenProKategorie[selectedKategorie.id] ? "1" : "0" }}
                  mt={{ base: 0, lg: "20px" }}
                  mb={{ base: 0, lg: "20px" }}
                  className="zonen-tabelle"
                  overflow="hidden"
                  transition="all 0.3s ease-in-out"
                  opacity={selectedKategorie && zonenProKategorie[selectedKategorie.id] ? 1 : 0}
                  visibility={selectedKategorie && zonenProKategorie[selectedKategorie.id] ? "visible" : "hidden"}
                >
                  {/* Eigene Box statt ContentBox */}
                  <Box
                    bg="#151A26" // Dunkler Hintergrund wie ContentBox
                    borderRadius="24px" // Abgerundete Ecken
                    boxShadow="card" // Schatten wie ContentBox
                    _hover={{ boxShadow: "cardHover" }} // Hover-Effekt wie ContentBox
                    transition="all 0.3s ease" // Transition wie ContentBox
                    h="100%" // Volle Höhe des Containers
                    w="100%" // Volle Breite des Containers
                    position="relative" // Für absolute Positionierung des Buttons
                    overflow="hidden" // Verhindert Scrolling der Box selbst
                    px={3} // Horizontales Padding
                    pt={1} // Reduziertes Padding oben
                    pb={3} // Padding unten
                  >
                    {/* Titel */}
                    <Flex
                      position="absolute"
                      top={2}
                      left={3}
                      right={3}
                      alignItems="center"
                      justifyContent="space-between"
                      zIndex={2}
                    >
                      <Box
                        fontSize="lg"
                        fontWeight="bold"
                        color="white"
                      >
                        Zonen
                      </Box>
                    </Flex>

                    {/* Button zum Erstellen einer neuen Zone */}
                    <Box
                      position="absolute"
                      top="5px"
                      right="10px"
                      zIndex="10"
                    >
                      <Box
                        as="button"
                        onClick={() => console.log('Neue Zone erstellen')}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        bg="#90FF00" // Grün wie der aktive Button in der Notch-Bar
                        color="black" // Schwarzer Text auf grünem Hintergrund
                        px={3}
                        py={2}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="medium"
                        _hover={{ bg: "#7FE000" }} // Etwas dunkleres Grün beim Hovern
                        transition="all 0.2s"
                        cursor="pointer" // Mauszeiger wird zum Pointer
                      >
                        <FiPlus size={14} />
                        <Text>Zone erstellen</Text>
                      </Box>
                    </Box>

                    {/* Scrollbarer Container für die Tabelle */}
                    <Box
                      w="100%"
                      h="calc(100% - 40px)" // Höhe abzüglich des Titels und Padding
                      mt={8} // Reduzierter Abstand für den Titel
                      overflow="auto" // Scrolling erlauben
                      className="custom-scrollbar"
                    >
                      <ZonenTabelle
                        data={selectedKategorie && zonenProKategorie[selectedKategorie.id] ? zonenProKategorie[selectedKategorie.id] : []}
                        onEdit={(zone) => console.log('Bearbeiten:', zone.name)}
                        onDelete={(zone) => console.log('Löschen:', zone.name)}
                      />
                    </Box>
                  </Box>
                </Box>
              </Flex>
            </NotchedBox>
          </Box>
        </Flex>


      </Box>
    </Flex>
  );
}

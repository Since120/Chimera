// apps/frontend-new/src/app/dashboard/categories/page.tsx
'use client';

import { Box, Flex, Heading, Text, Button, Input, SimpleGrid } from "@chakra-ui/react";
import { NotchedBox } from "@/components/core/NotchedBox";
import { FilterBar } from "@/components/core/FilterBar";
import { ContentBox } from "@/components/core/ContentBox";

// HINWEIS: KEIN useState, KEIN Framer Motion hier!

export default function CategoriesPage() {

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
    <Flex direction="column" h="full" gap={4}>
      {/* 1. Seitenüberschrift */}
      <Heading as="h1" size="lg" mb={2}>
        Categories & Zones
      </Heading>

      {/* Flex-Container für die Aufteilung des verbleibenden Platzes */}
      <Flex direction="column" flex="1" gap={0}> {/* Kein Gap hier, da die Filterleiste eigene Margins hat */}
        {/* Oberer Bereich: 3/8 der Höhe */}
        <Flex direction="column" flex="3">
          {/* 2. (Optional) Top-Card-Reihe (Platzhalter) */}
          {/*    Wie die Salesforce-Statistiken oben. Dunklerer Hintergrund. */}
          <Flex gap={4} h="full">
            {/* Statistikbox 1 - 3/5 der Breite */}
            <ContentBox
              size="xl" // 5/7 der Breite
              display="flex"
              flexDirection="column"
              justifyContent="center"
              backdropFilter="blur(5px)"
            >
              <Flex direction="column" gap={3} w="full">
                <Heading size="sm" color="white" mb={1}>Kategorie-Übersicht</Heading>
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
            >
              <Flex direction="column" gap={3} w="full">
                <Heading size="sm" color="white" mb={1}>Zonen-Aktivität</Heading>

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
        </Flex>

        {/* 3. Filterleiste */}
        {filterBar}

        {/* Unterer Bereich: 5/8 der Höhe */}
        <Flex flex="5">
          {/* 4. Haupt-Content-Kachel (Kategorie-Liste) mit NotchedBox */}
          <NotchedBox
            w="full"
            h="full"
            p={6}
            pt="70px" // Padding-Top > Nasen-Tiefe (60px)
            overflowY="auto"
            position="relative"
          >
            {/* Buttons im Aushub */}
            <Flex
              position="absolute"
              top="-60px" // Genau die Tiefe der Nase nach oben verschieben
              left="50%"
              transform="translateX(-50%)"
              width="260px" // Breite des FLACHEN Teils (330-70=260px)
              height="60px" // Höhe der Nase
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={2}
              zIndex={2}
            >
              <Button
                variant="ghost"
                bg="transparent"
                color="white"
                fontWeight="medium"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                _active={{ bg: "rgba(255,255,255,0.15)" }}
                borderRadius="md"
                size="sm"
                px={3}
              >
                Alle Kategorien
              </Button>
              <Button
                variant="ghost"
                bg="transparent"
                color="gray.400"
                fontWeight="medium"
                _hover={{ bg: "rgba(255,255,255,0.1)", color: "white" }}
                _active={{ bg: "rgba(255,255,255,0.15)" }}
                borderRadius="md"
                size="sm"
                px={3}
              >
                Entwurf
                <Box
                  ml={1.5}
                  bg="gray.700"
                  color="gray.300"
                  borderRadius="full"
                  fontSize="xs"
                  px={1.5}
                  py={0.5}
                  minW="20px"
                  textAlign="center"
                >
                  3
                </Box>
              </Button>
              <Button
                variant="solid"
                bg="#4ADE80"
                color="black"
                fontWeight="medium"
                _hover={{ bg: "#22c55e" }}
                _active={{ bg: "#16a34a" }}
                borderRadius="full"
                size="sm"
                px={4}
              >
                Aktiv
                <Box
                  ml={1.5}
                  bg="rgba(0,0,0,0.2)"
                  color="black"
                  borderRadius="full"
                  fontSize="xs"
                  px={1.5}
                  py={0.5}
                  minW="20px"
                  textAlign="center"
                >
                  5
                </Box>
              </Button>
            </Flex>
            <Flex direction="column" w="full" h="full">
              <Heading size="md" mb={4} color="gray.900" _dark={{ color: "gray.900" }}>
                Kategorie-Übersicht
              </Heading>

              {/* Suchleiste und Filter */}
              <Flex mb={4} gap={4} justify="space-between">
                <Box flex="1" maxW="400px">
                  <Flex
                    bg="gray.100"
                    _dark={{ bg: "gray.100" }}
                    borderRadius="lg"
                    px={3}
                    py={2}
                    align="center"
                    border="1px solid"
                    borderColor="gray.300"
                  >
                    <Box color="gray.500" mr={2}>
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                      </svg>
                    </Box>
                    <Input
                      type="text"
                      placeholder="Kategorie suchen..."
                      border="none"
                      bg="transparent"
                      color="gray.800"
                      _dark={{ color: "gray.800" }}
                      _placeholder={{ color: "gray.500" }}
                      flex="1"
                      _focus={{ outline: "none", boxShadow: "none" }}
                    />
                  </Flex>
                </Box>
                <Button
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  borderRadius="lg"
                  px={4}
                >
                  + Neue Kategorie
                </Button>
              </Flex>

              {/* Tabelle */}
              <Box
                w="full"
                overflowX="auto"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                flex="1"
              >
                <Box as="table" w="full" borderCollapse="collapse">
                  <Box as="thead" bg="gray.50" _dark={{ bg: "gray.50" }}>
                    <Box as="tr">
                      <Box as="th" py={3} px={4} textAlign="left" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.700" }} borderBottom="1px solid" borderColor="gray.200">
                        Name
                      </Box>
                      <Box as="th" py={3} px={4} textAlign="left" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.700" }} borderBottom="1px solid" borderColor="gray.200">
                        Typ
                      </Box>
                      <Box as="th" py={3} px={4} textAlign="left" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.700" }} borderBottom="1px solid" borderColor="gray.200">
                        Zonen
                      </Box>
                      <Box as="th" py={3} px={4} textAlign="left" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.700" }} borderBottom="1px solid" borderColor="gray.200">
                        Status
                      </Box>
                      <Box as="th" py={3} px={4} textAlign="right" fontWeight="semibold" color="gray.700" _dark={{ color: "gray.700" }} borderBottom="1px solid" borderColor="gray.200">
                        Aktionen
                      </Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {/* Zeile 1 */}
                    <Box as="tr" _hover={{ bg: "gray.50" }} _dark={{ _hover: { bg: "gray.50" } }}>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        Trading Zone Alpha
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        <Box as="span" px={2} py={1} bg="blue.100" color="blue.800" borderRadius="md" fontSize="sm">
                          Trading
                        </Box>
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        8
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200">
                        <Box as="span" px={2} py={1} bg="green.100" color="green.800" borderRadius="md" fontSize="sm">
                          Aktiv
                        </Box>
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" textAlign="right">
                        <Button size="sm" variant="ghost" color="blue.500" mr={2}>
                          Bearbeiten
                        </Button>
                        <Button size="sm" variant="ghost" color="red.500">
                          Löschen
                        </Button>
                      </Box>
                    </Box>

                    {/* Zeile 2 */}
                    <Box as="tr" _hover={{ bg: "gray.50" }} _dark={{ _hover: { bg: "gray.50" } }}>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        Farming Beta
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        <Box as="span" px={2} py={1} bg="purple.100" color="purple.800" borderRadius="md" fontSize="sm">
                          Farming
                        </Box>
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        12
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200">
                        <Box as="span" px={2} py={1} bg="green.100" color="green.800" borderRadius="md" fontSize="sm">
                          Aktiv
                        </Box>
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" textAlign="right">
                        <Button size="sm" variant="ghost" color="blue.500" mr={2}>
                          Bearbeiten
                        </Button>
                        <Button size="sm" variant="ghost" color="red.500">
                          Löschen
                        </Button>
                      </Box>
                    </Box>

                    {/* Zeile 3 */}
                    <Box as="tr" _hover={{ bg: "gray.50" }} _dark={{ _hover: { bg: "gray.50" } }}>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        PvP Arena
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        <Box as="span" px={2} py={1} bg="red.100" color="red.800" borderRadius="md" fontSize="sm">
                          PvP
                        </Box>
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" color="gray.800" _dark={{ color: "gray.800" }}>
                        4
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200">
                        <Box as="span" px={2} py={1} bg="red.100" color="red.800" borderRadius="md" fontSize="sm">
                          Inaktiv
                        </Box>
                      </Box>
                      <Box as="td" py={3} px={4} borderBottom="1px solid" borderColor="gray.200" textAlign="right">
                        <Button size="sm" variant="ghost" color="blue.500" mr={2}>
                          Bearbeiten
                        </Button>
                        <Button size="sm" variant="ghost" color="red.500">
                          Löschen
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </NotchedBox>
        </Flex>
      </Flex>
    </Flex>
  );
}

// apps/frontend-new/src/app/dashboard/categories/page.tsx
'use client';

import { Box, Flex, Heading, Text, useDisclosure } from "@chakra-ui/react";
import './page.css';
import { DataTable } from "@/components/core/DataTable";

import { NotchedBox } from "@/components/core/NotchedBox";
import { FilterBar } from "@/components/core/FilterBar";
import { ContentBox } from "@/components/core/ContentBox";
import { Modal } from "@/components/core/Modal";

// Icons für die Buttons
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { FiEye, FiStar, FiCheckCircle } from "react-icons/fi";

// Komponenten für Kategorien und Zonen
import { KategorieTabelle, Kategorie } from "@/components/categories/KategorieTabelle";
import { ZonenTabelle, Zone } from "@/components/zones/ZonenTabelle";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { ZoneForm } from "@/components/zones/ZoneForm";

// Hooks für Daten und Mutationen
import { useCategories } from "@/hooks/data/useCategoriesData";
import { useZones } from "@/hooks/data/useZonesData";
import { useGuildRoles } from "@/hooks/data/useGuildRoles";
import { useCreateCategory } from "@/hooks/mutations/useCreateCategory";
import { useUpdateCategory } from "@/hooks/mutations/useUpdateCategory";
import { useDeleteCategory } from "@/hooks/mutations/useDeleteCategory";
import { useCreateZone } from "@/hooks/mutations/useCreateZone";
import { useUpdateZone } from "@/hooks/mutations/useUpdateZone";
import { useDeleteZone } from "@/hooks/mutations/useDeleteZone";
import { useHasPermission } from "@/hooks/useHasPermission";
import { useGuild } from "@/context/guild-context";
import { useToast } from "@/hooks/useToast";
import { Button } from "@chakra-ui/react";

// Typen
import { ScopeType } from "shared-types";
import type { CreateCategoryDto, UpdateCategoryDto, CreateZoneDto, UpdateZoneDto } from "shared-types";
import type { ExtendedCategoryDto, ExtendedZoneDto } from "@/types/categories";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';



export default function CategoriesPage() {
  // Hooks für Daten und Berechtigungen
  const { selectedGuild } = useGuild();
  const toast = useToast();
  const hasCreatePermission = useHasPermission('category:create');
  const hasUpdatePermission = useHasPermission('category:update');
  const hasDeletePermission = useHasPermission('category:delete');

  // States für den Vollbildmodus der verschiedenen Komponenten
  const [isContentBox1Fullscreen, setIsContentBox1Fullscreen] = useState(false);
  const [isContentBox2Fullscreen, setIsContentBox2Fullscreen] = useState(false);
  const [isNotchedBoxFullscreen, setIsNotchedBoxFullscreen] = useState(false);

  // State für die ausgewählte Kategorie
  const [selectedKategorie, setSelectedKategorie] = useState<Kategorie | null>(null);
  const [selectedCategoryDto, setSelectedCategoryDto] = useState<ExtendedCategoryDto | null>(null);

  // States für Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Kategorie | null>(null);
  const [editingCategoryDto, setEditingCategoryDto] = useState<ExtendedCategoryDto | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Kategorie | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);

  // Daten-Hooks
  const {
    categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError
  } = useCategories(selectedGuild?.id);

  const {
    zones,
    isLoading: isZonesLoading,
    isError: isZonesError,
    error: zonesError
  } = useZones(selectedCategoryDto?.id);

  const {
    roles,
    isLoading: isRolesLoading
  } = useGuildRoles(selectedGuild?.id);

  // Debug-Ausgabe für die Rollen
  useEffect(() => {
    console.log('Geladene Discord-Rollen:', roles);

    // Überprüfe, ob die Rollen korrekt geladen wurden
    if (roles && roles.length > 0) {
      console.log('Erste Rolle:', roles[0]);
      console.log('Anzahl der Rollen:', roles.length);

      // Detaillierte Ausgabe der Rollen-IDs und -Namen
      console.log('Alle Rollen-IDs und Namen:', roles.map(role => ({
        id: role.id,
        idType: typeof role.id,
        name: role.name
      })));
    } else {
      console.warn('Keine Rollen geladen oder leeres Array');
    }
  }, [roles]);

  // Mutation-Hooks
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone();
  const deleteZoneMutation = useDeleteZone();

  // Mapping von CategoryDto zu KategorieUI
  const kategorien = useMemo(() => {
    if (!categories) return [];

    const result = categories.map(category => {
      // Erstelle das Basis-Kategorie-Objekt
      const kategorie: Kategorie = {
        id: category.id,
        name: category.name,
        description: category.description || '',
        zones: category.zones?.length || 0,
        activeZones: category.zones?.filter(z => z.active).length || 0,
        users: category.userCount || 0,
        activeUsers: category.activeUserCount || 0,
        visible: category.isVisibleDefault,
        tracking: category.defaultTrackingEnabled,
        setup: category.setupFlowEnabled,
        roles: category.discordRoleIds?.join(',') || '',
        lastAccess: category.lastAccessAt ? new Date(category.lastAccessAt).toLocaleString() : 'Nie',
        lastUser: category.lastAccessUser || '',
        totalTime: category.totalTimeSpent ? `${Math.floor(category.totalTimeSpent / 60)}h ${category.totalTimeSpent % 60}m` : '0h 0m'
      };

      // Wenn roles noch laden (isRolesLoading), setze rolesInfo auf undefined
      if (isRolesLoading) {
        kategorie.rolesInfo = undefined;
        console.log('Rollen werden noch geladen für Kategorie:', category.name);
      } else if (!category.discordRoleIds || category.discordRoleIds.length === 0) {
        // Wenn keine Rollen-IDs vorhanden sind, setze rolesInfo auf null
        console.log('Keine Rollen-IDs für Kategorie:', category.name);
        kategorie.rolesInfo = null;
      } else {
        // Wenn Rollen geladen sind: Suche die entsprechenden Rollenobjekte
        console.log('Verarbeite Kategorie:', category.name);
        console.log('Discord Role IDs:', category.discordRoleIds);
        console.log('Verfügbare Rollen:', roles?.map(r => ({ id: r.id, name: r.name })));

        // Stelle sicher, dass discordRoleIds ein Array ist
        const roleIds = Array.isArray(category.discordRoleIds) ? category.discordRoleIds : [];

        // Suche die Rollen-Objekte für die IDs
        kategorie.rolesInfo = roleIds
          .map(roleId => {
            // Stelle sicher, dass roleId ein String ist
            const roleIdStr = String(roleId);

            // Suche die Rolle mit String-Vergleich
            const role = roles?.find(r => String(r.id) === roleIdStr);

            // Debug-Ausgabe für gefundene/nicht gefundene Rolle
            if (role) {
              console.log('Rolle gefunden:', role.name, 'für ID:', roleIdStr);
            } else {
              console.warn('Keine Rolle gefunden für ID:', roleIdStr);
            }

            return role ? {
              id: role.id,
              name: role.name,
              colorHex: role.colorHex
            } : null;
          })
          .filter(Boolean) as Array<{id: string; name: string; colorHex?: string}>;

        console.log('Kategorie', category.name, 'rolesInfo:', kategorie.rolesInfo);

        // Wenn keine Rollen gefunden wurden, setze rolesInfo auf null
        if (kategorie.rolesInfo.length === 0) {
          kategorie.rolesInfo = null;
        }
      }

      return kategorie;
    });

    // Debug-Ausgabe für die Kategorien und ihre Rollen
    console.log('Kategorien mit Rollen:', result.map((k) => ({
      id: k.id,
      name: k.name,
      roles: k.roles,
      rolesInfo: k.rolesInfo
    })));

    return result;
  }, [categories, roles, isRolesLoading]);

  // Mapping von ZoneDto zu ZoneUI
  const zonenProKategorie = useMemo(() => {
    if (!zones || !selectedKategorie) return {};

    const zonenListe = zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      key: zone.key,
      points: zone.pointsPerInterval || 0,
      minutes: zone.intervalMinutes || 0,
      lastAccess: zone.lastAccessAt ? new Date(zone.lastAccessAt).toLocaleString() : 'Nie',
      usageTime: zone.totalTimeSpent ? `${Math.floor(zone.totalTimeSpent / 60)}h ${zone.totalTimeSpent % 60}m` : '0h 0m'
    }));

    return { [selectedKategorie.id]: zonenListe };
  }, [zones, selectedKategorie]);

  // Effekt zum Aktualisieren des ausgewählten CategoryDto, wenn sich selectedKategorie ändert
  useEffect(() => {
    if (selectedKategorie && categories) {
      const categoryDto = categories.find(c => c.id === selectedKategorie.id) || null;
      setSelectedCategoryDto(categoryDto);
    } else {
      setSelectedCategoryDto(null);
    }
  }, [selectedKategorie, categories]);

  // Funktion zum Auswählen einer Kategorie
  const handleSelectKategorie = (kategorie: Kategorie | null) => {
    setSelectedKategorie(kategorie);
  };

  // Funktion zum Zurücksetzen der Auswahl, wenn außerhalb geklickt wird
  const handleOutsideClick = (e: React.MouseEvent) => {
    // Wenn das Zonen-Modal geöffnet ist, keine Aktion ausführen
    if (isZoneModalOpen) return;

    const target = e.target as HTMLElement;

    // Prüfen, ob der Klick auf einen Button erfolgt ist
    const isAnyButton = target.closest('button') !== null;

    // Wenn auf einen Button geklickt wurde, keine Aktion ausführen
    // Dies verhindert, dass die Zonentabelle geschlossen wird, wenn auf irgendeinen Button geklickt wird
    if (isAnyButton) {
      return;
    }

    // Prüfen, ob das Klick-Event von einem Element stammt, das nicht zur Kategorie- oder Zonen-Tabelle gehört
    if (!target.closest('.kategorie-tabelle') && !target.closest('.zonen-tabelle')) {
      setSelectedKategorie(null);
    }
  };

  // Handler für Kategorie-Modal
  const handleOpenCreateCategoryModal = () => {
    if (!hasCreatePermission) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Kategorien zu erstellen.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setEditingCategory(null);
    setEditingCategoryDto(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (kategorie: Kategorie) => {
    if (!hasUpdatePermission) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Kategorien zu bearbeiten.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setEditingCategory(kategorie);
    const categoryDto = categories.find(c => c.id === kategorie.id) || null;
    setEditingCategoryDto(categoryDto);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  const handleCategoryFormSubmit = (data: Partial<Kategorie>) => {
    if (!selectedGuild) {
      toast({
        title: "Fehler",
        description: "Keine Guild ausgewählt.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (editingCategory) {
      // Update existing category
      const updateData: UpdateCategoryDto = {
        name: data.name || '',
        discordRoleIds: data.roles ? data.roles.split(',').filter(Boolean) : [],
        isVisibleDefault: data.visible || false,
        defaultTrackingEnabled: data.tracking || false,
        setupFlowEnabled: data.setup || false,
      };

      updateCategoryMutation.mutate({
        categoryId: editingCategory.id,
        data: updateData
      });
    } else {
      // Create new category
      const createData: CreateCategoryDto = {
        name: data.name || '',
        discordRoleIds: data.roles ? data.roles.split(',').filter(Boolean) : [],
        isVisibleDefault: data.visible || false,
        defaultTrackingEnabled: data.tracking || false,
        setupFlowEnabled: data.setup || false,
        scope: {
          id: '', // Wird vom Backend generiert
          scopeType: ScopeType.GUILD,
          scopeId: selectedGuild.id
        }
      };

      createCategoryMutation.mutate(createData);
    }

    handleCloseCategoryModal();
  };

  // Handler für Kategorie löschen
  const handleDeleteCategory = (kategorie: Kategorie) => {
    if (!hasDeletePermission) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie haben keine Berechtigung, Kategorien zu löschen.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setCategoryToDelete(kategorie);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          if (selectedKategorie?.id === categoryToDelete.id) {
            setSelectedKategorie(null);
          }
          toast({
            title: 'Kategorie gelöscht',
            description: `Die Kategorie "${categoryToDelete.name}" wurde erfolgreich gelöscht.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        }
      });
    }
    setIsDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  // Handler für Zonen-Modal
  const handleOpenCreateZoneModal = () => {
    if (!selectedKategorie) {
      toast({
        title: "Fehler",
        description: "Keine Kategorie ausgewählt.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setEditingZone(null);
    setIsZoneModalOpen(true);
  };

  const handleOpenEditZoneModal = (zone: Zone) => {
    setEditingZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleCloseZoneModal = () => {
    setIsZoneModalOpen(false);
  };

  const handleZoneFormSubmit = (data: Partial<Zone>) => {
    if (!selectedCategoryDto) {
      toast({
        title: "Fehler",
        description: "Keine Kategorie ausgewählt.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (editingZone) {
      // Update existing zone
      const updateData: UpdateZoneDto = {
        name: data.name || '',
        pointsPerInterval: data.points || 0,
        intervalMinutes: data.minutes || 0
      };

      updateZoneMutation.mutate({
        zoneId: editingZone.id,
        data: updateData,
        categoryId: selectedCategoryDto.id
      });
    } else {
      // Create new zone
      const createData: CreateZoneDto = {
        name: data.name || '',
        zoneKey: data.key || '',
        pointsPerInterval: data.points || 0,
        intervalMinutes: data.minutes || 0
      };

      createZoneMutation.mutate({
        categoryId: selectedCategoryDto.id,
        data: createData
      });
    }

    handleCloseZoneModal();
  };

  // Handler für Zone löschen
  const handleDeleteZone = (zone: Zone) => {
    setZoneToDelete(zone);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteZone = () => {
    if (zoneToDelete && selectedCategoryDto) {
      deleteZoneMutation.mutate(zoneToDelete.id, {
        onSuccess: () => {
          toast({
            title: 'Zone gelöscht',
            description: `Die Zone "${zoneToDelete.name}" wurde erfolgreich gelöscht.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        }
      });
    }
    setIsDeleteConfirmOpen(false);
    setZoneToDelete(null);
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
                  onClick: handleOpenCreateCategoryModal,
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
                  {isCategoriesLoading ? (
                    <Box textAlign="center" py={10}>
                      <Text>Kategorien werden geladen...</Text>
                    </Box>
                  ) : isCategoriesError ? (
                    <Box textAlign="center" py={10}>
                      <Text color="red.500">Fehler beim Laden der Kategorien</Text>
                    </Box>
                  ) : kategorien.length === 0 ? (
                    <Box textAlign="center" py={10}>
                      <Text>Keine Kategorien gefunden</Text>
                    </Box>
                  ) : (
                    <>
                      {console.log('Rollen an KategorieTabelle übergeben:', roles)}
                      {console.log('Kategorien an KategorieTabelle übergeben:', kategorien)}
                      <KategorieTabelle
                        data={kategorien}
                        selectedKategorieId={selectedKategorie?.id || null}
                        onSelectKategorie={handleSelectKategorie}
                        onEdit={handleOpenEditCategoryModal}
                        onDelete={handleDeleteCategory}
                        compactMode={selectedKategorie && zonenProKategorie[selectedKategorie.id] ? true : false}
                      />
                    </>
                  )}
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
                        onClick={handleOpenCreateZoneModal}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={1.5}
                        bg="#90FF00" // Grün wie der aktive Button in der Notch-Bar
                        color="black" // Schwarzer Text auf grünem Hintergrund
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="medium"
                        _hover={{ bg: "#7FE000" }} // Etwas dunkleres Grün beim Hovern
                        transition="all 0.2s"
                        cursor="pointer" // Mauszeiger wird zum Pointer
                        h="28px" // Explizite Höhe für konsistente Größe
                      >
                        <FiPlus size={12} />
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
                      {isZonesLoading ? (
                        <Box textAlign="center" py={10}>
                          <Text>Zonen werden geladen...</Text>
                        </Box>
                      ) : isZonesError ? (
                        <Box textAlign="center" py={10}>
                          <Text color="red.500">Fehler beim Laden der Zonen</Text>
                        </Box>
                      ) : selectedKategorie && zonenProKategorie[selectedKategorie.id]?.length === 0 ? (
                        <Box textAlign="center" py={10}>
                          <Text>Keine Zonen in dieser Kategorie</Text>
                        </Box>
                      ) : (
                        <ZonenTabelle
                          data={selectedKategorie && zonenProKategorie[selectedKategorie.id] ? zonenProKategorie[selectedKategorie.id] : []}
                          onEdit={handleOpenEditZoneModal}
                          onDelete={handleDeleteZone}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Flex>
            </NotchedBox>
          </Box>
        </Flex>


      </Box>

      {/* Kategorie-Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        title={editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}
        size="lg"
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleCategoryFormSubmit}
          onCancel={handleCloseCategoryModal}
          isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
        />
      </Modal>

      {/* Zonen-Modal */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={handleCloseZoneModal}
        title={editingZone ? "Zone bearbeiten" : "Neue Zone erstellen"}
        size="lg"
      >
        <ZoneForm
          initialData={editingZone}
          onSubmit={handleZoneFormSubmit}
          onCancel={handleCloseZoneModal}
          isLoading={createZoneMutation.isPending || updateZoneMutation.isPending}
        />
      </Modal>

      {/* Bestätigungsdialog für Löschen */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title={categoryToDelete ? "Kategorie löschen" : zoneToDelete ? "Zone löschen" : "Element löschen"}
        size="md"
      >
        <Box p={4}>
          <Text mb={4}>
            {categoryToDelete
              ? `Sind Sie sicher, dass Sie die Kategorie "${categoryToDelete.name}" löschen möchten? Alle zugehörigen Zonen werden ebenfalls gelöscht.`
              : zoneToDelete
                ? `Sind Sie sicher, dass Sie die Zone "${zoneToDelete.name}" löschen möchten?`
                : "Sind Sie sicher, dass Sie dieses Element löschen möchten?"}
          </Text>
          <Flex justifyContent="flex-end" gap={3} mt={4}>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              borderRadius="full"
              borderColor="button.modalSecondary.borderColor"
              color="button.modalSecondary.color"
              _hover={{
                bg: "button.modalSecondary.hoverBg",
                boxShadow: "cardHover"
              }}
              size="md"
              px={5}
            >
              Abbrechen
            </Button>
            <Button
              bg="red.500"
              color="white"
              borderRadius="full"
              boxShadow="card"
              _hover={{
                bg: "red.600",
                boxShadow: "cardHover"
              }}
              size="md"
              px={5}
              loading={deleteCategoryMutation.isPending || deleteZoneMutation.isPending}
              onClick={categoryToDelete ? confirmDeleteCategory : confirmDeleteZone}
            >
              Löschen
            </Button>
          </Flex>
        </Box>
      </Modal>
    </Flex>
  );
}

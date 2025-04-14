'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { PlusCircle } from 'lucide-react';
import { useGuild } from '@/context/guild-context';
import { toast } from '@/components/core/toaster';
import * as zonesService from '@/services/zones';

// Komponenten
import StatCards from './components/StatCards';
import CategoryList from './components/CategoryList';
import CategoryModal from './components/CategoryModal';
import ZoneModal from './components/ZoneModal';
import CategoryErrorBoundary from './CategoryErrorBoundary';
import { ConfirmDialog } from '@/components/confirm-dialog';

// Hooks
import { useCategories, EnhancedCategory, CategoryInput } from './hooks/useCategories';
import { useZones, ZoneInput } from './hooks/useZones';
import { useRoles } from './hooks/useRoles';
import { EnhancedZone } from './hooks/useCategories';

const CategoryManagementInternal: React.FC = () => {
  console.log(`[CategoryManagement] Rendering component`);

  // State für Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [currentCategoryForModal, setCurrentCategoryForModal] = useState<EnhancedCategory | null>(null);
  const [currentZoneForModal, setCurrentZoneForModal] = useState<EnhancedZone | null>(null);
  const [selectedCategoryIdForZoneModal, setSelectedCategoryIdForZoneModal] = useState<string | null>(null);

  // State für Lösch-Dialoge
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false); // Loading state für Kat. Löschen

  const [showDeleteZoneDialog, setShowDeleteZoneDialog] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [isDeletingZone, setIsDeletingZone] = useState(false); // Loading state für Zone Löschen
  const [loading, setLoading] = useState(false); // Allgemeiner Loading state

  // Hooks
  const { currentGuild } = useGuild();
  const guildId = currentGuild?.id || ''; // Sicherstellen, dass guildId hier verfügbar ist
  console.log(`[CategoryManagement] Komponente mit guildId: ${guildId}`);

  // Erweiterte Destrukturierung, um auch den refetch zu erhalten
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    expandedCategories,
    toggleCategoryExpand,
    saveCategory,
    deleteCategory,
    getTotalStats,
    refetch: refetchCategories
  } = useCategories();

  const { roles, loading: rolesLoading, error: rolesError } = useRoles();

  // Debug-Info ausgeben
  useEffect(() => {
    console.log(`[CategoryManagement RENDER CHECK] Categories: ${categories.map(c => c.name).join(', ')}`);
  }, [categories]);

  // Debug-Info für Rollen
  useEffect(() => {
    console.log(`[CategoryManagement] Roles state changed: ${roles.length} roles`);
  }, [roles]);

  // Statistiken
  const stats = useMemo(() => getTotalStats(), [getTotalStats]);

  // --- Modal Handler ---
  const handleOpenCategoryModal = useCallback((category: EnhancedCategory | null = null) => {
    setCurrentCategoryForModal(category);
    setShowCategoryModal(true);
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    setShowCategoryModal(false);
    setCurrentCategoryForModal(null);
  }, []);

  const handleSaveCategory = useCallback(async (categoryData: CategoryInput) => {
    const result = await saveCategory(categoryData);
    if (result) {
      handleCloseCategoryModal();
    }
    return result;
  }, [saveCategory, handleCloseCategoryModal]);

  const handleOpenZoneModal = useCallback((categoryId: string, zone: EnhancedZone | null = null) => {
    setSelectedCategoryIdForZoneModal(categoryId); // ID für ZoneModal merken
    setCurrentZoneForModal(zone);
    setShowZoneModal(true);
  }, []);

  const handleCloseZoneModal = useCallback(() => {
    setShowZoneModal(false);
    setCurrentZoneForModal(null);
    setSelectedCategoryIdForZoneModal(null);
  }, []);

   // Zonen speichern - Nach erfolgreicher Aktion die Kategorien neu laden
   const handleSaveZone = useCallback(async (zoneData: ZoneInput) => {
     if (!selectedCategoryIdForZoneModal) return false; // Stelle sicher, dass wir die Kategorie-ID haben

     setLoading(true);
     let success = false;
     try {
       let result;

       if (zoneData.id) {
         // Update
         const updatePayload = {
           name: zoneData.name,
           zoneKey: zoneData.zoneKey,
           pointsPerInterval: zoneData.pointsGranted,
           intervalMinutes: zoneData.minutesRequired
         };

         console.log("[handleSaveZone] Sende Update-Request für Zone", zoneData.id);
         result = await zonesService.updateZone(zoneData.id, updatePayload);
         console.log("[handleSaveZone] Update Success, Backend Result:", result);
         toast.success('Zone erfolgreich aktualisiert');
       } else {
         // Create
         const createPayload = {
           name: zoneData.name,
           zoneKey: zoneData.zoneKey,
           pointsPerInterval: zoneData.pointsGranted,
           intervalMinutes: zoneData.minutesRequired
         };

         console.log("[handleSaveZone] Sende Create-Request für neue Zone in Kategorie", selectedCategoryIdForZoneModal);
         result = await zonesService.createZone(selectedCategoryIdForZoneModal, createPayload);
         console.log("[handleSaveZone] Create Success, Backend Result:", result);
         toast.success('Zone erfolgreich erstellt');
       }

       // Nach erfolgreicher Änderung die Kategorien neu laden
       console.log("[handleSaveZone] Lade Kategorien neu, um Änderungen zu sehen");
       refetchCategories();

       success = true;
       handleCloseZoneModal();
     } catch (err: any) {
       console.error('Fehler beim Speichern der Zone:', err);
       toast.error(err.response?.data?.message || 'Fehler beim Speichern der Zone');
     } finally {
       setLoading(false);
     }
     return success;
   }, [selectedCategoryIdForZoneModal, handleCloseZoneModal, refetchCategories]);

  // --- Delete Dialog Handler ---
  const handleOpenDeleteCategoryDialog = useCallback((categoryId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCategoryToDelete(categoryId);
    setDeleteErrorMessage(null);
    setShowDeleteCategoryDialog(true);
  }, []);

  const handleCloseDeleteCategoryDialog = useCallback(() => {
    setShowDeleteCategoryDialog(false);
    setCategoryToDelete(null);
    setDeleteErrorMessage(null);
    setIsDeletingCategory(false);
  }, []);

  const handleConfirmDeleteCategory = useCallback(async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    const result = await deleteCategory(categoryToDelete);
    if (result.success) {
      handleCloseDeleteCategoryDialog();
    } else {
      setDeleteErrorMessage(result.message || 'Ein unbekannter Fehler ist aufgetreten.');
      setIsDeletingCategory(false); // Loading beenden bei Fehler
    }
  }, [categoryToDelete, deleteCategory, handleCloseDeleteCategoryDialog]);

  const handleOpenDeleteZoneDialog = useCallback((zoneId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoneToDelete(zoneId);
    setShowDeleteZoneDialog(true);
  }, []);

  const handleCloseDeleteZoneDialog = useCallback(() => {
    setShowDeleteZoneDialog(false);
    setZoneToDelete(null);
    setIsDeletingZone(false);
  }, []);

  // Zonen löschen - Nach erfolgreicher Löschung die Kategorien neu laden
  const handleConfirmDeleteZone = useCallback(async () => {
    if (!zoneToDelete) return;
    setIsDeletingZone(true);
    try {
        console.log("[handleConfirmDeleteZone] Sende Delete-Request für Zone", zoneToDelete);
        const result = await zonesService.deleteZone(zoneToDelete);

        if (result.success) {
          console.log("[handleConfirmDeleteZone] Delete Success, Backend Result:", result);
          toast.success('Zone erfolgreich gelöscht');

          // Kein manuelles Neuladen mehr - wir verlassen uns auf Realtime!
          console.log("[handleConfirmDeleteZone] Warte auf Realtime-Event für gelöschte Zone...");

          handleCloseDeleteZoneDialog();
        } else {
          toast.error(result.message || 'Fehler beim Löschen der Zone');
        }
    } catch(err: any) {
        console.error('Fehler beim Löschen der Zone:', err);
        toast.error(err.response?.data?.message || 'Fehler beim Löschen der Zone');
    } finally {
       setIsDeletingZone(false);
    }
  }, [zoneToDelete, handleCloseDeleteZoneDialog, refetchCategories]);

  // Debug-Button zum manuellen Neuladen der Daten
  const handleManualRefresh = useCallback(() => {
    console.log("[CategoryManagement] Manuelles Neuladen der Kategorien...");
    refetchCategories();
    toast.info("Kategorien werden neu geladen...");
  }, [refetchCategories]);

  return (
    <CategoryErrorBoundary>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Kategorien & Zonen Manager
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Debug-Button zum manuellen Neuladen */}
              <Button
                variant="outlined"
                color="info"
                onClick={handleManualRefresh}
                disabled={categoriesLoading}
              >
                Aktualisieren
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlusCircle size={18} />}
                onClick={() => handleOpenCategoryModal(null)}
                disabled={categoriesLoading || rolesLoading} // Deaktivieren während Ladevorgängen
              >
                Neue Kategorie
              </Button>
            </Box>
          </Box>

          {/* Stats */}
          <StatCards
            categoriesCount={stats.totalCategories}
            totalUsers={stats.totalUsers}
            totalTime={stats.totalTime}
          />

          {/* Error Display */}
          {categoriesError && <Typography color="error">Fehler beim Laden der Kategorien: {categoriesError}</Typography>}
          {rolesError && <Typography color="error">Fehler beim Laden der Rollen: {rolesError}</Typography>}


          {/* Category List */}
          <CategoryList
            categories={categories}
            expandedCategories={expandedCategories}
            loading={categoriesLoading} // Loading-Status übergeben
            onToggleExpand={toggleCategoryExpand}
            onEditCategory={handleOpenCategoryModal}
            onDeleteCategory={handleOpenDeleteCategoryDialog}
            onAddZone={handleOpenZoneModal}
            onEditZone={(categoryId, zoneId) => {
              // Finde die Zone anhand der ID
              const category = categories.find(c => c.id === categoryId);
              if (category) {
                const zone = category.zones.find(z => z.id === zoneId);
                if (zone) {
                  handleOpenZoneModal(categoryId, zone);
                }
              }
            }}
            onDeleteZone={handleOpenDeleteZoneDialog}
          />
        </Container>

        {/* Modals und Dialoge */}
        {showCategoryModal && (
          <CategoryModal
            open={showCategoryModal}
            onClose={handleCloseCategoryModal}
            onSave={handleSaveCategory}
            category={currentCategoryForModal}
            availableRoles={roles} // Rollen übergeben
          />
        )}

        {showZoneModal && (
          <ZoneModal
            open={showZoneModal}
            onClose={handleCloseZoneModal}
            onSave={handleSaveZone}
            zone={currentZoneForModal}
            categoryId={selectedCategoryIdForZoneModal || ''} // Sicherstellen, dass ID übergeben wird
            categoryName={categories.find(c => c.id === selectedCategoryIdForZoneModal)?.name || ''}
          />
        )}

        <ConfirmDialog
          open={showDeleteCategoryDialog}
          title="Kategorie löschen"
          content={`Möchten Sie die Kategorie "${categories.find(c => c.id === categoryToDelete)?.name || ''}" wirklich löschen? Zugehörige Zonen müssen vorher entfernt werden.`}
          confirmText="Löschen"
          cancelText="Abbrechen"
          onConfirm={handleConfirmDeleteCategory}
          onCancel={handleCloseDeleteCategoryDialog}
          isLoading={isDeletingCategory}
          errorMessage={deleteErrorMessage} // Fehlermeldung anzeigen
        />

        <ConfirmDialog
          open={showDeleteZoneDialog}
          title="Zone löschen"
          content={`Möchten Sie diese Zone wirklich löschen?`}
          confirmText="Löschen"
          cancelText="Abbrechen"
          onConfirm={handleConfirmDeleteZone}
          onCancel={handleCloseDeleteZoneDialog}
          isLoading={isDeletingZone}
        />

      </Box>
    </CategoryErrorBoundary>
  );
};

// Mit React.memo optimieren
export default React.memo(CategoryManagementInternal);
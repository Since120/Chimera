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
import { ConfirmDialog } from '@/components/confirm-dialog'; // Importieren Sie das Dialog-Komponente"></div>/components/dashboard/guild/confirm-dialog';

// Hooks
import { useCategories, EnhancedCategory, CategoryInput } from './hooks/useCategories'; // CategoryInput importieren
import { useZones, ZoneInput } from './hooks/useZones';
import { useRoles } from './hooks/useRoles';
import { EnhancedZone } from './hooks/useCategories';

const CategoryManagementInternal: React.FC = () => {
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
  const guildId = currentGuild?.id; // Sicherstellen, dass guildId hier verfügbar ist
  console.log(`[CategoryManagement] Komponente gerendert mit currentGuild:`, currentGuild);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError, // Fehler aus useCategories holen
    expandedCategories,
    toggleCategoryExpand,
    saveCategory,
    deleteCategory,
    getTotalStats,
    refetch: refetchCategories // Refetch-Funktion umbenennen
  } = useCategories(); // useCategories braucht keine Props mehr

  const { roles, loading: rolesLoading, error: rolesError } = useRoles(); // guildId wird intern geholt
  console.log(`[CategoryManagement] useRoles aufgerufen, Loading: ${rolesLoading}`);

  // Wir holen useZones hier nicht mehr global, sondern spezifisch beim Öffnen des ZoneModals
  // oder in der CategoryList, falls Zonen direkt dort angezeigt werden.

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

   // Zonen speichern - Diese Funktion benötigt den useZones Hook oder einen Service Call
   const handleSaveZone = useCallback(async (zoneData: ZoneInput) => {
     if (!selectedCategoryIdForZoneModal) return false; // Stelle sicher, dass wir die Kategorie-ID haben
     // Hier muss die Logik zum Speichern der Zone implementiert werden,
     // entweder über einen dedizierten useZones-Hook oder direkt über den zonesService
     // Beispiel (benötigt zonesService):
     setLoading(true); // Einen allgemeinen Loading-State verwenden? Oder spezifisch?
     let success = false;
     try {
       if (zoneData.id) {
         await zonesService.updateZone(zoneData.id, {
           name: zoneData.name,
           zoneKey: zoneData.zoneKey,
           pointsPerInterval: zoneData.pointsGranted,
           intervalMinutes: zoneData.minutesRequired
         });
         toast.success('Zone aktualisiert');
       } else {
         await zonesService.createZone(selectedCategoryIdForZoneModal, {
           name: zoneData.name,
           zoneKey: zoneData.zoneKey,
           pointsPerInterval: zoneData.pointsGranted,
           intervalMinutes: zoneData.minutesRequired
         });
         toast.success('Zone erstellt');
       }
       success = true;
       handleCloseZoneModal();
       // Refetch categories, da sich Zonen geändert haben könnten (Realtime sollte das aber tun)
       // refetchCategories();
     } catch (err: any) {
       console.error('Fehler beim Speichern der Zone:', err);
       toast.error(err.response?.data?.message || 'Fehler beim Speichern der Zone');
     } finally {
       setLoading(false);
     }
     return success;
   }, [selectedCategoryIdForZoneModal, handleCloseZoneModal]);

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

  // Zonen löschen - Benötigt zonesService
  const handleConfirmDeleteZone = useCallback(async () => {
    if (!zoneToDelete) return;
    setIsDeletingZone(true);
    try {
        const result = await zonesService.deleteZone(zoneToDelete);
        if (result.success) {
          toast.success('Zone gelöscht');
          handleCloseDeleteZoneDialog();
          // refetchCategories(); // Ggf. Kategorien neu laden
        } else {
          toast.error(result.message || 'Fehler beim Löschen der Zone');
        }
    } catch(err: any) {
        console.error('Fehler beim Löschen der Zone:', err);
        toast.error(err.response?.data?.message || 'Fehler beim Löschen der Zone');
    } finally {
       setIsDeletingZone(false);
    }
  }, [zoneToDelete, handleCloseDeleteZoneDialog]);

  return (
    <CategoryErrorBoundary>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Kategorien & Zonen Manager
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlusCircle size={18} />}
              onClick={() => handleOpenCategoryModal()}
              disabled={categoriesLoading || rolesLoading} // Deaktivieren während Ladevorgängen
            >
              Neue Kategorie
            </Button>
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
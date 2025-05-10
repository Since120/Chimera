// apps/frontend-new/src/components/categories/KategorieTabelle.tsx
'use client';

import { Box, Flex, Text } from "@chakra-ui/react";
import { DataTable } from "@/components/core/DataTable";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { LightMode } from "@/components/ui/color-mode";

// Interface für Discord-Rollen
export interface GuildRole {
  id: string;
  name: string;
  color: number;
  colorHex?: string;
  position: number;
}

// Definiere den Typ für eine Kategorie
export interface Kategorie {
  id: string;
  name: string;
  description?: string; // Optional
  zones: number;
  activeZones?: number; // Optional
  users: number;
  activeUsers?: number; // Optional
  visible: boolean;
  tracking: boolean;
  setup: boolean;
  roles: string;
  rolesInfo?: Array<{id: string; name: string; colorHex?: string}> | null; // Aufbereitete Rolleninformationen
  lastAccess: string;
  lastUser?: string; // Optional
  totalTime: string;
}

// Definiere die Props für die KategorieTabelle-Komponente
export interface KategorieTabelleProps {
  data: Kategorie[];
  selectedKategorieId: string | null;
  onSelectKategorie: (kategorie: Kategorie | null) => void;
  onEdit?: (kategorie: Kategorie) => void;
  onDelete?: (kategorie: Kategorie) => void;
  compactMode?: boolean; // Ob die Tabelle im kompakten Modus angezeigt werden soll
}

/**
 * KategorieTabelle-Komponente zur Anzeige von Kategorien in einer DataTable
 */
export const KategorieTabelle: React.FC<KategorieTabelleProps> = ({
  data,
  selectedKategorieId,
  onSelectKategorie,
  onEdit = (kategorie) => console.log('Bearbeiten:', kategorie.name),
  onDelete = (kategorie) => console.log('Löschen:', kategorie.name),
  compactMode = false
}) => {
  return (
    <LightMode>
      <DataTable
      columns={[
        {
          header: 'Name',
          accessor: 'name',
          label: 'Kategoriename',
          priority: 100, // Höchste Priorität
          alwaysVisible: true, // Immer sichtbar
          minWidth: 150 // Mindestbreite in Pixeln
        },
        {
          header: 'Zonen',
          accessor: 'zones',
          label: 'Anzahl Zonen',
          priority: 90, // Sehr hohe Priorität
          minWidth: 120 // Mindestbreite in Pixeln
        },
        {
          header: 'Nutzer',
          accessor: 'users',
          label: 'Anzahl Nutzer',
          priority: 80 // Hohe Priorität
        },
        {
          header: 'Sichtbar',
          accessor: 'visible',
          label: 'Sichtbarkeit',
          contentFontSize: '0.8em',
          contentFontWeight: '600',
          cell: (value) => <Text color={value ? 'status.success' : 'status.error'} fontWeight="600" fontSize="0.8em" lineHeight="1">{value ? 'Ja' : 'Nein'}</Text>,
          priority: 60 // Mittlere Priorität
        },
        {
          header: 'Tracking',
          accessor: 'tracking',
          label: 'Tracking aktiv',
          contentFontSize: '0.8em',
          contentFontWeight: '600',
          cell: (value) => <Text color={value ? 'status.success' : 'status.error'} fontWeight="600" fontSize="0.8em" lineHeight="1">{value ? 'Ja' : 'Nein'}</Text>,
          priority: 50 // Mittlere Priorität
        },
        {
          header: 'Setup',
          accessor: 'setup',
          label: 'Setup',
          contentFontSize: '0.8em',
          contentFontWeight: '600',
          cell: (value) => <Text color={value ? 'status.success' : 'status.error'} fontWeight="600" fontSize="0.8em" lineHeight="1">{value ? 'Ja' : 'Nein'}</Text>,
          priority: 40 // Mittlere Priorität
        },
        {
          header: 'Rollen',
          accessor: 'roles',
          label: 'Zugewiesene Rollen',
          priority: 30, // Niedrigere Priorität
          cell: (value: string, row: Kategorie) => {
            // Debug-Ausgaben
            console.log('Rollen cell-Funktion aufgerufen mit:', {
              value,
              rowId: row.id,
              rowName: row.name,
              rolesInfo: row.rolesInfo,
              rolesString: row.roles
            });

            // Prüfe row.rolesInfo
            if (row.rolesInfo === undefined) {
              // Wenn undefined: Zeige "Lade Rollen..."
              return <Text fontSize="0.8em" color="gray.500">Rollen werden geladen...</Text>;
            }

            // Wenn null oder leeres Array: Zeige "Keine Rollen"
            if (row.rolesInfo === null || row.rolesInfo.length === 0) {
              return <Text fontSize="0.8em" color="gray.500">Keine Rollen</Text>;
            }

            // Wenn Array vorhanden: Zeige die ersten 2 Rollennamen und ggf. "... und X weitere"
            const displayCount = 2;
            const remainingCount = row.rolesInfo.length - displayCount;

            // Erstelle die anzuzeigenden Rollennamen
            const displayRoleNames = row.rolesInfo
              .slice(0, displayCount)
              .map(role => role.name || `Rolle ${role.id}`) // Fallback, falls name fehlt
              .join(', ');

            const allRoleNames = row.rolesInfo
              .map(role => role.name || `Rolle ${role.id}`) // Fallback, falls name fehlt
              .join(', ');

            console.log('Angezeigte Rollennamen:', displayRoleNames);
            console.log('Alle Rollennamen:', allRoleNames);

            return (
              <Text
                fontSize="0.8em"
                title={allRoleNames} // Einfacher HTML-Tooltip mit allen Rollennamen
              >
                {displayRoleNames}
                {remainingCount > 0 ? ` ... und ${remainingCount} weitere` : ''}
              </Text>
            );
          }
        },
        {
          header: 'Letzter Zugriff',
          accessor: 'lastAccess',
          label: 'Letzter Zugriff',
          priority: 20 // Niedrige Priorität
        },
        {
          header: 'Gesamtzeit',
          accessor: 'totalTime',
          label: 'Gesamte Nutzungszeit',
          priority: 10 // Niedrigste Priorität
        },
        {
          header: 'Aktionen',
          accessor: 'id',
          label: 'Aktionen',
          priority: 95, // Sehr hohe Priorität
          alwaysVisible: true, // Immer sichtbar
          cell: (_, row) => (
            <Flex gap={4} justifyContent="center" alignItems="center">
              <Box
                as="button"
                onClick={(e) => {
                  e.stopPropagation(); // Verhindert, dass der Klick die Zeile auswählt
                  onEdit(row as Kategorie);
                }}
                className="data-table-icon"
                transition="color 0.2s"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiEdit size={18} style={{ display: 'block' }} />
              </Box>
              <Box
                as="button"
                onClick={(e) => {
                  e.stopPropagation(); // Verhindert, dass der Klick die Zeile auswählt
                  onDelete(row as Kategorie);
                }}
                className="data-table-icon"
                transition="color 0.2s"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiTrash2 size={18} style={{ display: 'block' }} />
              </Box>
            </Flex>
          )
        }
      ]}
      data={data}
      size="md"
      showHeader={false}
      colorMode="light" // Light Mode für die KategorieTabelle
      rowSpacing={8}
      rowBorderWidth={1}
      compactMode={compactMode} // Kompakter Modus, wenn aktiviert
      maxCompactColumns={7} // Maximal 3 Spalten im kompakten Modus
      // Keine explizite Anzahl von Spalten angeben, um die dynamische Logik zu nutzen
      // Klickbare Zeilen
      onRowClick={(row) => {
        const kategorie = row as Kategorie;
        if (selectedKategorieId === kategorie.id) {
          // Wenn die Zeile bereits ausgewählt ist, Auswahl aufheben
          onSelectKategorie(null);
        } else {
          // Sonst Zeile auswählen
          onSelectKategorie(kategorie);
        }
      }}
      // Styling für ausgewählte Zeilen
      getRowProps={(row) => {
        const kategorie = row as Kategorie;
        return {
          // Verwenden der semantischen Tokens für aktive Stile
          // Keine expliziten Farben mehr nötig, da sie über die isActive-Eigenschaft gesteuert werden
          borderWidth: kategorie.id === selectedKategorieId ? '1px' : undefined,
          cursor: 'pointer', // Zeigt an, dass die Zeile klickbar ist
          isActive: kategorie.id === selectedKategorieId // Markieren der aktiven Zeile
        };
      }}
    />
    </LightMode>
  );
};

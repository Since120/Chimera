// apps/frontend-new/src/components/categories/KategorieTabelle.tsx
'use client';

import { Box, Flex, Text } from "@chakra-ui/react";
import { DataTable } from "@/components/core/DataTable";
import { FiEdit, FiTrash2 } from "react-icons/fi";

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
    <DataTable
      columns={[
        {
          header: 'Name',
          accessor: 'name',
          label: 'Kategoriename',
          priority: 100, // Höchste Priorität
          alwaysVisible: true // Immer sichtbar
        },
        {
          header: 'Zonen',
          accessor: 'zones',
          label: 'Anzahl Zonen',
          priority: 90 // Sehr hohe Priorität
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
          cell: (value) => <Text color={value ? 'green.500' : 'red.500'} fontWeight="600" fontSize="0.8em">{value ? 'Ja' : 'Nein'}</Text>,
          priority: 60 // Mittlere Priorität
        },
        {
          header: 'Tracking',
          accessor: 'tracking',
          label: 'Tracking aktiv',
          contentFontSize: '0.8em',
          contentFontWeight: '600',
          cell: (value) => <Text color={value ? 'green.500' : 'red.500'} fontWeight="600" fontSize="0.8em">{value ? 'Ja' : 'Nein'}</Text>,
          priority: 50 // Mittlere Priorität
        },
        {
          header: 'Setup',
          accessor: 'setup',
          label: 'Setup',
          contentFontSize: '0.8em',
          contentFontWeight: '600',
          cell: (value) => <Text color={value ? 'green.500' : 'red.500'} fontWeight="600" fontSize="0.8em">{value ? 'Ja' : 'Nein'}</Text>,
          priority: 40 // Mittlere Priorität
        },
        {
          header: 'Rollen',
          accessor: 'roles',
          label: 'Zugewiesene Rollen',
          priority: 30 // Niedrigere Priorität
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
          label: '',
          priority: 95, // Sehr hohe Priorität
          alwaysVisible: true, // Immer sichtbar
          cell: (_, row) => (
            <Flex direction="column" alignItems="center">
              <Text
                fontSize="0.7em"
                fontWeight="normal"
                color="gray.400"
                mb="8px"
                textAlign="center"
              >
                Aktionen
              </Text>
              <Flex gap={4} justifyContent="center">
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
            </Flex>
          )
        }
      ]}
      data={data}
      size="md"
      showHeader={false}
      mode="light" // Verwenden des vordefinierten Light-Mode
      rowSpacing={8}
      rowBorderWidth={1}
      // Keine expliziten Farben mehr nötig, da sie im Light-Mode bereits definiert sind
      labelFontSize="0.7em"
      contentFontSize="0.9em"
      labelFontWeight="300"
      contentFontWeight="300"
      compactMode={compactMode} // Kompakter Modus, wenn aktiviert
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
          // Verwenden der vordefinierten aktiven Stile
          bg: kategorie.id === selectedKategorieId ? undefined : undefined, // Verwenden der vordefinierten aktiven Farbe
          borderColor: kategorie.id === selectedKategorieId ? undefined : undefined, // Verwenden der vordefinierten aktiven Rahmenfarbe
          borderWidth: kategorie.id === selectedKategorieId ? '1px' : undefined,
          cursor: 'pointer', // Zeigt an, dass die Zeile klickbar ist
          isActive: kategorie.id === selectedKategorieId // Markieren der aktiven Zeile
        };
      }}
    />
  );
};

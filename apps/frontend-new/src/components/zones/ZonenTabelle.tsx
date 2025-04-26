// apps/frontend-new/src/components/zones/ZonenTabelle.tsx
'use client';

import { Box, Flex } from "@chakra-ui/react";
import { DataTable } from "@/components/core/DataTable";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// Definiere den Typ für eine Zone
export interface Zone {
  id: string;
  name: string;
  key: string;
  points: number;
  minutes: number;
  lastAccess: string;
  usageTime: string;
}

// Definiere die Props für die ZonenTabelle-Komponente
export interface ZonenTabelleProps {
  data: Zone[];
  onEdit?: (zone: Zone) => void;
  onDelete?: (zone: Zone) => void;
}

/**
 * ZonenTabelle-Komponente zur Anzeige von Zonen in einer DataTable
 */
export const ZonenTabelle: React.FC<ZonenTabelleProps> = ({
  data,
  onEdit = (zone) => console.log('Bearbeiten:', zone.name),
  onDelete = (zone) => console.log('Löschen:', zone.name)
}) => {
  return (
    <DataTable
      columns={[
        {
          header: 'Name',
          accessor: 'name',
          label: 'Zonenname',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          contentFontSize: '1em',
          contentFontWeight: '300'
        },
        {
          header: 'Zonen Key',
          accessor: 'key',
          label: 'Zonen Key',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          contentFontSize: '0.9em',
          contentFontWeight: '300'
        },
        {
          header: 'Punkte',
          accessor: 'points',
          label: 'Punkte',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          contentFontSize: '0.9em',
          contentFontWeight: '500',
          contentColor: 'navActiveGreenBase'
        },
        {
          header: 'Minuten',
          accessor: 'minutes',
          label: 'Minuten',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          contentFontSize: '0.9em',
          contentFontWeight: '400'
        },
        {
          header: 'Letzter Zugriff',
          accessor: 'lastAccess',
          label: 'Letzter Zugriff',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          contentFontSize: '0.85em',
          contentFontWeight: '300'
        },
        {
          header: 'Nutzungszeit',
          accessor: 'usageTime',
          label: 'Gesamte Nutzungszeit',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          contentFontSize: '0.85em',
          contentFontWeight: '400'
        },
        {
          header: 'Aktionen',
          accessor: 'id',
          label: 'Aktionen',
          labelFontSize: '0.7em',
          labelFontWeight: '300',
          labelColor: 'gray.400',
          cell: (_, row) => (
            <Flex gap={4} justifyContent="center">
              <Box
                as="button"
                onClick={() => onEdit(row as Zone)}
                className="data-table-icon"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiEdit size={18} style={{ display: 'block' }} />
              </Box>
              <Box
                as="button"
                onClick={() => onDelete(row as Zone)}
                className="data-table-icon"
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
      mode="dark" // Verwenden des vordefinierten Dark-Mode
      rowSpacing={8}
      rowBorderWidth={1}
      // Keine expliziten Farben mehr nötig, da sie im Dark-Mode bereits definiert sind
      labelFontSize="0.7em"
      contentFontSize="0.9em"
      labelFontWeight="300"
      contentFontWeight="300"
    />
  );
};

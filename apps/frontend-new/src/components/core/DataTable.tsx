'use client';

import { Box } from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import './DataTable.css'; // Import der CSS-Datei für Hover-Effekte

export interface DataTableColumn {
  header: string;
  accessor: string;
  cell?: (value: any, row: any) => ReactNode;
  width?: string; // Optionale Breite für die Spalte (z.B. '100px', '20%')
  minWidth?: number; // Minimale Breite der Spalte in Pixeln (für responsive Berechnung)
  label?: string; // Beschreibung/Label für die Zelle, wird oben angezeigt
  labelFontSize?: string; // Individuelle Schriftgröße für das Label dieser Spalte
  labelFontWeight?: string; // Individuelles Schriftgewicht für das Label dieser Spalte
  labelColor?: string; // Individuelle Farbe für das Label dieser Spalte
  contentFontSize?: string; // Individuelle Schriftgröße für den Hauptinhalt dieser Spalte
  contentFontWeight?: string; // Individuelles Schriftgewicht für den Hauptinhalt dieser Spalte
  contentColor?: string; // Individuelle Farbe für den Hauptinhalt dieser Spalte
  priority?: number; // Priorität der Spalte (höhere Zahlen = höhere Priorität, werden länger angezeigt)
  alwaysVisible?: boolean; // Ob die Spalte immer sichtbar sein soll, unabhängig von der Priorität
}

// Wir verwenden jetzt semantische Tokens aus dem Chakra UI Theme direkt in den Komponenten

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  size?: "sm" | "md" | "lg";
  showHeader?: boolean; // Prop zum Ein-/Ausschalten des Headers
  showDividers?: boolean; // Prop zum Ein-/Ausschalten der Trennlinien zwischen den Zeilen
  colorMode?: "light" | "dark"; // Überschreibt den globalen ColorMode (optional)

  // Stile für die Tabelle (alle optional, überschreiben die Theme-Tokens)
  rowSpacing?: number; // Abstand zwischen den Zeilen in Pixeln
  rowBorderWidth?: number; // Stärke des Borders um die Zeilen in Pixeln

  onRowClick?: (row: any) => void; // Callback-Funktion, die aufgerufen wird, wenn auf eine Zeile geklickt wird
  getRowProps?: (row: any) => Record<string, any>; // Funktion, die zusätzliche Props für eine Zeile zurückgibt
  visibleColumns?: number; // Maximale Anzahl der sichtbaren Spalten (optional, basierend auf verfügbarem Platz)
  compactMode?: boolean; // Ob die Tabelle im kompakten Modus angezeigt werden soll (weniger Spalten)
  maxCompactColumns?: number; // Maximale Anzahl der sichtbaren Spalten im kompakten Modus (überschreibt die Standardberechnung)
}

export const DataTable = ({
  columns,
  data,
  size = "lg",
  showHeader = true,
  showDividers = false,
  colorMode, // Wird nur für Kompatibilität beibehalten, die Farben kommen jetzt aus dem Theme
  rowSpacing = 4, // 4px Abstand zwischen den Zeilen als Standard
  rowBorderWidth = 1, // 1px Border-Stärke als Standard
  // Neue Props für Interaktivität
  onRowClick,
  getRowProps,
  // Neue Props für responsive Spaltenanzeige
  visibleColumns,
  compactMode = false,
  maxCompactColumns = 3 // Standardwert: 3 Spalten im kompakten Modus
}: DataTableProps) => {
  // Die Farben kommen jetzt direkt aus dem Theme über die LightMode/DarkMode-Komponenten

  // Zellengröße basierend auf der size-Prop
  const cellPadding = size === 'sm' ? '8px 12px' : size === 'md' ? '10px 14px' : '12px 16px';
  const cellMinHeight = size === 'sm' ? '40px' : size === 'md' ? '50px' : '60px';

  // Feste Höhen für Label und Content
  const labelHeight = size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px';
  const contentHeight = size === 'sm' ? '20px' : size === 'md' ? '24px' : '28px';

  // Standardwerte für Spaltenbreiten, falls nicht angegeben
  const defaultMinWidth = 120; // Standardbreite für Spalten ohne minWidth

  // Ref für den Container
  const containerRef = useRef<HTMLDivElement>(null);

  // State für die verfügbare Breite
  const [availableWidth, setAvailableWidth] = useState<number>(0);

  // ResizeObserver einrichten, um die Breite des Containers zu überwachen
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        // Verfügbare Breite aktualisieren
        const newWidth = entry.contentRect.width;
        setAvailableWidth(newWidth);
        console.log('Container width changed:', newWidth);
      }
    });

    // Observer auf den Container anwenden
    resizeObserver.observe(containerRef.current);

    // Initial die Breite messen und ausgeben
    if (containerRef.current) {
      const initialWidth = containerRef.current.getBoundingClientRect().width;
      console.log('Initial container width:', initialWidth);
      setAvailableWidth(initialWidth);
    }

    // Observer beim Aufräumen entfernen
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Logik zur Auswahl der sichtbaren Spalten basierend auf Priorität und verfügbarem Platz
  const getVisibleColumns = useCallback(() => {
    // Wenn keine Einschränkung gewünscht ist und keine Breite bekannt ist, alle Spalten zurückgeben
    if (!compactMode && !visibleColumns && availableWidth === 0) {
      return columns;
    }

    // Spalten mit Prioritäten und Mindestbreiten versehen
    const columnsWithPriority = columns.map((col, index) => ({
      ...col,
      priority: col.priority !== undefined ? col.priority : columns.length - index,
      originalIndex: index,
      minWidth: col.minWidth || defaultMinWidth // Standardbreite verwenden, falls nicht angegeben
    }));

    // Spalten nach Priorität sortieren (höhere Priorität zuerst)
    const sortedColumns = [...columnsWithPriority].sort((a, b) => {
      // Immer sichtbare Spalten haben höchste Priorität
      if (a.alwaysVisible && !b.alwaysVisible) return -1;
      if (!a.alwaysVisible && b.alwaysVisible) return 1;
      // Sonst nach Priorität sortieren
      return (b.priority || 0) - (a.priority || 0);
    });

    // Anzahl der anzuzeigenden Spalten dynamisch bestimmen
    let maxVisible;

    if (visibleColumns) {
      // Wenn explizit angegeben, diesen Wert verwenden
      maxVisible = visibleColumns;
    } else if (compactMode && availableWidth > 0) {
      // Im kompakten Modus: Berechne, wie viele Spalten basierend auf der verfügbaren Breite angezeigt werden können
      console.log('Calculating visible columns for width:', availableWidth);

      // Berechne die Gesamtbreite der Spalten
      let totalWidth = 0;
      let visibleCount = 0;

      // Zuerst die immer sichtbaren Spalten berücksichtigen
      const alwaysVisibleColumns = sortedColumns.filter(col => col.alwaysVisible);
      console.log('Always visible columns:', alwaysVisibleColumns.length);

      for (const col of alwaysVisibleColumns) {
        totalWidth += col.minWidth;
        visibleCount++;
        console.log(`Added always visible column: ${col.accessor}, width: ${col.minWidth}, total: ${totalWidth}`);
      }

      // Dann die restlichen Spalten nach Priorität hinzufügen, solange Platz ist
      const remainingColumns = sortedColumns.filter(col => !col.alwaysVisible);
      console.log('Remaining columns:', remainingColumns.length);

      for (const col of remainingColumns) {
        if (totalWidth + col.minWidth <= availableWidth - 40) { // 40px Puffer für Padding etc.
          totalWidth += col.minWidth;
          visibleCount++;
          console.log(`Added column: ${col.accessor}, width: ${col.minWidth}, total: ${totalWidth}`);
        } else {
          console.log(`Not enough space for column: ${col.accessor}, width: ${col.minWidth}, would be: ${totalWidth + col.minWidth}`);
          break; // Kein Platz mehr für weitere Spalten
        }
      }

      // Mindestens eine Spalte anzeigen, auch wenn nicht genug Platz ist
      maxVisible = Math.max(visibleCount, 1);
      console.log('Calculated visible columns:', maxVisible);

      // Wenn maxCompactColumns gesetzt ist, begrenzen wir die Anzahl der Spalten
      if (maxCompactColumns) {
        const oldMaxVisible = maxVisible;
        maxVisible = Math.min(maxVisible, maxCompactColumns);
        if (oldMaxVisible !== maxVisible) {
          console.log(`Limited by maxCompactColumns from ${oldMaxVisible} to ${maxVisible}`);
        }
      }
    } else if (compactMode) {
      // Im kompakten Modus ohne bekannte Breite: Verwende die maxCompactColumns-Prop
      maxVisible = maxCompactColumns;
    } else {
      // Im normalen Modus: Alle Spalten anzeigen
      maxVisible = columns.length;
    }

    // Spalten auswählen und in ursprünglicher Reihenfolge zurückgeben
    const selectedColumns = sortedColumns.slice(0, maxVisible);
    return selectedColumns
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map(col => {
        // originalIndex und minWidth-Eigenschaft entfernen
        const { originalIndex, minWidth, ...colWithoutIndex } = col;
        return colWithoutIndex;
      });
  }, [columns, compactMode, visibleColumns, availableWidth, maxCompactColumns]);

  // Sichtbare Spalten basierend auf Priorität und verfügbarem Platz
  // Verwende useEffect, um die Spalten neu zu berechnen, wenn sich die Breite ändert
  const [visibleColumnsArray, setVisibleColumnsArray] = useState(getVisibleColumns());

  useEffect(() => {
    console.log('Width changed, recalculating columns:', availableWidth);
    setVisibleColumnsArray(getVisibleColumns());
  }, [availableWidth, getVisibleColumns]);

  // Debug-Ausgabe für die Komponente
  console.log('DataTable rendering, compactMode:', compactMode, 'availableWidth:', availableWidth);

  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      flexDirection="column"
      p="2px"
    >
      <Box
        ref={containerRef}
        flex="1"
        overflow="auto"
        overflowX="auto"
        p="2px"
        className="custom-scrollbar"
        onResize={() => console.log('Box resized (event)')}
      >
        <table style={{ width: 'calc(100% - 8px)', borderCollapse: 'separate', borderSpacing: `0 ${rowSpacing}px`, tableLayout: 'auto', margin: '0 4px' }}>
          {showHeader && (
            <thead>
              <tr>
                {visibleColumnsArray.map((column, index) => (
                  <th
                    key={index}
                    style={{
                      padding: '0 16px',
                      textAlign: 'left',
                      fontWeight: 'bold',
                      height: '40px',
                      borderBottom: showDividers ? '1px solid #e2e8f0' : 'none',
                      width: column.width || 'auto'
                    }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody style={{ padding: '4px' }}>
            {data.map((row, rowIndex) => {
              // Hole zusätzliche Props für die Zeile, wenn getRowProps definiert ist
              const rowProps = getRowProps ? getRowProps(row) : {};

              // Prüfen, ob die Zeile aktiv ist
              const isActive = rowProps.isActive || false;

              return (
                <Box
                  as="tr"
                  key={rowIndex}
                  className="data-table-row"
                  position="relative"
                  bg={isActive ? "table.rowActiveColor" : (rowProps.bg || "table.rowBg")}
                  color={isActive ? "table.rowActiveTextColor" : "table.rowTextColor"}
                  borderRadius="9999px"
                  boxShadow={rowProps.borderWidth || isActive ?
                    `0 0 0 ${rowProps.borderWidth || '1px'} ${isActive ? "table.rowActiveBorderColor" : (rowProps.borderColor || "table.rowBorderColor")}` :
                    `0 0 0 ${rowBorderWidth}px ${"table.rowBorderColor"}`}
                  transition="all 0.2s ease"
                  display="table-row"
                  cursor={rowProps.cursor || (onRowClick ? 'pointer' : 'default')}
                  _hover={{
                    bg: "table.rowHoverBg",
                    color: "table.rowHoverTextColor"
                  }}
                  {...rowProps.style}
                  data-active={isActive ? "true" : "false"}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {visibleColumnsArray.map((column, colIndex) => {
                    const isFirstCell = colIndex === 0;
                    const isLastCell = colIndex === visibleColumnsArray.length - 1;

                    return (
                      <td
                        key={colIndex}
                        style={{
                          padding: cellPadding,
                          paddingLeft: isFirstCell ? '20px' : (cellPadding.split(' ')[1] || '16px'),
                          paddingRight: isLastCell ? '20px' : (cellPadding.split(' ')[1] || '16px'),
                          minHeight: cellMinHeight,
                          verticalAlign: 'middle',
                          borderRadius: isFirstCell ? '9999px 0 0 9999px' : isLastCell ? '0 9999px 9999px 0' : '0',
                          border: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                          {/* Beschreibung/Label oben - feste Höhe */}
                          <Box height={labelHeight} display="flex" alignItems="center" mb="4px">
                            {column.label && (
                              <Box
                                className="label-text"
                                fontSize={column.labelFontSize || 'xs'}
                                fontWeight={column.labelFontWeight || 'normal'}
                                color={column.labelColor || "table.labelColor"}
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                lineHeight="1"
                              >
                                {column.label}
                              </Box>
                            )}
                          </Box>

                          {/* Hauptinhalt der Zelle - feste Höhe */}
                          <Box
                            height={contentHeight}
                            display="flex"
                            alignItems="center"
                          >
                            <Box
                              className="content-text"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              fontWeight={column.contentFontWeight || '300'}
                              fontSize={column.contentFontSize || 'md'}
                              color={column.contentColor || "table.contentColor"}
                              lineHeight="1"
                            >
                              {column.cell ? column.cell(row[column.accessor], row) : row[column.accessor]}
                            </Box>
                          </Box>
                        </Box>
                      </td>
                    );
                  })}
                </Box>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

'use client';

import { Box } from "@chakra-ui/react";
import { ReactNode, useRef } from "react";
import './DataTable.css';

export interface DataTableColumn {
  header: string;
  accessor: string;
  cell?: (value: any, row: any) => ReactNode;
  width?: string; // Optionale Breite für die Spalte (z.B. '100px', '20%')
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

// Vordefinierte Stile für hellen und dunklen Modus
const modeStyles = {
  light: {
    // Normale Zeilen
    rowBgColor: "#FDFDFD",      // Hintergrundfarbe
    rowBorderColor: "#EFEFEF",  // Rahmenfarbe
    iconColor: "#555555",       // Farbe für Icons

    // Hover-Zustand
    rowHoverBgColor: "#151A26", // Hintergrundfarbe beim Hover
    rowHoverTextColor: "#FFFFFF", // Textfarbe beim Hover
    labelHoverColor: "#FFFFFF", // Label-Textfarbe beim Hover
    iconHoverColor: "#90FF00", // Icon-Farbe beim Hover über das Icon (Chakra UI blue.500)
    rowHoverIconColor: "#FFFFFF", // Icon-Farbe beim Hover über die Zeile

    // Aktiver/Ausgewählter Zustand
    rowActiveColor: "#151A26",     // Hintergrundfarbe für aktive Zeilen
    rowActiveBorderColor: "#90FF00", // Rahmenfarbe für aktive Zeilen
    rowActiveTextColor: "#FFFFFF",   // Textfarbe für aktive Zeilen

    // Text-Stile
    labelColor: "#000000",       // Farbe für Labels
    contentColor: "#000000",     // Farbe für Hauptinhalt
    labelFontSize: "0.7em",      // Schriftgröße für Labels
    contentFontSize: "1em",      // Schriftgröße für Hauptinhalt
    labelFontWeight: "normal",   // Schriftgewicht für Labels
    contentFontWeight: "300",    // Schriftgewicht für Hauptinhalt
  },

  dark: {
    // Normale Zeilen
    rowBgColor: "#262B37",      // Hintergrundfarbe
    rowBorderColor: "#262B37",  // Rahmenfarbe (gleiche Farbe wie Hintergrund)
    iconColor: "#AAAAAA",       // Farbe für Icons

    // Hover-Zustand
    rowHoverBgColor: "#373C43", // Hintergrundfarbe beim Hover
    rowHoverTextColor: "#FFFFFF", // Textfarbe beim Hover
    labelHoverColor: "#FFFFFF", // Label-Textfarbe beim Hover
    iconHoverColor: "#90FF00", // Icon-Farbe beim Hover über das Icon (Chakra UI blue.300)
    rowHoverIconColor: "#FFFFFF", // Icon-Farbe beim Hover über die Zeile

    // Aktiver/Ausgewählter Zustand
    rowActiveColor: "#2A3349",     // Hintergrundfarbe für aktive Zeilen
    rowActiveBorderColor: "#90FF00", // Rahmenfarbe für aktive Zeilen
    rowActiveTextColor: "#FFFFFF",   // Textfarbe für aktive Zeilen

    // Text-Stile
    labelColor: "#FFFFFF",       // Farbe für Labels
    contentColor: "#FFFFFF",     // Farbe für Hauptinhalt
    labelFontSize: "0.7em",      // Schriftgröße für Labels
    contentFontSize: "1em",      // Schriftgröße für Hauptinhalt
    labelFontWeight: "normal",   // Schriftgewicht für Labels
    contentFontWeight: "300",    // Schriftgewicht für Hauptinhalt
  }
};

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  size?: "sm" | "md" | "lg";
  mode?: "light" | "dark"; // Neuer Prop für den Modus (hell/dunkel)
  showHeader?: boolean; // Prop zum Ein-/Ausschalten des Headers
  showDividers?: boolean; // Prop zum Ein-/Ausschalten der Trennlinien zwischen den Zeilen
  rowBgColor?: string; // Hintergrundfarbe für die Zeilen (optional, überschreibt den Modus)
  rowHoverBgColor?: string; // Hintergrundfarbe für die Zeilen beim Hover (optional, überschreibt den Modus)
  rowHoverTextColor?: string; // Textfarbe für die Zeilen beim Hover (optional, überschreibt den Modus)
  labelHoverColor?: string; // Textfarbe für die Labels beim Hover (optional, überschreibt den Modus)
  rowActiveColor?: string; // Hintergrundfarbe für aktive/ausgewählte Zeilen (optional, überschreibt den Modus)
  rowActiveBorderColor?: string; // Rahmenfarbe für aktive/ausgewählte Zeilen (optional, überschreibt den Modus)
  rowActiveTextColor?: string; // Textfarbe für aktive/ausgewählte Zeilen (optional, überschreibt den Modus)
  iconColor?: string; // Farbe für Icons (optional, überschreibt den Modus)
  iconHoverColor?: string; // Farbe für Icons beim Hover über das Icon (optional, überschreibt den Modus)
  rowHoverIconColor?: string; // Farbe für Icons beim Hover über die Zeile (optional, überschreibt den Modus)
  rowSpacing?: number; // Abstand zwischen den Zeilen in Pixeln
  rowBorderWidth?: number; // Stärke des Borders um die Zeilen in Pixeln
  rowBorderColor?: string; // Farbe des Borders um die Zeilen (optional, überschreibt den Modus)
  labelFontSize?: string; // Schriftgröße für die Labels (optional, überschreibt den Modus)
  labelFontWeight?: string; // Schriftgewicht für die Labels (optional, überschreibt den Modus)
  labelColor?: string; // Farbe für die Labels (optional, überschreibt den Modus)
  contentFontSize?: string; // Schriftgröße für den Hauptinhalt (optional, überschreibt den Modus)
  contentFontWeight?: string; // Schriftgewicht für den Hauptinhalt (optional, überschreibt den Modus)
  contentColor?: string; // Farbe für den Hauptinhalt (optional, überschreibt den Modus)
  onRowClick?: (row: any) => void; // Callback-Funktion, die aufgerufen wird, wenn auf eine Zeile geklickt wird
  getRowProps?: (row: any) => Record<string, any>; // Funktion, die zusätzliche Props für eine Zeile zurückgibt
  visibleColumns?: number; // Maximale Anzahl der sichtbaren Spalten (optional, basierend auf verfügbarem Platz)
  compactMode?: boolean; // Ob die Tabelle im kompakten Modus angezeigt werden soll (weniger Spalten)
}

export const DataTable = ({
  columns,
  data,
  size = "lg",
  mode = "light", // Standardmäßig heller Modus
  showHeader = true,
  showDividers = false,
  rowSpacing = 4, // 4px Abstand zwischen den Zeilen als Standard
  rowBorderWidth = 1, // 1px Border-Stärke als Standard
  // Optionale Überschreibungen der Moduseinstellungen
  rowBgColor,
  rowHoverBgColor,
  rowHoverTextColor,
  labelHoverColor,
  rowActiveColor,
  rowActiveBorderColor,
  rowActiveTextColor,
  iconColor,
  iconHoverColor,
  rowHoverIconColor,
  rowBorderColor,
  labelFontSize,
  labelFontWeight,
  labelColor,
  contentFontSize,
  contentFontWeight,
  contentColor,
  // Neue Props für Interaktivität
  onRowClick,
  getRowProps,
  // Neue Props für responsive Spaltenanzeige
  visibleColumns,
  compactMode = false
}: DataTableProps) => {
  // Verwende die Moduseinstellungen oder die übergebenen Props
  const styles = modeStyles[mode] || modeStyles.light;

  // Effektive Stile (Props haben Vorrang vor Moduseinstellungen)
  const effectiveRowBgColor = rowBgColor || styles.rowBgColor;
  const effectiveRowHoverBgColor = rowHoverBgColor || styles.rowHoverBgColor;
  const effectiveRowHoverTextColor = rowHoverTextColor || styles.rowHoverTextColor;
  const effectiveLabelHoverColor = labelHoverColor || styles.labelHoverColor;
  const effectiveRowActiveColor = rowActiveColor || styles.rowActiveColor;
  const effectiveRowActiveBorderColor = rowActiveBorderColor || styles.rowActiveBorderColor;
  const effectiveRowActiveTextColor = rowActiveTextColor || styles.rowActiveTextColor;
  const effectiveIconColor = iconColor || styles.iconColor;
  const effectiveIconHoverColor = iconHoverColor || styles.iconHoverColor;
  const effectiveRowHoverIconColor = rowHoverIconColor || styles.rowHoverIconColor;
  const effectiveRowBorderColor = rowBorderColor || styles.rowBorderColor;
  const effectiveLabelFontSize = labelFontSize || styles.labelFontSize;
  const effectiveLabelFontWeight = labelFontWeight || styles.labelFontWeight;
  const effectiveLabelColor = labelColor || styles.labelColor;
  const effectiveContentFontSize = contentFontSize || styles.contentFontSize;
  const effectiveContentFontWeight = contentFontWeight || styles.contentFontWeight;
  const effectiveContentColor = contentColor || styles.contentColor;
  // Zellengröße basierend auf der size-Prop
  const cellPadding = size === 'sm' ? '8px 12px' : size === 'md' ? '10px 14px' : '12px 16px';
  const cellMinHeight = size === 'sm' ? '40px' : size === 'md' ? '50px' : '60px';

  // Logik zur Auswahl der sichtbaren Spalten basierend auf Priorität
  const getVisibleColumns = () => {
    // Wenn keine Einschränkung gewünscht ist, alle Spalten zurückgeben
    if (!compactMode && !visibleColumns) {
      return columns;
    }

    // Spalten mit Prioritäten versehen (falls nicht vorhanden)
    const columnsWithPriority = columns.map((col, index) => ({
      ...col,
      priority: col.priority !== undefined ? col.priority : columns.length - index,
      originalIndex: index
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
    } else if (compactMode) {
      // Im kompakten Modus: Dynamisch basierend auf der Anzahl der Spalten
      // Mindestens 4 Spalten, maximal die Hälfte der verfügbaren Spalten
      const minColumns = 4;
      const maxColumns = Math.ceil(columns.length * 0.7); // 70% der Spalten als Maximum
      maxVisible = Math.max(minColumns, maxColumns);
    } else {
      // Im normalen Modus: Alle Spalten anzeigen
      maxVisible = columns.length;
    }

    // Spalten auswählen und in ursprünglicher Reihenfolge zurückgeben
    const selectedColumns = sortedColumns.slice(0, maxVisible);
    return selectedColumns
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map(col => {
        // originalIndex-Eigenschaft entfernen
        const { originalIndex, ...colWithoutIndex } = col;
        return colWithoutIndex;
      });
  };

  // Sichtbare Spalten basierend auf Priorität und verfügbarem Platz
  const visibleColumnsArray = getVisibleColumns();

  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      flexDirection="column"
      p="2px"
      style={{
        // CSS-Variablen für Hover- und Active-Zustände
        '--row-hover-bg-color': effectiveRowHoverBgColor,
        '--row-hover-text-color': effectiveRowHoverTextColor,
        '--label-hover-color': effectiveLabelHoverColor,
        '--row-active-color': effectiveRowActiveColor,
        '--row-active-text-color': effectiveRowActiveTextColor,
        '--icon-color': effectiveIconColor,
        '--icon-hover-color': effectiveIconHoverColor,
        '--row-hover-icon-color': effectiveRowHoverIconColor,
      } as React.CSSProperties}
    >
      <Box flex="1" overflow="auto" overflowX="auto" p="2px" className="custom-scrollbar">
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
                <tr
                  key={rowIndex}
                  className="data-table-row"
                  style={{
                    position: 'relative',
                    backgroundColor: isActive ? effectiveRowActiveColor : (rowProps.bg || effectiveRowBgColor),
                    borderRadius: '9999px',
                    boxShadow: rowProps.borderWidth || isActive ?
                      `0 0 0 ${rowProps.borderWidth || '1px'} ${isActive ? effectiveRowActiveBorderColor : (rowProps.borderColor || effectiveRowBorderColor)}` :
                      `0 0 0 ${rowBorderWidth}px ${effectiveRowBorderColor}`,
                    transition: 'all 0.2s ease',
                    display: 'table-row',
                    cursor: rowProps.cursor || (onRowClick ? 'pointer' : 'default'),
                    color: isActive ? effectiveRowActiveTextColor : undefined,
                    ...rowProps.style
                  }}
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
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          {/* Beschreibung/Label oben */}
                          {column.label && (
                            <div
                              className="label-text"
                              style={{
                                fontSize: column.labelFontSize || effectiveLabelFontSize,
                                fontWeight: column.labelFontWeight || effectiveLabelFontWeight,
                                color: isActive ? effectiveRowActiveTextColor : (column.labelColor || effectiveLabelColor),
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: '4px'
                              }}
                            >
                              {column.label}
                            </div>
                          )}

                          {/* Hauptinhalt der Zelle */}
                          <div
                            className="content-text"
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontWeight: column.contentFontWeight || effectiveContentFontWeight,
                              fontSize: column.contentFontSize || effectiveContentFontSize,
                              color: isActive ? effectiveRowActiveTextColor : (column.contentColor || effectiveContentColor)
                            }}
                          >
                            {column.cell ? column.cell(row[column.accessor], row) : row[column.accessor]}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

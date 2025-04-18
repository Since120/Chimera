"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Hook zur dynamischen Bestimmung, ob Aktions-Icons zusammengefasst werden sollen
 * basierend auf dem verfügbaren Platz zwischen der Navigationsleiste und den rechten Elementen
 *
 * @param navWidth - Breite der Navigationsleiste
 * @param containerWidth - Gesamtbreite des Containers
 * @param rightElementsWidth - Breite der rechten Elemente
 * @param collapseThreshold - Schwellenwert für das Zusammenfassen (Standard: 250px)
 * @param expandThreshold - Schwellenwert für das Erweitern (Standard: 350px)
 * @param bufferSpace - Zusätzlicher Abstand als Puffer (Standard: 100px)
 * @returns Boolean, der angibt, ob die Icons zusammengefasst werden sollen
 */
export function useActionIconsCollapse(
  navWidth: number,
  containerWidth: number,
  rightElementsWidth: number,
  collapseThreshold: number = 250,
  expandThreshold: number = 350,
  bufferSpace: number = 100
): boolean {
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const prevAvailableSpaceRef = useRef<number | null>(null);

  // Verhindern von zu häufigen Aktualisierungen
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Wenn eine der Breiten 0 ist, sind die Messungen noch nicht abgeschlossen
    if (navWidth === 0 || containerWidth === 0 || rightElementsWidth === 0) {
      return;
    }

    // Aufräumen des vorherigen Timeouts, um Mehrfachaktualisierungen zu vermeiden
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Verzögerte Aktualisierung, um Flackern zu reduzieren
    updateTimeoutRef.current = setTimeout(() => {
      // Berechne den verfügbaren Platz für die Aktions-Icons
      // Containerbreite - (Navigationsbreite + Rechte Elemente + Puffer)
      const availableSpace = containerWidth - (navWidth + rightElementsWidth + bufferSpace);

      // Hysterese: Unterschiedliche Schwellenwerte für Zusammenfassen und Erweitern
      // Wenn bereits zusammengefasst, brauchen wir mehr Platz zum Erweitern
      // Wenn noch nicht zusammengefasst, brauchen wir weniger Platz zum Zusammenfassen
      if (shouldCollapse && availableSpace > expandThreshold) {
        // Genug Platz zum Erweitern
        setShouldCollapse(false);
        console.log(`Expanding: ${availableSpace}px > ${expandThreshold}px`);
      } else if (!shouldCollapse && availableSpace < collapseThreshold) {
        // Nicht genug Platz, zusammenfassen
        setShouldCollapse(true);
        console.log(`Collapsing: ${availableSpace}px < ${collapseThreshold}px`);
      }

      // Aktuellen Wert für spätere Vergleiche speichern
      prevAvailableSpaceRef.current = availableSpace;
    }, 100); // 100ms Verzögerung, um Flackern zu reduzieren

    // Cleanup beim Unmount oder bei Änderungen
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [navWidth, containerWidth, rightElementsWidth, collapseThreshold, expandThreshold, bufferSpace, shouldCollapse]);

  return shouldCollapse;
}

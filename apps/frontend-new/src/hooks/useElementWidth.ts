"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook zum Messen der Breite eines Elements und Überwachen von Größenänderungen
 * @returns Ein Objekt mit einer ref für das zu messende Element und der gemessenen Breite
 */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  // Starte mit 0 und aktualisiere erst nach dem ersten Render auf dem Client
  const [width, setWidth] = useState<number>(0);
  const prevWidthRef = useRef<number>(0);

  // Verhindern von zu häufigen Aktualisierungen
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verwende einen separaten State, um zu verfolgen, ob wir auf dem Client sind
  const [isMounted, setIsMounted] = useState(false);

  // Setze isMounted auf true nach dem ersten Render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Nur fortfahren, wenn wir auf dem Client sind und das Element existiert
    if (!isMounted || !ref.current) return;

    // Initiale Breitenmessung
    const initialWidth = ref.current.offsetWidth;
    if (initialWidth !== 0 && initialWidth !== prevWidthRef.current) {
      setWidth(initialWidth);
      prevWidthRef.current = initialWidth;
    }

    // ResizeObserver für kontinuierliche Überwachung
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === ref.current) {
          // Aufräumen des vorherigen Timeouts, um Mehrfachaktualisierungen zu vermeiden
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }

          // Verzögerte Aktualisierung, um Flackern zu reduzieren
          updateTimeoutRef.current = setTimeout(() => {
            const newWidth = entry.contentRect.width;
            // Nur aktualisieren, wenn sich die Breite signifikant geändert hat (mindestens 5px)
            // und nicht 0 ist (was auf ein nicht vollständig gerenderten Element hindeuten könnte)
            if (newWidth !== 0 && Math.abs(newWidth - prevWidthRef.current) >= 5) {
              setWidth(newWidth);
              prevWidthRef.current = newWidth;
            }
          }, 50); // 50ms Verzögerung, um Flackern zu reduzieren
        }
      }
    });

    observer.observe(ref.current);

    // Cleanup beim Unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [isMounted]); // Abhängigkeit von isMounted, um sicherzustellen, dass wir auf dem Client sind

  return { ref, width };
}

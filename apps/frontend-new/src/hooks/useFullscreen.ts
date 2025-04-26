// apps/frontend-new/src/hooks/useFullscreen.ts
import { useState, useEffect, useCallback } from 'react';

interface UseFullscreenOptions {
  /**
   * Standardwert für den Vollbildmodus
   */
  defaultIsFullscreen?: boolean;
  
  /**
   * Callback, der aufgerufen wird, wenn der Vollbildmodus geändert wird
   */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  
  /**
   * ID des Container-Elements, das im Vollbildmodus verwendet wird
   */
  containerId?: string;
  
  /**
   * Ob die Escape-Taste den Vollbildmodus beenden soll
   */
  exitOnEscape?: boolean;
}

interface FullscreenStyle {
  top: number;
  left: number;
  width: string;
  height: string;
}

/**
 * Hook für die Verwaltung des Vollbildmodus
 */
export function useFullscreen({
  defaultIsFullscreen = false,
  onFullscreenChange,
  containerId = 'dashboard-container',
  exitOnEscape = true
}: UseFullscreenOptions = {}) {
  // Interner State für den Vollbildmodus
  const [isFullscreen, setIsFullscreen] = useState(defaultIsFullscreen);
  
  // State für die Position und Größe im Vollbildmodus
  const [fullscreenStyle, setFullscreenStyle] = useState<FullscreenStyle>({
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  });
  
  // Funktion zum Umschalten des Vollbildmodus
  const toggleFullscreen = useCallback(() => {
    const newIsFullscreen = !isFullscreen;
    setIsFullscreen(newIsFullscreen);
    
    // Rufe den Callback auf, wenn vorhanden
    if (onFullscreenChange) {
      onFullscreenChange(newIsFullscreen);
    }
  }, [isFullscreen, onFullscreenChange]);
  
  // Funktion zum Beenden des Vollbildmodus
  const exitFullscreen = useCallback(() => {
    if (isFullscreen) {
      setIsFullscreen(false);
      
      // Rufe den Callback auf, wenn vorhanden
      if (onFullscreenChange) {
        onFullscreenChange(false);
      }
    }
  }, [isFullscreen, onFullscreenChange]);
  
  // Berechne die Position und Größe im Vollbildmodus
  useEffect(() => {
    if (isFullscreen && containerId) {
      // Finde den Container
      const container = document.getElementById(containerId);
      
      if (container) {
        // Berechne die Position und Größe relativ zum Container
        const containerRect = container.getBoundingClientRect();
        
        setFullscreenStyle({
          top: 0,
          left: 0,
          width: `${containerRect.width}px`,
          height: `${containerRect.height}px`
        });
      }
    }
  }, [isFullscreen, containerId]);
  
  // Überwache die Escape-Taste, um den Vollbildmodus zu beenden
  useEffect(() => {
    if (!exitOnEscape) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    
    // Füge den Event-Listener hinzu, wenn im Vollbildmodus
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    // Entferne den Event-Listener beim Aufräumen
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, exitFullscreen, exitOnEscape]);
  
  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
    fullscreenStyle
  };
}

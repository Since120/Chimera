// apps/frontend-new/src/components/core/ContentBox.tsx
import { Box, BoxProps, Flex } from '@chakra-ui/react';
import { forwardRef, useState, useEffect, useRef } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';

// Definiere die möglichen Größen
export type ContentBoxSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// Mapping von Größen zu Flex-Anteilen
const sizeToFlexRatio: Record<ContentBoxSize, string> = {
  'xs': '1',
  'sm': '2',
  'md': '3',
  'lg': '4',
  'xl': '5',
  '2xl': '6',
  'full': '7',
};

export interface ContentBoxProps extends Omit<BoxProps, 'size'> {
  /**
   * Die Größe der Box, basierend auf Chakra UI-Größen
   * xs: 1/7, sm: 2/7, md: 3/7, lg: 4/7, xl: 5/7, 2xl: 6/7, full: 7/7
   */
  size?: ContentBoxSize;

  /**
   * Ob die Box einen dunklen Hintergrund haben soll (Standard: true)
   */
  darkBg?: boolean;

  /**
   * Ob die Box in den Vollbildmodus wechseln kann (Standard: false)
   */
  canFullscreen?: boolean;

  /**
   * Ob die Box im Vollbildmodus ist (kontrollierter Modus)
   */
  isFullscreen?: boolean;

  /**
   * Standardwert für isFullscreen (unkontrollierter Modus)
   */
  defaultIsFullscreen?: boolean;

  /**
   * Callback, wenn der Vollbildmodus geändert wird
   */
  onFullscreenChange?: (isFullscreen: boolean) => void;

  /**
   * Titel der Box (wird angezeigt, wenn canFullscreen true ist)
   */
  title?: string;
}

/**
 * Eine allgemeine Box-Komponente für Inhalte mit konsistentem Styling.
 * Kann in verschiedenen Größen verwendet werden und unterstützt helle oder dunkle Hintergründe.
 */
export const ContentBox = forwardRef<HTMLDivElement, ContentBoxProps>(
  (
    {
      children,
      size = 'md',
      darkBg = true,
      borderRadius = '24px',
      p = 5,
      // Vollbildmodus-Props
      canFullscreen = false,
      isFullscreen: isFullscreenProp,
      defaultIsFullscreen = false,
      onFullscreenChange,
      title,
      ...rest
    },
    ref
  ) => {
    // Erstelle eine Referenz auf die Box
    const boxRef = useRef<HTMLDivElement | null>(null);

    // Berechne den Flex-Anteil basierend auf der Größe
    const flexValue = sizeToFlexRatio[size];

    // State für die Bildschirmbreite
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    // Aktualisiere die Bildschirmbreite bei Änderungen
    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      // Initialer Aufruf
      handleResize();

      // Event-Listener hinzufügen
      window.addEventListener('resize', handleResize);

      // Event-Listener entfernen
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    // Verwende den useFullscreen-Hook
    const {
      isFullscreen,
      toggleFullscreen
    } = useFullscreen({
      defaultIsFullscreen,
      onFullscreenChange: isFullscreenProp !== undefined ? onFullscreenChange : undefined,
      containerId: 'dashboard-container'
    });

    // Verwende den übergebenen isFullscreen-Wert, wenn im kontrollierten Modus
    const effectiveIsFullscreen = isFullscreenProp !== undefined ? isFullscreenProp : isFullscreen;

    // Berechne die Position und Größe im Vollbildmodus
    useEffect(() => {
      if (effectiveIsFullscreen) {
        // Finde den Container
        const container = document.getElementById('dashboard-container');

        if (container) {
          // Berechne die Position und Größe relativ zum Container
          const containerRect = container.getBoundingClientRect();

          // Setze die Position und Größe
          if (boxRef.current) {
            boxRef.current.style.position = 'absolute';
            boxRef.current.style.top = '0';
            boxRef.current.style.left = '0';
            boxRef.current.style.width = `${containerRect.width}px`;
            boxRef.current.style.height = `${containerRect.height}px`;
            boxRef.current.style.zIndex = '100';

            console.log('ContentBox im Vollbildmodus:', {
              width: containerRect.width,
              height: containerRect.height,
              element: boxRef.current
            });
          }
        }
      } else {
        // Setze die Position und Größe zurück
        if (boxRef.current) {
          boxRef.current.style.position = 'relative';
          boxRef.current.style.top = 'auto';
          boxRef.current.style.left = 'auto';
          boxRef.current.style.width = 'auto';
          boxRef.current.style.height = 'auto';
          boxRef.current.style.zIndex = '1';

          console.log('ContentBox im Normalmodus:', {
            element: boxRef.current
          });
        }
      }
    }, [effectiveIsFullscreen]);

    // Generiere eine eindeutige ID für ARIA-Attribute
    const boxId = `content-box-${title?.toLowerCase().replace(/\s+/g, '-') || 'unnamed'}`;
    const bodyId = `${boxId}-body`;

    return (
      <Box
        ref={(el: HTMLDivElement | null) => {
          // Beide Referenzen setzen
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              ref.current = el;
            }
          }
          boxRef.current = el;
        }}
        id={boxId}
        flex={effectiveIsFullscreen ? '1 1 100%' : { base: '1 1 100%', lg: flexValue }} // Auf Tablets: Volle Breite, auf Desktop: Proportionale Breite
        bg={darkBg ? 'card.backgroundDark' : 'card.backgroundLight'}
        _dark={{ bg: darkBg ? 'card.backgroundDark' : 'card.backgroundLight' }}
        color={darkBg ? 'white' : 'inherit'}
        borderRadius={borderRadius}
        p={p} // Konsistentes Padding beibehalten
        boxShadow="card"
        transition="all 0.3s ease"
        _hover={{ boxShadow: "cardHover" }}
        position={effectiveIsFullscreen ? 'absolute' : 'relative'}
        top={effectiveIsFullscreen ? 0 : undefined}
        left={effectiveIsFullscreen ? 0 : undefined}
        right={effectiveIsFullscreen ? 0 : undefined}
        bottom={effectiveIsFullscreen ? 0 : undefined}
        height={effectiveIsFullscreen ? "100%" : undefined}
        width={effectiveIsFullscreen ? "100%" : undefined}
        zIndex={effectiveIsFullscreen ? 100 : 1} // Höherer z-index, um über der NotchedBox zu liegen
        overflow="hidden"
        {...rest}
      >
        {/* Header mit Titel und Vollbildmodus-Button */}
        {(canFullscreen || title) && (
          <Flex
            position="absolute"
            top={3}
            left={3}
            right={3}
            alignItems="center"
            justifyContent="space-between" // Verteilt Elemente: Titel links, Button rechts
            zIndex={2}
          >
            {title && (
              <Box
                fontSize={windowWidth < 550 ? "md" : "lg"} // Kleinere Schriftgröße auf sehr kleinen Bildschirmen
                fontWeight="bold"
                color={darkBg ? 'white' : 'gray.800'}
                transition="opacity 0.2s ease"
              >
                {title}
              </Box>
            )}

            {canFullscreen && windowWidth >= 1024 && (
              <Box
                as="button"
                aria-label={effectiveIsFullscreen ? "Normalansicht" : "Vollbildansicht"}
                aria-expanded={effectiveIsFullscreen}
                aria-controls={bodyId}
                onClick={toggleFullscreen}
                display="flex"
                alignItems="center"
                justifyContent="center"
                w="32px"
                h="32px"
                borderRadius="full"
                bg={darkBg ? "whiteAlpha.100" : "blackAlpha.50"}
                color={darkBg ? "white" : "gray.800"}
                fontSize="18px"
                transition="all 0.2s"
                cursor="pointer" // Ändert den Mauszeiger zum Pointer
                ml="auto" // Verschiebt das Icon nach rechts, wenn kein Titel vorhanden ist
                _hover={{
                  bg: darkBg ? "whiteAlpha.200" : "blackAlpha.100"
                }}
                title={effectiveIsFullscreen ? "Normalansicht" : "Vollbildansicht"}
              >
                {effectiveIsFullscreen ? "⤢" : "⤡"}
              </Box>
            )}
          </Flex>
        )}

        {/* Hauptinhalt */}
        <Box
          id={bodyId}
          pt={canFullscreen || title ? 8 : 0}
          h={effectiveIsFullscreen ? "calc(100% - 40px)" : undefined} // Höhe anpassen im Vollbildmodus
          overflow={effectiveIsFullscreen ? "auto" : "visible"} // Scrollbar im Vollbildmodus
          className={effectiveIsFullscreen ? "custom-scrollbar" : undefined} // Scrollbar-Styling
        >
          {children}
        </Box>
      </Box>
    );
  }
);

ContentBox.displayName = 'ContentBox';

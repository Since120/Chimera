"use client";

import { Box, BoxProps } from '@chakra-ui/react';
import { forwardRef, useEffect, useRef, useState } from 'react';

// Erweitere BoxProps um unsere speziellen Props
interface NotchedBoxProps extends BoxProps {
  notchWidth?: string | number;
  notchHeight?: string | number;
  notchRadius?: string | number;
}

/**
 * Eine Box mit Notch-Ausschnitt am oberen Rand mit echten abgerundeten Ecken.
 */
export const NotchedBox = forwardRef<HTMLDivElement, NotchedBoxProps>(
  (
    {
      children,
      borderRadius = '32px',
      boxShadow = '0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)',
      _hover = { boxShadow: '0 15px 35px -6px rgba(0,0,0,0.40), 0 10px 15px -8px rgba(0,0,0,0.30)' },
      transition = 'box-shadow .3s ease',
      bg = 'white',
      p = 6,
      notchWidth = '30%',
      notchHeight = '60px',
      notchRadius = '25px',
      ...rest
    },
    ref
  ) => {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const [clipPathId] = useState(`notch-clip-${Math.random().toString(36).substring(2, 9)}`);
    const [path, setPath] = useState('');

    // Funktion zur Berechnung des SVG-Pfads
    const calculatePath = () => {
      if (!boxRef.current) return;

      const containerWidth = boxRef.current.offsetWidth;
      
      // Konvertiere CSS-Werte in Pixel
      const getPixelValue = (value: string | number, relativeTo: number | null = null) => {
        if (typeof value === 'number') {
          return value;
        }
        
        if (typeof value === 'string' && value.endsWith('%') && relativeTo !== null) {
          return (parseFloat(value) / 100) * relativeTo;
        }
        
        return parseFloat(String(value));
      };

      const notchWidthPx = getPixelValue(notchWidth, containerWidth);
      const notchHeightPx = getPixelValue(notchHeight);
      const cornerRadiusPx = getPixelValue(notchRadius);

      // Berechne die Positionen
      const centerX = containerWidth / 2;
      const leftStartX = centerX - (notchWidthPx / 2);
      const rightStartX = centerX + (notchWidthPx / 2);

      // Erstelle den SVG-Pfad mit echten abgerundeten Ecken
      let pathData = `
        M 0,0
        H ${leftStartX - cornerRadiusPx}
        
        /* Linke obere abgerundete Ecke */
        Q ${leftStartX},0 ${leftStartX},${cornerRadiusPx}
        
        V ${notchHeightPx - cornerRadiusPx}
        
        /* Linke untere abgerundete Ecke */
        Q ${leftStartX},${notchHeightPx} ${leftStartX + cornerRadiusPx},${notchHeightPx}
        
        H ${rightStartX - cornerRadiusPx}
        
        /* Rechte untere abgerundete Ecke */
        Q ${rightStartX},${notchHeightPx} ${rightStartX},${notchHeightPx - cornerRadiusPx}
        
        V ${cornerRadiusPx}
        
        /* Rechte obere abgerundete Ecke */
        Q ${rightStartX},0 ${rightStartX + cornerRadiusPx},0
        
        H ${containerWidth}
        V ${boxRef.current.offsetHeight}
        H 0
        Z
      `;

      // Bereinige den Pfad
      pathData = pathData.replace(/\/\*.*?\*\//g, '').replace(/\n\s*/g, ' ').trim();
      setPath(pathData);
    };

    useEffect(() => {
      calculatePath();
      
      // Beobachter für Größenänderungen hinzufügen
      const resizeObserver = new ResizeObserver(() => {
        calculatePath();
      });
      
      if (boxRef.current) {
        resizeObserver.observe(boxRef.current);
      }
      
      // Auch auf Fenstergrößenänderungen reagieren
      window.addEventListener('resize', calculatePath);
      
      // Aufräumen
      return () => {
        if (resizeObserver && boxRef.current) {
          resizeObserver.disconnect();
        }
        window.removeEventListener('resize', calculatePath);
      };
    }, [notchWidth, notchHeight, notchRadius]);

    // Kombiniere die Refs
    const setRefs = (element: HTMLDivElement | null) => {
      // Setze unseren internen Ref
      boxRef.current = element;
      
      // Setze den forwarded Ref
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <>
        {/* SVG-Definition für den Clip-Path */}
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <clipPath id={clipPathId}>
              <path d={path} />
            </clipPath>
          </defs>
        </svg>
        
        <Box
          ref={setRefs}
          bg={bg}
          _dark={{ bg: bg }}
          borderRadius={borderRadius}
          boxShadow={boxShadow}
          transition={transition}
          _hover={_hover}
          p={p}
          position="relative"
          style={{
            clipPath: `url(#${clipPathId})`,
            WebkitClipPath: `url(#${clipPathId})`,
          }}
          {...rest}
        >
          {children}
        </Box>
      </>
    );
  }
);

NotchedBox.displayName = 'NotchedBox';
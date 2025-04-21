"use client";

import { Box, BoxProps, Button, ButtonProps, Flex } from '@chakra-ui/react';
import { forwardRef, useEffect, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';

// Button-Typ für die Notch-Buttons
export interface NotchButtonProps {
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

// Erweitere BoxProps um unsere speziellen Props
interface NotchedBoxProps extends BoxProps {
  notchHeight?: string | number;
  notchRadius?: string | number;
  buttons?: NotchButtonProps[];
  buttonSpacing?: number;
  activeButtonBg?: string;
  inactiveButtonBg?: string;
  activeButtonColor?: string;
  inactiveButtonColor?: string;
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
      _hover = { boxShadow: '0 15px 35px -6px rgba(0,0,0,0.4), 0 10px 15px -8px rgba(0,0,0,0.3)' },
      transition = 'all 0.3s ease',
      bg = 'white',
      p = 6,
      notchHeight = '70px',
      notchRadius = '35px',
      buttons = [
        { label: 'Alle', isActive: true },
        { label: 'Entwurf', isActive: false },
      ],
      buttonSpacing = 2,
      activeButtonBg = '#90FF00', // Grün aus der TopBar-SubNavigation (nav.activeGreen)
      inactiveButtonBg = '#1E2536', // Grau aus dem Icon-Kreis der FilterBox
      activeButtonColor = 'black',
      inactiveButtonColor = 'white',
      ...rest
    },
    ref
  ) => {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const [clipPathId] = useState(`notch-clip-${Math.random().toString(36).substring(2, 9)}`);
    const [path, setPath] = useState('');

    // Berechne die Breite der Notch basierend auf der Anzahl der Buttons
    const calculateNotchWidth = () => {
      // Mindestbreite pro Button (in Pixel)
      const minButtonWidth = 100;
      // Zusätzlicher Platz für Padding und Abstand zwischen Buttons
      const buttonPadding = 16;
      const totalButtonSpacing = (buttons.length - 1) * buttonSpacing * 8; // buttonSpacing in rem, umgerechnet in ca. Pixel

      // Berechne die Gesamtbreite für alle Buttons
      return (minButtonWidth * buttons.length) + (buttonPadding * 2) + totalButtonSpacing;
    };

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

      // Berechne die Notch-Breite basierend auf den Buttons
      const notchWidthPx = Math.min(calculateNotchWidth(), containerWidth * 0.8); // Maximal 80% der Container-Breite
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
    }, [buttons, buttonSpacing, notchHeight, notchRadius]);

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

    // Rendere die Buttons
    const renderButtons = () => {
      return (
        <Flex
          position="absolute"
          top={0}
          left="50%"
          transform="translateX(-50%)"
          zIndex={10}
          gap={buttonSpacing}
          justifyContent="center"
          alignItems="center"
          height={notchHeight}
          px={4}
          pointerEvents="auto" // Wichtig, damit die Buttons klickbar sind
        >
          {buttons.map((button, index) => {
            const ButtonWrapper = ({ children }: { children: ReactNode }) => {
              if (button.href) {
                return <Link href={button.href} style={{ display: 'block' }}>{children}</Link>;
              }
              return <>{children}</>;
            };

            return (
              <ButtonWrapper key={index}>
                <Button
                  size="sm" // Kleinere Größe wie in der TopBar-SubNavigation
                  variant={button.isActive ? "solid" : "ghost"}
                  bg={button.isActive ? activeButtonBg : inactiveButtonBg}
                  color={button.isActive ? activeButtonColor : inactiveButtonColor}
                  boxShadow="0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)"
                  _hover={{
                    bg: button.isActive ? activeButtonBg : 'rgba(255,255,255,0.1)',
                    color: button.isActive ? activeButtonColor : 'white',
                    boxShadow: "0 15px 35px -6px rgba(0,0,0,0.4), 0 10px 15px -8px rgba(0,0,0,0.3)"
                  }}
                  transition="all 0.3s ease"
                  borderRadius="full" // Alle Buttons haben vollständig abgerundete Ecken
                  onClick={button.onClick}
                  px={4}
                  h="10" // Höhe wie in der TopBar-SubNavigation
                  fontWeight={button.isActive ? "semibold" : "normal"} // Schriftstärke wie in der TopBar-SubNavigation
                  display="flex"
                  alignItems="center"
                  gap={1.5} // Abstand zwischen Punkt und Text
                >
                  {/* Punkt links vom Text im aktiven Button */}
                  {button.isActive && (
                    <Box
                      w="4px"
                      h="4px"
                      borderRadius="full"
                      bg="black"
                      mt="1px" // Leichte Anpassung der vertikalen Position
                    />
                  )}
                  {button.label}
                  {/* Optional: Badge für Anzahl */}
                  {button.isActive && button.label === 'Entwurf' && (
                    <Box
                      ml={1.5}
                      bg="gray.700"
                      color="gray.300"
                      borderRadius="full"
                      fontSize="xs"
                      px={1.5}
                      py={0.5}
                      minW="20px"
                      textAlign="center"
                    >
                      3
                    </Box>
                  )}
                  {button.isActive && button.label === 'Aktiv' && (
                    <Box
                      ml={1.5}
                      bg="rgba(0,0,0,0.2)"
                      color="black"
                      borderRadius="full"
                      fontSize="xs"
                      px={1.5}
                      py={0.5}
                      minW="20px"
                      textAlign="center"
                    >
                      5
                    </Box>
                  )}
                </Button>
              </ButtonWrapper>
            );
          })}
        </Flex>
      );
    };

    // Berechne das Padding-Top basierend auf der Notch-Höhe, aber reduziere es etwas
    const notchHeightValue = typeof notchHeight === 'number' ? notchHeight : parseInt(String(notchHeight), 10);
    const paddingTop = `${Math.max(notchHeightValue - 50, 0)}px`; // 20px weniger als die Notch-Höhe, mindestens 0

    return (
      <Box position="relative" width="full" height="full" display="flex" flexDirection="column">
        {/* SVG-Definition für den Clip-Path */}
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <clipPath id={clipPathId}>
              <path d={path} />
            </clipPath>
          </defs>
        </svg>

        {/* Buttons in der Notch - AUSSERHALB des geclippten Bereichs */}
        {renderButtons()}

        <Box
          ref={setRefs}
          bg={bg}
          _dark={{ bg: bg }}
          borderRadius={borderRadius}
          boxShadow={boxShadow}
          transition={transition}
          _hover={_hover}
          px={p} // Seitliches Padding beibehalten
          pt={paddingTop} // Automatisch angepasstes Padding-Top basierend auf der Notch-Höhe
          pb={4} // Ausreichendes Padding am unteren Rand
          position="relative"
          flex="1"
          width="full"
          style={{
            clipPath: `url(#${clipPathId})`,
            WebkitClipPath: `url(#${clipPathId})`,
          }}
          {...rest}
        >
          {/* Hauptinhalt */}
          {children}
        </Box>
      </Box>
    );
  }
);

NotchedBox.displayName = 'NotchedBox';
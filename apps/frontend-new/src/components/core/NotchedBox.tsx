"use client";

import { Box, BoxProps, Button, Flex, Heading } from '@chakra-ui/react';
import React, { forwardRef, useEffect, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
import { FiMenu } from 'react-icons/fi';
import { useFullscreen } from '../../hooks/useFullscreen';

// Button-Typ für die Notch-Buttons
export interface NotchButtonProps {
  label: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactElement; // Icon-Element (z.B. aus einer Icon-Bibliothek)
  iconPosition?: 'left' | 'right'; // Position des Icons (links oder rechts vom Text)
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
  // Hover-Farben für Buttons
  activeButtonHoverBg?: string;
  inactiveButtonHoverBg?: string;
  activeButtonHoverColor?: string;
  inactiveButtonHoverColor?: string;
  // Neue Props
  title?: string;
  titleSize?: string;
  titleColor?: string;
  titleFontWeight?: string;
  rightButtons?: NotchButtonProps[];
  // Vollbildmodus-Props
  canFullscreen?: boolean; // Ob die NotchedBox in den Vollbildmodus wechseln kann
  isFullscreen?: boolean; // Ob die NotchedBox im Vollbildmodus ist (kontrollierter Modus)
  defaultIsFullscreen?: boolean; // Standardwert für isFullscreen (unkontrollierter Modus)
  onFullscreenChange?: (isFullscreen: boolean) => void; // Callback, wenn der Vollbildmodus geändert wird
}

/**
 * Eine Box mit Notch-Ausschnitt am oberen Rand mit echten abgerundeten Ecken.
 */
export const NotchedBox = forwardRef<HTMLDivElement, NotchedBoxProps>(
  (
    {
      children,
      borderRadius = '32px',
      boxShadow = 'card',
      _hover = { boxShadow: 'cardHover' },
      transition = 'all 0.3s ease',
      bg = 'card.backgroundLight',
      p = 6,
      notchHeight = '70px',
      notchRadius = '35px',
      buttons = [
        { label: 'Alle', isActive: true },
        { label: 'Entwurf', isActive: false },
      ],
      buttonSpacing = 2,
      activeButtonBg = 'button.notch.activeBg',
      inactiveButtonBg = 'button.notch.inactiveBg',
      activeButtonColor = 'button.notch.activeColor',
      inactiveButtonColor = 'button.notch.inactiveColor',
      // Hover-Farben für Buttons
      activeButtonHoverBg,
      inactiveButtonHoverBg = 'rgba(255,255,255,0.1)',
      activeButtonHoverColor,
      inactiveButtonHoverColor = 'white',
      // Neue Props mit Standardwerten
      title,
      titleSize = 'lg' as const,
      titleColor = 'gray.800',
      titleFontWeight = 'semibold',
      rightButtons = [],
      // Vollbildmodus-Props
      canFullscreen = false,
      isFullscreen: isFullscreenProp,
      defaultIsFullscreen = false,
      onFullscreenChange,
      ...rest
    },
    ref
  ) => {
    const boxRef = useRef<HTMLDivElement | null>(null);
    const [clipPathId] = useState(`notch-clip-${Math.random().toString(36).substring(2, 9)}`);
    const [path, setPath] = useState('');

    // Bestimme, ob der Komponente im kontrollierten oder unkontrollierten Modus ist
    const isControlled = isFullscreenProp !== undefined;

    // Verwende den useFullscreen-Hook
    const {
      isFullscreen: internalIsFullscreen,
      toggleFullscreen: internalToggleFullscreen
    } = useFullscreen({
      defaultIsFullscreen,
      onFullscreenChange: isControlled ? undefined : onFullscreenChange,
      containerId: 'dashboard-container'
    });

    // Der aktuelle Vollbildmodus-Zustand (entweder kontrolliert oder unkontrolliert)
    const isFullscreen = isControlled ? isFullscreenProp : internalIsFullscreen;

    // Funktion zum Umschalten des Vollbildmodus
    const toggleFullscreen = () => {
      console.log('NotchedBox toggleFullscreen:', {
        isFullscreen,
        isControlled,
        onFullscreenChange: !!onFullscreenChange
      });

      if (isControlled) {
        // Im kontrollierten Modus rufen wir nur den Callback auf
        if (onFullscreenChange) {
          onFullscreenChange(!isFullscreen);
        }
      } else {
        // Im unkontrollierten Modus verwenden wir die interne Funktion
        internalToggleFullscreen();
      }
    };





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

    // Prüfe, ob wir im responsiven Modus sind
    const isResponsive = windowWidth <= 1350; // Für die rechten Buttons (unter 1350px)
    const isResponsiveNotch = windowWidth <= 850; // Für die Notch-Buttons (unter 850px)
    const isVerySmallScreen = windowWidth <= 550; // Für sehr kleine Bildschirme (unter 550px)

    // Berechne die Breite der Notch basierend auf der Anzahl der Buttons
    const calculateNotchWidth = () => {
      // Zusätzlicher Platz für Padding und Abstand zwischen Buttons
      const buttonPadding = 16;

      // Für sehr kleine Bildschirme (unter 550px) verwenden wir nur einen Toggle-Button
      if (isVerySmallScreen) {
        // Breite für einen einzelnen Toggle-Button
        const toggleButtonWidth = 50; // Breite für den Toggle-Button
        return toggleButtonWidth + (buttonPadding * 2);
      }
      // Im responsiven Modus (unter 850px) berechnen wir die Breite nur für Icons
      else if (isResponsiveNotch) {
        // Abstand zwischen den Buttons
        const totalButtonSpacing = (buttons.length - 1) * buttonSpacing * 8;
        const iconButtonWidth = 40; // Breite für einen Button mit nur Icon
        return (iconButtonWidth * buttons.length) + (buttonPadding * 2) + totalButtonSpacing;
      }
      // Im normalen Modus berechnen wir die Breite für Buttons mit Text und Icons
      else {
        // Abstand zwischen den Buttons
        const totalButtonSpacing = (buttons.length - 1) * buttonSpacing * 8;
        const textButtonWidth = 100; // Mindestbreite für einen Button mit Text

        // Zusätzlicher Platz für Icons (wenn vorhanden)
        const iconSpace = buttons.reduce((total, button) => {
          // Wenn ein Button ein Icon hat, füge zusätzlichen Platz hinzu (Icon + Abstand)
          return total + (button.icon ? 24 : 0); // 24px für Icon (14px) + Abstand (10px)
        }, 0);

        // Berechne die Gesamtbreite für alle Buttons mit Text
        return (textButtonWidth * buttons.length) + (buttonPadding * 2) + totalButtonSpacing + iconSpace;
      }
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
      // Reduziere den Radius für kleine Bildschirme
      const cornerRadiusPx = isVerySmallScreen ? 10 : getPixelValue(notchRadius);

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
    }, [buttons, buttonSpacing, notchHeight, notchRadius, isResponsiveNotch]);

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

    // Hilfsfunktion zum Rendern eines einzelnen Buttons
    const renderButton = (button: NotchButtonProps, index: number, isInNotch: boolean = true) => {
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
            boxShadow="card"
            _hover={{
              bg: button.isActive ? (activeButtonHoverBg || activeButtonBg) : inactiveButtonHoverBg,
              color: button.isActive ? (activeButtonHoverColor || activeButtonColor) : inactiveButtonHoverColor,
              boxShadow: "cardHover"
            }}
            transition="all 0.3s ease"
            borderRadius="full" // Alle Buttons haben vollständig abgerundete Ecken
            onClick={button.onClick}
            // Wenn kein Label vorhanden ist, zeige einen kreisförmigen Button an
            px={button.label ? 4 : 0}
            h="10" // Höhe wie in der TopBar-SubNavigation
            w={button.label ? "auto" : "10"} // Quadratisch, wenn kein Label vorhanden ist
            minW={button.label ? "auto" : "10"} // Mindestbreite für kreisförmige Buttons
            fontWeight={button.isActive ? "semibold" : "normal"} // Schriftstärke wie in der TopBar-SubNavigation
            display="flex"
            alignItems="center"
            justifyContent={button.label ? "flex-start" : "center"} // Zentriert, wenn kein Label vorhanden ist
            gap={1.5} // Abstand zwischen Punkt und Text
          >
            {/* Punkt links vom Text im aktiven Button */}
            {button.isActive && isInNotch && !button.icon && (
              <Box
                w="4px"
                h="4px"
                borderRadius="full"
                bg="button.notch.dotColor"
                mt="1px" // Leichte Anpassung der vertikalen Position
              />
            )}

            {/* Icon links vom Text oder zentriert, wenn kein Label vorhanden ist */}
            {button.icon && (!button.iconPosition || button.iconPosition === 'left' || !button.label) && (
              <Box mr={button.label ? 1.5 : 0} display="flex" alignItems="center">
                {button.icon}
              </Box>
            )}

            {/* Label anzeigen, wenn vorhanden */}
            {button.label}

            {/* Icon rechts vom Text, wenn vorhanden und Position ist 'right' */}
            {button.icon && button.iconPosition === 'right' && button.label && (
              <Box ml={1.5} display="flex" alignItems="center">
                {button.icon}
              </Box>
            )}

            {/* Optional: Badge für Anzahl */}
            {button.isActive && button.label === 'Entwurf' && isInNotch && (
              <Box
                ml={1.5}
                bg="button.notch.badgeBgInactive"
                color="button.notch.badgeColorInactive"
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
            {button.isActive && button.label === 'Aktiv' && isInNotch && (
              <Box
                ml={1.5}
                bg="button.notch.badgeBgActive"
                color="button.notch.badgeColorActive"
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
    };

    // State für das Dropdown-Menü
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Ref für den Dropdown-Container
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Schließe das Dropdown-Menü, wenn außerhalb geklickt wird
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Rendere die Buttons in der Notch
    const renderNotchButtons = () => {

      // Für sehr kleine Bildschirme (unter 550px) zeigen wir einen einzelnen Button
      if (isVerySmallScreen) {
        return (
          <Flex
            position="absolute"
            top={0}
            left="50%"
            transform="translateX(-50%)"
            zIndex={10}
            justifyContent="center"
            alignItems="center"
            height={notchHeight}
            px={4}
            pointerEvents="auto" // Wichtig, damit die Buttons klickbar sind
          >
            <Box position="relative" ref={dropdownRef}>
              {/* Toggle-Button */}
              <Button
                size="sm"
                variant="solid"
                bg={activeButtonBg}
                color={activeButtonColor}
                boxShadow="card"
                _hover={{
                  bg: activeButtonHoverBg || activeButtonBg,
                  boxShadow: "cardHover"
                }}
                borderRadius="full"
                h="10"
                w="10"
                minW="10"
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <FiMenu size={18} />
              </Button>

              {/* Dropdown-Menü */}
              {isDropdownOpen && (
                <Box
                  position="absolute"
                  top="calc(100% + 8px)"
                  left="50%"
                  transform="translateX(-50%)"
                  bg={inactiveButtonBg}
                  borderColor="transparent"
                  boxShadow="card"
                  borderRadius="xl"
                  p={2}
                  minW="150px"
                  zIndex={20}
                >
                  <Flex direction="column" gap={1}>
                    {buttons.map((button, index) => (
                      <Button
                        key={index}
                        onClick={() => {
                          if (button.onClick) button.onClick();
                          setIsDropdownOpen(false);
                        }}
                        bg={button.isActive ? activeButtonBg : "transparent"}
                        color={button.isActive ? activeButtonColor : inactiveButtonColor}
                        _hover={{
                          bg: button.isActive ? activeButtonHoverBg : inactiveButtonHoverBg,
                          color: button.isActive ? activeButtonHoverColor : inactiveButtonHoverColor
                        }}
                        borderRadius="md"
                        fontWeight={button.isActive ? "semibold" : "normal"}
                        w="full"
                        justifyContent="flex-start"
                        variant="ghost"
                        size="sm"
                      >
                        <Flex alignItems="center" gap={2}>
                          {button.icon && (
                            <Box display="flex" alignItems="center">
                              {button.icon}
                            </Box>
                          )}
                          {button.label}
                        </Flex>
                      </Button>
                    ))}
                  </Flex>
                </Box>
              )}
            </Box>
          </Flex>
        );
      }

      // Für normale und mittlere Bildschirme zeigen wir die Buttons in der Notch
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
            // Im responsiven Modus (unter 850px) zeigen wir nur das Icon an
            if (isResponsiveNotch && button.icon) {
              return renderButton({
                ...button,
                label: '', // Kein Label im responsiven Modus
              }, index);
            }
            // Ansonsten zeigen wir den Button normal an
            return renderButton(button, index);
          })}
        </Flex>
      );
    };

    // Rendere den Titel (oben links)
    const renderTitle = () => {
      if (!title) return null;

      return (
        <Heading
          position="absolute"
          top={4}
          left={6}
          zIndex={10}
          size={windowWidth < 550 ? "sm" : (titleSize as any)} // Kleinere Schriftgröße auf sehr kleinen Bildschirmen
          color={titleColor}
          fontWeight={titleFontWeight}
          pointerEvents="auto"
        >
          {title}
        </Heading>
      );
    };

    // Rendere die rechten Buttons
    const renderRightButtons = () => {
      // Wenn keine Buttons vorhanden sind und kein Vollbildmodus aktiviert ist, zeige nichts an
      if ((!rightButtons || rightButtons.length === 0) && !canFullscreen) return null;

      // Erstelle eine Kopie der rightButtons
      const allRightButtons = [...(rightButtons || [])];

      // Füge den Vollbildmodus-Button hinzu, wenn canFullscreen aktiviert ist und wir auf Desktop sind
      if (canFullscreen && windowWidth >= 1024) { // 1024px ist der lg-Breakpoint in Chakra UI
        allRightButtons.push({
          label: '', // Kein Label für kreisförmigen Button
          onClick: toggleFullscreen,
          icon: isFullscreen ?
            <Box as="span" fontSize="18px">⤢</Box> : // Unicode-Symbol für Minimieren
            <Box as="span" fontSize="18px">⤡</Box>, // Unicode-Symbol für Maximieren
        });
      }

      return (
        <Flex
          position="absolute"
          top={4}
          right={6}
          zIndex={10}
          gap={buttonSpacing}
          alignItems="center"
          pointerEvents="auto"
        >
          {allRightButtons.map((button, index) => {
            // Im responsiven Modus (unter 1350px) zeigen wir nur das Icon an
            if (isResponsive && button.icon) {
              return renderButton({
                ...button,
                label: '', // Kein Label im responsiven Modus
              }, index, false);
            }
            // Ansonsten zeigen wir den Button normal an
            return renderButton(button, index, false);
          })}
        </Flex>
      );
    };

    // Berechne das Padding-Top basierend auf der Notch-Höhe, aber reduziere es etwas
    const notchHeightValue = typeof notchHeight === 'number' ? notchHeight : parseInt(String(notchHeight), 10);
    const paddingTop = `${Math.max(notchHeightValue - 0, 0)}px`; // 20px weniger als die Notch-Höhe, mindestens 0

    return (
      <Box
        ref={boxRef}
        position={isFullscreen ? 'absolute' : 'relative'}
        top={isFullscreen ? 0 : undefined}
        left={isFullscreen ? 0 : undefined}
        right={isFullscreen ? 0 : undefined}
        bottom={isFullscreen ? 0 : undefined}
        width={isFullscreen ? '100%' : 'full'}
        height={isFullscreen ? '100%' : 'full'}
        zIndex={isFullscreen ? 100 : 1}
        display="flex"
        flexDirection="column"
        transition="all 0.3s ease"
      >
        {/* SVG-Definition für den Clip-Path */}
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
          <defs>
            <clipPath id={clipPathId}>
              <path d={path} />
            </clipPath>
          </defs>
        </svg>

        {/* Titel oben links */}
        {renderTitle()}

        {/* Buttons oben rechts */}
        {renderRightButtons()}

        {/* Buttons in der Notch - AUSSERHALB des geclippten Bereichs */}
        {renderNotchButtons()}

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
          height={isFullscreen ? "100%" : undefined}
          overflow={isFullscreen ? "auto" : "visible"}
          className={isFullscreen ? "custom-scrollbar" : undefined}
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
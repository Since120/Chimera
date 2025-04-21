// apps/frontend-new/src/components/core/ContentBox.tsx
import { Box, BoxProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

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
      ...rest
    },
    ref
  ) => {
    // Berechne den Flex-Anteil basierend auf der Größe
    const flexValue = sizeToFlexRatio[size];
    
    return (
      <Box
        ref={ref}
        flex={flexValue}
        bg={darkBg ? '#151A26' : 'white'}
        _dark={{ bg: darkBg ? '#151A26' : 'white' }}
        color={darkBg ? 'white' : 'inherit'}
        borderRadius={borderRadius}
        p={p}
        boxShadow="0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)"
        transition="all 0.3s ease"
        _hover={{ boxShadow: "0 15px 35px -6px rgba(0,0,0,0.4), 0 10px 15px -8px rgba(0,0,0,0.3)" }}
        position="relative"
        overflow="hidden"
        {...rest}
      >
        {children}
      </Box>
    );
  }
);

ContentBox.displayName = 'ContentBox';

'use client';

import * as React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@/styles/theme/create-theme';
import type { Settings } from '@/types/settings';
import type { Direction, PrimaryColor } from '@/styles/theme/types'; // Importiere auch PrimaryColor
import { appConfig } from '@/config/app';

interface ClientThemeProviderProps {
  children: React.ReactNode;
  settings: Settings;
  direction: Direction;
}

export function ClientThemeProvider({ children, settings, direction }: ClientThemeProviderProps): React.JSX.Element {
  // Theme-Objekt hier innerhalb der Client Component erstellen
  const theme = createTheme({
    primaryColor: (settings.primaryColor ?? appConfig.primaryColor) as PrimaryColor, // Füge Typzusicherung hinzu
    direction,
  });

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
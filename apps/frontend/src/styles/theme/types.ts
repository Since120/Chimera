import type { Theme as MuiTheme } from '@mui/material/styles';

export type Direction = 'ltr' | 'rtl';

export type PrimaryColor = 'blue' | 'green' | 'indigo' | 'purple' | 'red' | 'cyan';

export type ColorScheme = 'dark' | 'light';

export interface Theme extends MuiTheme {
  // Hier können zusätzliche Eigenschaften für das Theme definiert werden
}

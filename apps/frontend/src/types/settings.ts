import type { PrimaryColor } from '@/styles/theme/types'; // Importiere den Typ vom zentralen Ort

/**
 * Einstellungen für die Anwendung
 */
export interface Settings {
  /**
   * Farbschema der Anwendung
   */
  colorScheme?: 'light' | 'dark' | 'system';

  /**
   * Primärfarbe der Anwendung
   */
  primaryColor?: PrimaryColor; // Verwende den spezifischen Typ

  /**
   * Sekundärfarbe der Anwendung
   */
  secondaryColor?: string;

  /**
   * Sprache der Anwendung
   */
  language?: string;

  /**
   * Weitere Einstellungen können hier hinzugefügt werden
   */
  [key: string]: any;
}

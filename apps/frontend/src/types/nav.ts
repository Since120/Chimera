/**
 * Konfiguration für ein Navigationselement
 */
export interface NavItemConfig {
  /**
   * Eindeutiger Schlüssel für das Element
   */
  key: string;

  /**
   * Titel des Elements
   */
  title: string;

  /**
   * Unterelemente des Elements
   */
  items?: NavItemChildConfig[];

  /**
   * Icon des Elements (optional)
   */
  icon?: string;

  /**
   * Link des Elements (optional)
   */
  href?: string;

  /**
   * Gibt an, ob das Element deaktiviert ist (optional)
   */
  disabled?: boolean;

  /**
   * Gibt an, ob das Element extern ist (optional)
   */
  external?: boolean;

  /**
   * Gibt an, ob das Element ein Label hat (optional)
   */
  label?: string;
}

/**
 * Konfiguration für ein Unterelement der Navigation
 */
export interface NavItemChildConfig {
  /**
   * Eindeutiger Schlüssel für das Element
   */
  key: string;

  /**
   * Titel des Elements
   */
  title: string;

  /**
   * Icon des Elements (optional)
   */
  icon?: string;

  /**
   * Link des Elements (optional)
   */
  href?: string;

  /**
   * Gibt an, ob das Element deaktiviert ist (optional)
   */
  disabled?: boolean;

  /**
   * Gibt an, ob das Element extern ist (optional)
   */
  external?: boolean;

  /**
   * Gibt an, ob das Element ein Label hat (optional)
   */
  label?: string;
}

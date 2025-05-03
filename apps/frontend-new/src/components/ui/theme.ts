// apps/frontend-new/src/components/ui/theme.ts
import { createSystem, defaultConfig, defineConfig, defineSemanticTokens } from "@chakra-ui/react";

// Keyframes für Animationen
const keyframes = {
  blink: {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0 }
  },
  pulseSlow: {
    "0%, 100%": { opacity: 0.1 },
    "50%": { opacity: 0.3 }
  },
  typing: {
    from: { width: 0 },
    to: { width: "100%" }
  },
  sweep: {
    "0%": { left: "-100%" },
    "100%": { left: "100%" }
  },
  spin: {
    to: { transform: "rotate(360deg)" }
  },
  ping: {
    "0%": { transform: "scale(0.8)", opacity: 0.8 },
    "50%": { opacity: 0.3 },
    "100%": { transform: "scale(1.2)", opacity: 0 }
  },
  scan: {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(33.33%)" }
  },
  buttonSpotlight: {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(200%)" }
  }
};

// Animationen
const animations = {
  blink: { value: `${keyframes.blink.toString()} 1s step-end infinite` },
  pulseSlow: { value: `${keyframes.pulseSlow.toString()} 3s infinite` },
  typing: { value: `${keyframes.typing.toString()} 2s steps(6, end) 1s 1 normal both` },
  sweep: { value: `${keyframes.sweep.toString()} 12s linear infinite` },
  spin: { value: `${keyframes.spin.toString()} 10s linear infinite` },
  ping: { value: `${keyframes.ping.toString()} 3s cubic-bezier(0, 0, 0.2, 1) infinite` },
  scan: { value: `${keyframes.scan.toString()} 6s linear infinite` },
  buttonSpotlight: { value: `${keyframes.buttonSpotlight.toString()} 3s ease-out infinite` }
};

// Farbdefinitionen - KORRIGIERTE Struktur mit value-Objekten
const colors = {

  dark: {
    50: { value: "#F0F2F5" },
    100: { value: "#E1E5EB" },
    200: { value: "#C9D1DB" },
    300: { value: "#ADB9C7" },
    400: { value: "#8F9FB1" },
    500: { value: "#71849A" },
    600: { value: "#556981" },
    700: { value: "#3C4F68" },
    800: { value: "#27374D" },
    900: { value: "#1A2534" },
    950: { value: "#111822" }
  },
  gray: {
    50: { value: "#F9FAFB" },
    100: { value: "#F3F4F6" },
    200: { value: "#E5E7EB" },
    300: { value: "#D1D5DB" },
    400: { value: "#9CA3AF" },
    500: { value: "#6B7280" },
    600: { value: "#4B5563" },
    700: { value: "#374151" },
    800: { value: "#1F2937" },
    900: { value: "#111827" },
    950: { value: "#0D1117" },
  },

  // Farben für TopNav - Basis-Tokens
  navBgBase: { value: "#FFFFFF" },
  navActiveGreenBase: { value: "#90FF00" },
  navIconCircleBgBase: { value: "#1E293A" },
  navIconColorBase: { value: "#BAC5D5" },
  navIconBorderColorBase: { value: "rgba(186, 197, 213, 0.6)" }, // Abgeschwächte Rahmenfarbe
  navIconOutlineColorBase: { value: "rgba(186, 197, 213, 0.3)" }, // Noch subtilere Rahmenfarbe für Outline-Buttons

  // Grundlegende Farben
  whiteBase: { value: "#FFFFFF" },
  blackBase: { value: "#000000" },
  whiteAlpha10Base: { value: "rgba(255,255,255,0.1)" },
  redAlpha10Base: { value: "rgba(239, 68, 68, 0.1)" },

  // Filter-Komponenten
  filterBgBase: { value: "#151A26" },
  filterHoverBgBase: { value: "#1D2433" },
  filterActiveBgBase: { value: "#232A3D" },
  filterIconCircleBgBase: { value: "#1E2536" },

  // NotchedBox-Komponente
  notchButtonActiveBgBase: { value: "#90FF00" }, // Gleich wie navActiveGreenBase
  notchButtonInactiveBgBase: { value: "#1E2536" }, // Gleich wie filterIconCircleBgBase
  notchButtonActiveColorBase: { value: "black" },
  notchButtonInactiveColorBase: { value: "white" },
  notchButtonBadgeBgActiveBase: { value: "rgba(0,0,0,0.2)" },
  notchButtonBadgeColorActiveBase: { value: "black" },
  notchButtonBadgeBgInactiveBase: { value: "gray.700" },
  notchButtonBadgeColorInactiveBase: { value: "gray.300" },
  notchButtonDotColorBase: { value: "black" },

  // ContentBox-Komponente
  contentBoxDarkBgBase: { value: "#151A26" },
  contentBoxLightBgBase: { value: "white" },

  // Dashboard-Hintergrund
  dashboardBgBase: { value: "#0c111b" },
  contentBgBase: { value: "white" },

  // Login-Seite
  loginCardBgBase: { value: "#0c111b" },
  loginHeaderBgBase: { value: "#0f1523" },
  loginBotPreviewBgBase: { value: "#0f1523" },
  loginBotIconGradientStartBase: { value: "#0c111b" },
  loginBotIconGradientEndBase: { value: "#0f1523" },
  loginBorderColorBase: { value: "rgba(255, 255, 255, 0.08)" },
  loginGlassGradientBase: { value: "linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent, rgba(255, 255, 255, 0.05))" },
  loginBotPreviewGradientBase: { value: "linear-gradient(135deg, transparent 0%, rgba(15, 21, 35, 0.2) 50%, transparent 100%)" },
  loginBotPreviewShadowBase: { value: "inset 0 0 20px rgba(144, 255, 0, 0.05)" },
  loginErrorBgBase: { value: "rgba(254, 178, 178, 0.16)" },
  loginErrorBorderColorBase: { value: "red.500" },

  // Dashboard Layout
  dashboardLayoutElevatedBgBase: { value: "rgba(16, 23, 34, 0.98)" },
  dashboardLayoutBorderColorBase: { value: "#0c111b" },

  // Backgrounds
  backgroundsMainBase: { value: "#111822" },
  backgroundsGradient1Base: { value: "rgba(27, 37, 52, 0.7)" },
  backgroundsGradient2Base: { value: "rgba(39, 55, 77, 0.6)" },
  backgroundsGradient3Base: { value: "rgba(33, 45, 65, 0.5)" },
  backgroundsGradient4Base: { value: "rgba(27, 37, 52, 0.6)" },

  // Shadows
  shadowElevatedBase: { value: "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3)" },
  shadowInsetBase: { value: "inset 0 0 15px rgba(0,0,0,0.2)" },
  shadowLoginCardBase: { value: "0 30px 60px -10px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.4)" },
  shadowOverlayBase: { value: "rgba(0,0,0,0.3)" },

  // DataTable Basis-Tokens
  tableRowLightBase: { value: "#FDFDFD" },
  tableRowBorderLightBase: { value: "#EFEFEF" },
  tableIconLightBase: { value: "#555555" },
  tableRowHoverBgBase: { value: "#151A26" },
  tableRowHoverTextBase: { value: "#FFFFFF" },
  tableLabelHoverBase: { value: "#FFFFFF" },
  tableIconHoverBase: { value: "#90FF00" },
  tableRowHoverIconBase: { value: "#FFFFFF" },
  tableRowActiveBgBase: { value: "#151A26" },
  tableRowActiveBorderBase: { value: "#90FF00" },
  tableRowActiveTextBase: { value: "#FFFFFF" },
  tableLabelLightBase: { value: "#000000" },
  tableContentLightBase: { value: "#000000" },

  // DataTable Dark Mode Basis-Tokens
  tableRowDarkBase: { value: "#262B37" },
  tableRowBorderDarkBase: { value: "#262B37" },
  tableIconDarkBase: { value: "#AAAAAA" },
  tableRowHoverBgDarkBase: { value: "#373C43" },
  tableRowHoverTextDarkBase: { value: "#FFFFFF" },
  tableLabelHoverDarkBase: { value: "#FFFFFF" },
  tableIconHoverDarkBase: { value: "#90FF00" },
  tableRowHoverIconDarkBase: { value: "#FFFFFF" },
  tableRowActiveBgDarkBase: { value: "#2A3349" },
  tableRowActiveBorderDarkBase: { value: "#90FF00" },
  tableRowActiveTextDarkBase: { value: "#FFFFFF" },
  tableLabelDarkBase: { value: "#FFFFFF" },
  tableContentDarkBase: { value: "#FFFFFF" },

  // DataTable Schriftgrößen und -gewichte
  tableLabelFontSizeBase: { value: "0.7em" },
  tableLabelFontWeightBase: { value: "normal" },
  tableContentFontSizeBase: { value: "0.9em" },
  tableContentFontWeightBase: { value: "300" },

  // Scrollbar Basis-Tokens
  scrollbarThumbBgBase: { value: "rgba(255, 255, 255, 0.2)" },
  scrollbarThumbHoverBgBase: { value: "rgba(255, 255, 255, 0.3)" },

  // Card Shadow Basis-Tokens
  cardShadowBase: { value: "0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)" },
  cardHoverShadowBase: { value: "0 15px 35px -6px rgba(0,0,0,0.4), 0 10px 15px -8px rgba(0,0,0,0.3)" }
};

const semanticTokens = defineSemanticTokens({
  colors: {
    // Hintergrundfarben
    bg: { value: { base: "white", _dark: "{colors.dark.950}" } },
    "bg.subtle": { value: { base: "{colors.gray.50}", _dark: "{colors.dark.900}" } },
    "bg.muted": { value: { base: "{colors.gray.100}", _dark: "{colors.dark.800}" } },
    "bg.emphasized": { value: { base: "{colors.gray.200}", _dark: "{colors.dark.700}" } },
    // Textfarben
    fg: { value: { base: "{colors.dark.900}", _dark: "{colors.dark.50}" } },
    "fg.muted": { value: { base: "{colors.dark.600}", _dark: "{colors.dark.300}" } },
    "fg.subtle": { value: { base: "{colors.dark.500}", _dark: "{colors.dark.400}" } },
    // Randfarben
    border: { value: { base: "{colors.gray.200}", _dark: "{colors.dark.700}" } },
    "border.subtle": { value: { base: "{colors.gray.100}", _dark: "{colors.dark.800}" } },

    // Navigation Tokens mit korrekten Referenzen auf Basis-Tokens
    nav: {
      bg: { value: { base: "{colors.navBgBase}", _dark: "{colors.navBgBase}" } }, // Weiß bleibt weiß
      activeGreen: { value: { base: "{colors.navActiveGreenBase}", _dark: "{colors.navActiveGreenBase}" } },
      iconCircleBg: { value: { base: "{colors.navIconCircleBgBase}", _dark: "{colors.navIconCircleBgBase}" } },
      iconColor: { value: { base: "{colors.navIconColorBase}", _dark: "{colors.navIconColorBase}" } },
      iconBorderColor: { value: { base: "{colors.navIconBorderColorBase}", _dark: "{colors.navIconBorderColorBase}" } },
      iconOutlineColor: { value: { base: "{colors.navIconOutlineColorBase}", _dark: "{colors.navIconOutlineColorBase}" } }
    },

    // Filter-Komponenten
    button: {
      filter: {
        bg: { value: { base: "{colors.filterBgBase}", _dark: "{colors.filterBgBase}" } },
        hoverBg: { value: { base: "{colors.filterHoverBgBase}", _dark: "{colors.filterHoverBgBase}" } },
        activeBg: { value: { base: "{colors.filterActiveBgBase}", _dark: "{colors.filterActiveBgBase}" } },
        iconCircleBg: { value: { base: "{colors.filterIconCircleBgBase}", _dark: "{colors.filterIconCircleBgBase}" } },
        iconColor: { value: { base: "{colors.whiteBase}", _dark: "{colors.whiteBase}" } },
        textColor: { value: { base: "{colors.gray.300}", _dark: "{colors.gray.300}" } }
      },
      notch: {
        activeBg: { value: { base: "{colors.notchButtonActiveBgBase}", _dark: "{colors.notchButtonActiveBgBase}" } },
        inactiveBg: { value: { base: "{colors.notchButtonInactiveBgBase}", _dark: "{colors.notchButtonInactiveBgBase}" } },
        activeColor: { value: { base: "{colors.notchButtonActiveColorBase}", _dark: "{colors.notchButtonActiveColorBase}" } },
        inactiveColor: { value: { base: "{colors.notchButtonInactiveColorBase}", _dark: "{colors.notchButtonInactiveColorBase}" } },
        badgeBgActive: { value: { base: "{colors.notchButtonBadgeBgActiveBase}", _dark: "{colors.notchButtonBadgeBgActiveBase}" } },
        badgeColorActive: { value: { base: "{colors.notchButtonBadgeColorActiveBase}", _dark: "{colors.notchButtonBadgeColorActiveBase}" } },
        badgeBgInactive: { value: { base: "{colors.notchButtonBadgeBgInactiveBase}", _dark: "{colors.notchButtonBadgeBgInactiveBase}" } },
        badgeColorInactive: { value: { base: "{colors.notchButtonBadgeColorInactiveBase}", _dark: "{colors.notchButtonBadgeColorInactiveBase}" } },
        dotColor: { value: { base: "{colors.notchButtonDotColorBase}", _dark: "{colors.notchButtonDotColorBase}" } },
        // Hover-Zustände
        inactiveHoverBg: { value: { base: "{colors.whiteAlpha10Base}", _dark: "{colors.whiteAlpha10Base}" } },
        inactiveHoverColor: { value: { base: "{colors.whiteBase}", _dark: "{colors.whiteBase}" } }
      },
      // Modal-Buttons
      modalPrimary: {
        bg: { value: { base: "{colors.navActiveGreenBase}", _dark: "{colors.navActiveGreenBase}" } },
        color: { value: { base: "{colors.blackBase}", _dark: "{colors.blackBase}" } },
        hoverBg: { value: { base: "#7FE000", _dark: "#7FE000" } },
        activeBg: { value: { base: "#70D000", _dark: "#70D000" } }
      },
      modalSecondary: {
        bg: { value: { base: "transparent", _dark: "transparent" } },
        color: { value: { base: "{colors.whiteBase}", _dark: "{colors.whiteBase}" } },
        borderColor: { value: { base: "{colors.whiteAlpha10Base}", _dark: "{colors.whiteAlpha10Base}" } },
        hoverBg: { value: { base: "{colors.whiteAlpha10Base}", _dark: "{colors.whiteAlpha10Base}" } },
        activeBg: { value: { base: "{colors.whiteAlpha10Base}", _dark: "{colors.whiteAlpha10Base}" } }
      }
    },

    // ContentBox und NotchedBox
    card: {
      background: { value: { base: "{colors.contentBgBase}", _dark: "{colors.contentBgBase}" } },
      backgroundDark: { value: { base: "{colors.contentBoxDarkBgBase}", _dark: "{colors.contentBoxDarkBgBase}" } },
      backgroundLight: { value: { base: "{colors.contentBoxLightBgBase}", _dark: "{colors.contentBoxLightBgBase}" } },
      textColor: { value: { base: "{colors.dark.900}", _dark: "{colors.dark.900}" } },
      mutedTextColor: { value: { base: "{colors.gray.600}", _dark: "{colors.gray.600}" } }
    },

    // Dashboard
    page: {
      background: { value: { base: "{colors.dashboardBgBase}", _dark: "{colors.dashboardBgBase}" } }
    },

    // Login
    login: {
      card: {
        background: { value: { base: "{colors.loginCardBgBase}", _dark: "{colors.loginCardBgBase}" } },
        border: { value: { base: "{colors.loginBorderColorBase}", _dark: "{colors.loginBorderColorBase}" } },
        glassGradient: { value: { base: "{colors.loginGlassGradientBase}", _dark: "{colors.loginGlassGradientBase}" } }
      },
      header: {
        background: { value: { base: "{colors.loginHeaderBgBase}", _dark: "{colors.loginHeaderBgBase}" } }
      },
      botPreview: {
        background: { value: { base: "{colors.loginBotPreviewBgBase}", _dark: "{colors.loginBotPreviewBgBase}" } },
        gradient: { value: { base: "{colors.loginBotPreviewGradientBase}", _dark: "{colors.loginBotPreviewGradientBase}" } },
        shadow: { value: { base: "{colors.loginBotPreviewShadowBase}", _dark: "{colors.loginBotPreviewShadowBase}" } },
        iconGradient: { value: { base: "linear-gradient(to-br, {colors.loginBotIconGradientStartBase}, {colors.loginBotIconGradientEndBase})", _dark: "linear-gradient(to-br, {colors.loginBotIconGradientStartBase}, {colors.loginBotIconGradientEndBase})" } }
      },
      error: {
        background: { value: { base: "{colors.loginErrorBgBase}", _dark: "{colors.loginErrorBgBase}" } },
        borderColor: { value: { base: "{colors.loginErrorBorderColorBase}", _dark: "{colors.loginErrorBorderColorBase}" } }
      }
    },

    // Dashboard Layout
    dashboardLayout: {
      elevatedBackground: { value: { base: "{colors.dashboardLayoutElevatedBgBase}", _dark: "{colors.dashboardLayoutElevatedBgBase}" } },
      borderColor: { value: { base: "{colors.dashboardLayoutBorderColorBase}", _dark: "{colors.dashboardLayoutBorderColorBase}" } }
    },

    // Backgrounds
    backgrounds: {
      main: { value: { base: "{colors.backgroundsMainBase}", _dark: "{colors.backgroundsMainBase}" } },
      gradient1: { value: { base: "{colors.backgroundsGradient1Base}", _dark: "{colors.backgroundsGradient1Base}" } },
      gradient2: { value: { base: "{colors.backgroundsGradient2Base}", _dark: "{colors.backgroundsGradient2Base}" } },
      gradient3: { value: { base: "{colors.backgroundsGradient3Base}", _dark: "{colors.backgroundsGradient3Base}" } },
      gradient4: { value: { base: "{colors.backgroundsGradient4Base}", _dark: "{colors.backgroundsGradient4Base}" } }
    },

    // Table Tokens
    table: {
      // Normale Zustände
      rowBg: { value: { base: "{colors.tableRowLightBase}", _dark: "{colors.tableRowDarkBase}" } },
      rowBorderColor: { value: { base: "{colors.tableRowBorderLightBase}", _dark: "{colors.tableRowBorderDarkBase}" } },
      rowTextColor: { value: { base: "{colors.blackBase}", _dark: "{colors.whiteBase}" } }, // Explizite Textfarbe für Zeilen
      iconColor: { value: { base: "{colors.tableIconLightBase}", _dark: "{colors.tableIconDarkBase}" } },
      labelColor: { value: { base: "{colors.tableLabelLightBase}", _dark: "{colors.tableLabelDarkBase}" } },
      contentColor: { value: { base: "{colors.tableContentLightBase}", _dark: "{colors.tableContentDarkBase}" } },

      // Hover-Zustände
      rowHoverBg: { value: { base: "{colors.tableRowHoverBgBase}", _dark: "{colors.tableRowHoverBgDarkBase}" } },
      rowHoverTextColor: { value: { base: "{colors.tableRowHoverTextBase}", _dark: "{colors.tableRowHoverTextDarkBase}" } },
      labelHoverColor: { value: { base: "{colors.tableLabelHoverBase}", _dark: "{colors.tableLabelHoverDarkBase}" } },
      iconHoverColor: { value: { base: "{colors.tableIconHoverBase}", _dark: "{colors.tableIconHoverDarkBase}" } },
      rowHoverIconColor: { value: { base: "{colors.tableRowHoverIconBase}", _dark: "{colors.tableRowHoverIconDarkBase}" } },

      // Aktive Zustände
      rowActiveColor: { value: { base: "{colors.tableRowActiveBgBase}", _dark: "{colors.tableRowActiveBgDarkBase}" } },
      rowActiveBorderColor: { value: { base: "{colors.tableRowActiveBorderBase}", _dark: "{colors.tableRowActiveBorderDarkBase}" } },
      rowActiveTextColor: { value: { base: "{colors.tableRowActiveTextBase}", _dark: "{colors.tableRowActiveTextDarkBase}" } },

      // Schriftgrößen und -gewichte
      labelFontSize: { value: { base: "{colors.tableLabelFontSizeBase}", _dark: "{colors.tableLabelFontSizeBase}" } },
      labelFontWeight: { value: { base: "{colors.tableLabelFontWeightBase}", _dark: "{colors.tableLabelFontWeightBase}" } },
      contentFontSize: { value: { base: "{colors.tableContentFontSizeBase}", _dark: "{colors.tableContentFontSizeBase}" } },
      contentFontWeight: { value: { base: "{colors.tableContentFontWeightBase}", _dark: "{colors.tableContentFontWeightBase}" } }
    },

    // Scrollbar Tokens
    scrollbar: {
      thumb: {
        bg: { value: { base: "{colors.scrollbarThumbBgBase}", _dark: "{colors.scrollbarThumbBgBase}" } },
        hoverBg: { value: { base: "{colors.scrollbarThumbHoverBgBase}", _dark: "{colors.scrollbarThumbHoverBgBase}" } }
      }
    },

    // Status Tokens
    status: {
      success: { value: { base: "{colors.green.500}", _dark: "{colors.green.500}" } },
      error: { value: { base: "{colors.red.500}", _dark: "{colors.red.500}" } }
    },

    // Zone Tokens
    zone: {
      pointsText: { value: { base: "{colors.navActiveGreenBase}", _dark: "{colors.navActiveGreenBase}" } }
    },

    // Menu Tokens
    menu: {
      item: {
        dangerHoverBg: { value: { base: "{colors.redAlpha10Base}", _dark: "{colors.redAlpha10Base}" } },
        dangerHoverColor: { value: { base: "{colors.red.300}", _dark: "{colors.red.300}" } },
        hoverBg: { value: { base: "{colors.whiteAlpha10Base}", _dark: "{colors.whiteAlpha10Base}" } }
      }
    },

    // Popover Tokens
    popover: {
      bg: { value: { base: "{colors.dark.900}", _dark: "{colors.dark.900}" } }
    }
  },

  // Schatten
  shadows: {
    card: { value: { base: "{colors.cardShadowBase}", _dark: "{colors.cardShadowBase}" } },
    cardHover: { value: { base: "{colors.cardHoverShadowBase}", _dark: "{colors.cardHoverShadowBase}" } },
    elevated: { value: { base: "{colors.shadowElevatedBase}", _dark: "{colors.shadowElevatedBase}" } },
    inset: { value: { base: "{colors.shadowInsetBase}", _dark: "{colors.shadowInsetBase}" } },
    loginCard: { value: { base: "{colors.shadowLoginCardBase}", _dark: "{colors.shadowLoginCardBase}" } },
    overlay: { value: { base: "{colors.shadowOverlayBase}", _dark: "{colors.shadowOverlayBase}" } }
  }
});

// Definiere Schriftarten
const fonts = {
  body: { value: "'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  heading: { value: "'Lufga', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
  mono: { value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" },
};

const config = defineConfig({
  theme: {
    keyframes,
    tokens: {
      colors,
      fonts,
      animations,
    },
    semanticTokens,
  },
});

export const system = createSystem(defaultConfig, config); // default verwenden, um Basiskomponenten nicht zu verlieren

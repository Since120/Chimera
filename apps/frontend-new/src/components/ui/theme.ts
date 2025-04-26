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

  // Farben für TopNav - Umbenannte Basis-Tokens
  navBgBase: { value: "#FFFFFF" },
  navActiveGreenBase: { value: "#90FF00" },
  navIconCircleBgBase: { value: "#1E293A" },
  navIconColorBase: { value: "#BAC5D5" },
  navIconBorderColorBase: { value: "rgba(186, 197, 213, 0.6)" }, // Abgeschwächte Rahmenfarbe
  navIconOutlineColorBase: { value: "rgba(186, 197, 213, 0.3)" }, // Noch subtilere Rahmenfarbe für Outline-Buttons

  // Filter-Komponenten
  filter: {
    bg: { value: "#151A26" },
    hoverBg: { value: "#1D2433" },
    activeBg: { value: "#232A3D" },
    iconCircleBg: { value: "#1E2536" }
  },

  // NotchedBox-Komponente
  notchButton: {
    activeBg: { value: "#90FF00" }, // Gleich wie navActiveGreenBase
    inactiveBg: { value: "#1E2536" }, // Gleich wie filter.iconCircleBg
    activeColor: { value: "black" },
    inactiveColor: { value: "white" },
    badgeBgActive: { value: "rgba(0,0,0,0.2)" },
    badgeColorActive: { value: "black" },
    badgeBgInactive: { value: "gray.700" },
    badgeColorInactive: { value: "gray.300" },
    dotColor: { value: "black" }
  },

  // ContentBox-Komponente
  contentBox: {
    darkBg: { value: "#151A26" },
    lightBg: { value: "white" }
  },

  // Dashboard-Hintergrund
  dashboardBg: { value: "#0c111b" },
  contentBg: { value: "white" },

  // Login-Seite
  login: {
    cardBg: { value: "#0c111b" },
    headerBg: { value: "#0f1523" },
    botPreviewBg: { value: "#0f1523" },
    botIconGradientStart: { value: "#0c111b" },
    botIconGradientEnd: { value: "#0f1523" },
    borderColor: { value: "rgba(255, 255, 255, 0.08)" },
    glassGradient: { value: "linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent, rgba(255, 255, 255, 0.05))" },
    botPreviewGradient: { value: "linear-gradient(135deg, transparent 0%, rgba(15, 21, 35, 0.2) 50%, transparent 100%)" },
    botPreviewShadow: { value: "inset 0 0 20px rgba(144, 255, 0, 0.05)" },
    errorBg: { value: "rgba(254, 178, 178, 0.16)" },
    errorBorderColor: { value: "red.500" }
  },

  // Dashboard Layout
  dashboardLayout: {
    elevatedBg: { value: "rgba(16, 23, 34, 0.98)" },
    borderColor: { value: "#0c111b" }
  },

  // Backgrounds
  backgrounds: {
    main: { value: "#111822" },
    mainGradients: {
      gradient1: { value: "rgba(27, 37, 52, 0.7)" },
      gradient2: { value: "rgba(39, 55, 77, 0.6)" },
      gradient3: { value: "rgba(33, 45, 65, 0.5)" },
      gradient4: { value: "rgba(27, 37, 52, 0.6)" }
    }
  },

  // Shadows
  shadows: {
    elevated: { value: "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3)" },
    inset: { value: "inset 0 0 15px rgba(0,0,0,0.2)" },
    loginCard: { value: "0 30px 60px -10px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.4)" },
    overlay: { value: "rgba(0,0,0,0.3)" }
  }
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

    // Navigation Tokens mit korrekten Referenzen auf umbenannte Basis-Tokens
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
        bg: { value: { base: "{colors.filter.bg}", _dark: "{colors.filter.bg}" } },
        hoverBg: { value: { base: "{colors.filter.hoverBg}", _dark: "{colors.filter.hoverBg}" } },
        activeBg: { value: { base: "{colors.filter.activeBg}", _dark: "{colors.filter.activeBg}" } },
        iconCircleBg: { value: { base: "{colors.filter.iconCircleBg}", _dark: "{colors.filter.iconCircleBg}" } },
        iconColor: { value: { base: "white", _dark: "white" } },
        textColor: { value: { base: "{colors.gray.300}", _dark: "{colors.gray.300}" } }
      },
      notch: {
        activeBg: { value: { base: "{colors.notchButton.activeBg}", _dark: "{colors.notchButton.activeBg}" } },
        inactiveBg: { value: { base: "{colors.notchButton.inactiveBg}", _dark: "{colors.notchButton.inactiveBg}" } },
        activeColor: { value: { base: "{colors.notchButton.activeColor}", _dark: "{colors.notchButton.activeColor}" } },
        inactiveColor: { value: { base: "{colors.notchButton.inactiveColor}", _dark: "{colors.notchButton.inactiveColor}" } },
        badgeBgActive: { value: { base: "{colors.notchButton.badgeBgActive}", _dark: "{colors.notchButton.badgeBgActive}" } },
        badgeColorActive: { value: { base: "{colors.notchButton.badgeColorActive}", _dark: "{colors.notchButton.badgeColorActive}" } },
        badgeBgInactive: { value: { base: "{colors.notchButton.badgeBgInactive}", _dark: "{colors.notchButton.badgeBgInactive}" } },
        badgeColorInactive: { value: { base: "{colors.notchButton.badgeColorInactive}", _dark: "{colors.notchButton.badgeColorInactive}" } },
        dotColor: { value: { base: "{colors.notchButton.dotColor}", _dark: "{colors.notchButton.dotColor}" } }
      }
    },

    // ContentBox und NotchedBox
    card: {
      background: { value: { base: "{colors.contentBg}", _dark: "{colors.contentBg}" } },
      backgroundDark: { value: { base: "{colors.contentBox.darkBg}", _dark: "{colors.contentBox.darkBg}" } },
      backgroundLight: { value: { base: "{colors.contentBox.lightBg}", _dark: "{colors.contentBox.lightBg}" } },
      textColor: { value: { base: "{colors.dark.900}", _dark: "{colors.dark.900}" } },
      mutedTextColor: { value: { base: "{colors.gray.600}", _dark: "{colors.gray.600}" } }
    },

    // Dashboard
    page: {
      background: { value: { base: "{colors.dashboardBg}", _dark: "{colors.dashboardBg}" } }
    },

    // Login
    login: {
      card: {
        background: { value: { base: "{colors.login.cardBg}", _dark: "{colors.login.cardBg}" } },
        border: { value: { base: "{colors.login.borderColor}", _dark: "{colors.login.borderColor}" } },
        glassGradient: { value: { base: "{colors.login.glassGradient}", _dark: "{colors.login.glassGradient}" } }
      },
      header: {
        background: { value: { base: "{colors.login.headerBg}", _dark: "{colors.login.headerBg}" } }
      },
      botPreview: {
        background: { value: { base: "{colors.login.botPreviewBg}", _dark: "{colors.login.botPreviewBg}" } },
        gradient: { value: { base: "{colors.login.botPreviewGradient}", _dark: "{colors.login.botPreviewGradient}" } },
        shadow: { value: { base: "{colors.login.botPreviewShadow}", _dark: "{colors.login.botPreviewShadow}" } },
        iconGradient: { value: { base: "linear-gradient(to-br, {colors.login.botIconGradientStart}, {colors.login.botIconGradientEnd})", _dark: "linear-gradient(to-br, {colors.login.botIconGradientStart}, {colors.login.botIconGradientEnd})" } }
      },
      error: {
        background: { value: { base: "{colors.login.errorBg}", _dark: "{colors.login.errorBg}" } },
        borderColor: { value: { base: "{colors.login.errorBorderColor}", _dark: "{colors.login.errorBorderColor}" } }
      }
    },

    // Dashboard Layout
    dashboardLayout: {
      elevatedBackground: { value: { base: "{colors.dashboardLayout.elevatedBg}", _dark: "{colors.dashboardLayout.elevatedBg}" } },
      borderColor: { value: { base: "{colors.dashboardLayout.borderColor}", _dark: "{colors.dashboardLayout.borderColor}" } }
    },

    // Backgrounds
    backgrounds: {
      main: { value: { base: "{colors.backgrounds.main}", _dark: "{colors.backgrounds.main}" } },
      gradient1: { value: { base: "{colors.backgrounds.mainGradients.gradient1}", _dark: "{colors.backgrounds.mainGradients.gradient1}" } },
      gradient2: { value: { base: "{colors.backgrounds.mainGradients.gradient2}", _dark: "{colors.backgrounds.mainGradients.gradient2}" } },
      gradient3: { value: { base: "{colors.backgrounds.mainGradients.gradient3}", _dark: "{colors.backgrounds.mainGradients.gradient3}" } },
      gradient4: { value: { base: "{colors.backgrounds.mainGradients.gradient4}", _dark: "{colors.backgrounds.mainGradients.gradient4}" } }
    }
  },

  // Schatten
  shadows: {
    card: { value: { base: "0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)", _dark: "0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)" } },
    cardHover: { value: { base: "0 15px 35px -6px rgba(0,0,0,0.4), 0 10px 15px -8px rgba(0,0,0,0.3)", _dark: "0 15px 35px -6px rgba(0,0,0,0.4), 0 10px 15px -8px rgba(0,0,0,0.3)" } },
    elevated: { value: { base: "{colors.shadows.elevated}", _dark: "{colors.shadows.elevated}" } },
    inset: { value: { base: "{colors.shadows.inset}", _dark: "{colors.shadows.inset}" } },
    loginCard: { value: { base: "{colors.shadows.loginCard}", _dark: "{colors.shadows.loginCard}" } },
    overlay: { value: { base: "{colors.shadows.overlay}", _dark: "{colors.shadows.overlay}" } }
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

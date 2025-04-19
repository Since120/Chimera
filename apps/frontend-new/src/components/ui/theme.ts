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
  navIconOutlineColorBase: { value: "rgba(186, 197, 213, 0.3)" } // Noch subtilere Rahmenfarbe für Outline-Buttons
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
    }
  },
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

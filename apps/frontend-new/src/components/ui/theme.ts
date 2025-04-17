// apps/frontend-new/src/components/ui/theme.ts
import { createSystem, defaultConfig, defineConfig, defineSemanticTokens } from "@chakra-ui/react";

// Farbdefinitionen - KORRIGIERTE Struktur mit value-Objekten
const colors = {
  brand: {
    DEFAULT: { value: "#39E580" },
    50: { value: "#E1FCEF" },
    100: { value: "#C6F7DE" },
    200: { value: "#A3F0CC" },
    300: { value: "#7BEAAB" },
    400: { value: "#52E38C" },
    500: { value: "#39E580" },
    600: { value: "#25D96A" },
    700: { value: "#1BB755" },
    800: { value: "#139342" },
    900: { value: "#0B6129" },
    950: { value: "#063C1A" },
  },
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
  navIconBorderColorBase: { value: "rgba(186, 197, 213, 0.6)" } // Abgeschwächte Rahmenfarbe
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
    // Brand-Farbe
    brand: {
      solid: { value: "{colors.brand.500}" },
      contrast: { value: "white" },
      fg: { value: "{colors.brand.600}" },
    },
    // Navigation Tokens mit korrekten Referenzen auf umbenannte Basis-Tokens
    nav: {
      bg: { value: { base: "{colors.navBgBase}", _dark: "{colors.navBgBase}" } }, // Weiß bleibt weiß
      activeGreen: { value: { base: "{colors.navActiveGreenBase}", _dark: "{colors.navActiveGreenBase}" } },
      iconCircleBg: { value: { base: "{colors.navIconCircleBgBase}", _dark: "{colors.navIconCircleBgBase}" } },
      iconColor: { value: { base: "{colors.navIconColorBase}", _dark: "{colors.navIconColorBase}" } },
      iconBorderColor: { value: { base: "{colors.navIconBorderColorBase}", _dark: "{colors.navIconBorderColorBase}" } }
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
    tokens: {
      colors,
      fonts,
    },
    semanticTokens,
  },
});

export const system = createSystem(defaultConfig, config); // default verwenden, um Basiskomponenten nicht zu verlieren

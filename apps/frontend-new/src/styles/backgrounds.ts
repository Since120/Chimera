// apps/frontend-new/src/styles/backgrounds.ts
// Zentrale Definition von Hintergrundstilen für die gesamte Anwendung

/**
 * Haupthintergrund für das Dashboard und die Login-Seite
 * Dunkler Hintergrund mit radialen Gradienten für einen modernen Look
 */
export const mainGradientBackground = {
  backgroundColor: "#111822", // Dunkles Blau-Grau als Basis
  backgroundImage: `
    radial-gradient(ellipse 40% 30% at 50% 0%, rgba(27, 37, 52, 0.7) 0%, transparent 90%),
    radial-gradient(ellipse 30% 25% at 15% 15%, rgba(39, 55, 77, 0.6) 0%, transparent 80%),
    radial-gradient(ellipse 45% 35% at 50% 60%, rgba(33, 45, 65, 0.5) 0%, transparent 85%),
    radial-gradient(ellipse 50% 40% at 70% 75%, rgba(27, 37, 52, 0.6) 0%, transparent 85%)
  `
};

/**
 * Alternative Hintergrundvariante mit stärkeren Gradienten
 * Kann für spezielle Bereiche verwendet werden
 */
export const accentGradientBackground = {
  backgroundColor: "#111822",
  backgroundImage: `
    radial-gradient(ellipse 40% 30% at 50% 0%, rgba(27, 37, 52, 0.9) 0%, transparent 90%),
    radial-gradient(ellipse 30% 25% at 15% 15%, rgba(39, 55, 77, 0.8) 0%, transparent 80%),
    radial-gradient(ellipse 45% 35% at 50% 60%, rgba(33, 45, 65, 0.7) 0%, transparent 85%),
    radial-gradient(ellipse 50% 40% at 70% 75%, rgba(27, 37, 52, 0.8) 0%, transparent 85%)
  `
};

// apps/dashboard/src/components/dashboard/category-management/index.ts

// Exportiere die Hauptkomponente
export { default as CategoryManagement } from './CategoryManagement';

// Exportiere Hilfsfunktionen für externe Verwendung
export * from './utils/formatters';

// Exportiere Typen zur Verwendung in anderen Komponenten
export * from './hooks/useCategories';
export { useZones } from './hooks/useZones';
export type { ZoneInput } from './hooks/useZones';
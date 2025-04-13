// apps/dashboard/src/components/dashboard/category-management/utils/formatters.ts

/**
 * Formatiert Minuten in ein lesbares Format (zB. "2h 30m")
 */
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

/**
 * Formatiert einen Zeitpunkt im Format DD.MM.YYYY
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '-';
  
  // Falls es bereits ein formatiertes Datum ist, gib es zurück
  if (typeof date === 'string' && date.includes('.')) {
    return date;
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};
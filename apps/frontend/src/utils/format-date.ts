/**
 * Formatiert ein Datum in ein lesbares Format
 * @param dateString Das zu formatierende Datum als String
 * @returns Das formatierte Datum
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Überprüfen, ob das Datum gültig ist
  if (isNaN(date.getTime())) return '-';
  
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

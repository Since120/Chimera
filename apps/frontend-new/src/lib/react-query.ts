import { QueryClient } from '@tanstack/react-query';

// Konfiguration für den Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Standard-Caching-Zeiten (Beispiele, können angepasst werden)
      staleTime: 1000 * 60 * 5, // 5 Minuten: Daten gelten als "frisch"
      gcTime: 1000 * 60 * 30, // 30 Minuten: Daten werden aus dem Cache entfernt, wenn inaktiv
      refetchOnWindowFocus: true, // Daten neu laden, wenn Fenster Fokus erhält (gut für Aktualität)
      refetchOnReconnect: true, // Daten neu laden bei Netzwerk-Wiederverbindung
      retry: 1, // Anzahl der Wiederholungsversuche bei fehlgeschlagenen Queries
    },
    mutations: {
      // Standard-Optionen für Mutations (optional)
      retry: 0, // Mutations standardmäßig nicht wiederholen
    },
  },
});

'use client';

// Importiere den Helper für Client-Komponenten
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Hardcoded Werte als Fallback (nur für Entwicklung) - BEIBEHALTEN
const FALLBACK_SUPABASE_URL = 'https://sntjwhlryzozusnpaglx.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudGp3aGxyeXpvenVzbnBhZ2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNTg0MTYsImV4cCI6MjA1OTkzNDQxNn0.j7A8N8XtRmNUEcBUtssZ7mfoa0Npee-rohpFDweK43o';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase-Anmeldedaten wurden nicht gefunden');
  throw new Error('Supabase URL und Anon Key konnten nicht geladen werden');
}

// Verwende createClientComponentClient für das Frontend
// Erstelle nur eine Instanz, um sicherzustellen, dass alle Komponenten dieselbe verwenden.
export const supabase = createClientComponentClient({
  // Die Optionen werden normalerweise automatisch vom Helper gesetzt.
  // Wir verlassen uns auf die Standardkonfiguration der Auth Helpers für Cookies.
});

console.log('Supabase Client (Component Helper) initialisiert mit URL:', supabaseUrl);

// Hilfreiche Debug-Funktion um den Status anzuzeigen
export const getRealtimeStatus = () => {
  try {
    // Angepasst für createClientComponentClient
    // Prüfe, ob die Methode existiert
    if (typeof supabase.getChannels === 'function') {
      const channels = supabase.getChannels();
      const activeChannels = channels.map(channel => ({
        topic: channel.topic,
        state: channel.state
      }));

      console.log('Active Supabase channels:', activeChannels);

      return {
        activeChannelsCount: channels.length,
        channels: activeChannels,
        status: channels.length > 0 ? 'Realtime ist eingerichtet' : 'Keine aktiven Channels'
      };
    } else {
      console.log('getChannels-Methode nicht verfügbar im ClientComponentClient');
      return {
        status: 'Realtime-Status kann nicht abgerufen werden mit ClientComponentClient',
        info: 'Dies ist normal, da der ClientComponentClient eine vereinfachte API hat.'
      };
    }
  } catch (e) {
    console.error('Fehler beim Abrufen des Realtime-Status:', e);
    return {
      error: 'Fehler beim Abrufen des Realtime-Status',
      details: e instanceof Error ? e.message : String(e)
    };
  }
};

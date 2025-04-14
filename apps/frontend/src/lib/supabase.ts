'use client';

import { createClient } from '@supabase/supabase-js';

// Diese Werte sollten in Umgebungsvariablen gespeichert werden
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase-Anmeldedaten wurden nicht in den Umgebungsvariablen gefunden');
}

// Supabase-Client mit optimierten Realtime-Optionen erstellen
export const supabase = createClient(supabaseUrl, supabaseKey, {
   auth: {
     autoRefreshToken: true,
     persistSession: true,
     detectSessionInUrl: true,
     flowType: 'pkce',
   },
   global: {
     headers: {
       'x-client-info': 'chimera-frontend',
     },
   },
   realtime: {
     timeout: 180000, // 180 Sekunden Timeout für langsame Verbindungen
     params: {
       eventsPerSecond: 10, // Optimierter Wert für Ereignisraten
     }
   },
});

// Hilfreiche Debug-Funktion um den Status anzuzeigen
export const getRealtimeStatus = () => {
  try {
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
  } catch (e) {
    console.error('Fehler beim Abrufen des Realtime-Status:', e);
    return {
      error: 'Fehler beim Abrufen des Realtime-Status',
      details: e instanceof Error ? e.message : String(e)
    };
  }
};

// Funktion zum Testen der Realtime-Verbindung
export const testRealtimeConnection = async () => {
  try {
    const channel = supabase.channel('realtime-test');
    
    // Ereignis für Verbindungstest
    channel.on('broadcast', { event: 'test' }, (payload) => {
      console.log('Realtime test event received:', payload);
    });
    
    const subscription = await channel.subscribe((status) => {
      console.log('Realtime connection test status:', status);
    });
    
    // Test-Nachricht senden
    if (status === 'SUBSCRIBED') {
      channel.send({
        type: 'broadcast',
        event: 'test',
        payload: { message: 'Realtime connection test', timestamp: new Date().toISOString() }
      });
      
      // Automatische Bereinigung nach dem Test
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 5000);
      
      return { success: true, message: 'Realtime test channel created successfully' };
    } else {
      return { success: false, message: `Failed to subscribe: ${subscription}` };
    }
  } catch (e) {
    console.error('Error testing Realtime connection:', e);
    return { 
      success: false, 
      error: 'Error testing Realtime connection',
      details: e instanceof Error ? e.message : String(e)
    };
  }
};

console.log('Supabase-Client initialisiert mit URL:', supabaseUrl);
console.log('Supabase Realtime Konfiguration ist aktiv mit Debug-Modus');


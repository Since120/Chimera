'use client';

import { createClient } from '@supabase/supabase-js';

// Diese Werte sollten in Umgebungsvariablen gespeichert werden
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase-Anmeldedaten wurden nicht in den Umgebungsvariablen gefunden');
}

// Supabase-Client mit Standard-Auth-Optionen erstellen
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

});

// Hinweis: Die Redirect-URL für OAuth wird in der Supabase-Konfiguration festgelegt
// und muss mit der URL in der Discord-Developer-Portal-Konfiguration übereinstimmen

console.log('Supabase-Client initialisiert mit URL:', supabaseUrl);


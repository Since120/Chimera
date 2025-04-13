'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { GuildProvider } from '@/context/guild-context';
import { SettingsProvider } from '@/components/core/settings/settings-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Test der Backend-API-Verbindung beim Laden
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Teste Backend-API-Verbindung...');
        console.log('API-URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Backend-API nicht erreichbar:', response.status, response.statusText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        console.log('Backend-API-Verbindung erfolgreich');
      } catch (error) {
        console.error('Backend-API-Verbindungstest fehlgeschlagen:', error);
      }
    };

    testConnection();
  }, []);

  // Standardeinstellungen
  const defaultSettings = {
    colorScheme: 'light',
    primaryColor: '#3f51b5',
    secondaryColor: '#f50057',
    language: 'de',
  };

  return (
    <SettingsProvider settings={defaultSettings}>
      <AuthProvider>
        <GuildProvider>
          {children}
        </GuildProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
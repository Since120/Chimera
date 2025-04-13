'use client';

import type * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Guild-Layout
 * Geschützt durch AuthGuard, die sicherstellt, dass nur authentifizierte Benutzer Zugriff haben
 * Erfordert keine Guild-Auswahl, da diese Seiten für die Guild-Auswahl verwendet werden
 */
export default function Layout(props: LayoutProps): React.JSX.Element {
  const { loading } = useAuth();

  // Während des Ladens Ladebildschirm anzeigen
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg">Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard requireGuild={false}>
      {props.children}
    </AuthGuard>
  );
}

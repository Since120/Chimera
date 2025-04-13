'use client';

import type * as React from 'react';
import { dashboardConfig } from '@/config/dashboard';
import { useSettings } from '@/components/core/settings/settings-context';
import { useAuth } from '@/context/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { HorizontalLayout } from '@/components/dashboard/layout/horizontal/horizontal-layout';
import { VerticalLayout } from '@/components/dashboard/layout/vertical/vertical-layout';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard-Layout
 * Geschützt durch AuthGuard, die sicherstellt, dass nur authentifizierte Benutzer Zugriff haben
 */
export default function Layout(props: LayoutProps): React.JSX.Element {
  const { settings } = useSettings();
  const { user, loading } = useAuth();

  // Während des Ladens Ladebildschirm anzeigen
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  // Layout-Typ aus den Einstellungen oder der Standardkonfiguration
  const layout = settings.dashboardLayout ?? dashboardConfig.layout;

  return (
    <AuthGuard>
      {layout === 'horizontal' ? (
        <HorizontalLayout>{props.children}</HorizontalLayout>
      ) : (
        <VerticalLayout>{props.children}</VerticalLayout>
      )}
    </AuthGuard>
  );
}
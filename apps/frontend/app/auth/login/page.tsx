'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
// import { SplitLayout } from '@/components/dashboard/auth/split-layout'; // Removed import
// Nicht mehr benötigte Imports entfernt
import { LoginErrorDisplay } from "@/components/dashboard/auth/login-error-display"; // Import the new component

/**
 * Login Page using SplitLayout.
 */
export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Try getting redirectedFrom, but default to /dashboard
      // Note: useSearchParams needs Suspense, handled in LoginErrorDisplay now
      const searchParams = new URLSearchParams(window.location.search);
      const redirectedFrom = searchParams.get('redirectedFrom') || '/dashboard';
      console.log(`Login Page: Already authenticated, redirecting to ${redirectedFrom}`);
      router.replace(redirectedFrom);
    }
  }, [loading, isAuthenticated, router]);

  // Kein Spinner mehr anzeigen, stattdessen einfach nichts rendern
  if (loading) {
    return null;
  }

  // If not loading and not authenticated, render the error display.
  // The SplitLayout is provided by the parent auth/layout.tsx
  return (
    <>
      {/* Error display is now handled by this component */}
      <LoginErrorDisplay />
      {/* The actual login button is rendered by the parent SplitLayout */}
      {/* We don't need to render anything else here */}
    </>
  );
}
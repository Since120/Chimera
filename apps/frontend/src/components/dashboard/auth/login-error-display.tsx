'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@mui/material';

function ErrorDisplay() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  if (!errorParam) {
    return null;
  }

  let errorMessage = 'Unbekannter Anmeldefehler.';
  if (errorParam === 'session_invalid') {
    errorMessage = 'Ihre Sitzung ist ungültig oder abgelaufen. Bitte erneut anmelden.';
  } else if (errorParam === 'callback_failed') {
    errorMessage = 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
  } else if (errorParam === 'token_generation_failed') {
    errorMessage = 'Fehler bei der Token-Erstellung. Bitte versuchen Sie es erneut.';
  } else if (errorParam === 'internal_server_error') {
    errorMessage = 'Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
  } else if (errorParam === 'auth_failed') {
    errorMessage = 'Authentifizierung fehlgeschlagen.';
  }

  return (
    <Alert severity="error" sx={{ mb: 2, width: '100%', justifyContent: 'center' }}>
      {errorMessage}
    </Alert>
  );
}

// Wrap with Suspense because useSearchParams is used
export function LoginErrorDisplay() {
    return (
        <Suspense fallback={null}> {/* No fallback needed for just an error message */}
            <ErrorDisplay />
        </Suspense>
    );
}
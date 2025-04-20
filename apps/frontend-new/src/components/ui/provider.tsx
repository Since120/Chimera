"use client"

import { useState, useEffect } from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { QueryClientProvider } from "@tanstack/react-query" // Hinzufügen
import { ReactQueryDevtools } from "@tanstack/react-query-devtools" // Hinzufügen
import { system } from "./theme" // Unser System importieren
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { AuthProvider } from "@/context/auth-context"
import { queryClient } from "@/lib/react-query" // Hinzufügen

export function Provider(props: ColorModeProviderProps) {
  // Verwende einen State, um zu verfolgen, ob wir auf dem Client sind
  const [isMounted, setIsMounted] = useState(false);

  // Setze isMounted auf true, sobald die Komponente auf dem Client gemountet ist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Wenn nicht gemountet, gib ein leeres Fragment zurück, um Hydration-Fehler zu vermeiden
  if (!isMounted) {
    return null;
  }

  // Wenn gemountet, rendere die Provider
  return (
    <QueryClientProvider client={queryClient}> {/* QueryClientProvider als äußersten Client-seitigen Provider */}
      <ChakraProvider value={system}> {/* Unser System verwenden */}
        <AuthProvider>
          <ColorModeProvider {...props} />
          {/* React Query DevTools (nur in Entwicklung sichtbar) */}
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

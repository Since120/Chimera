"use client"

import { useState, useEffect } from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { system } from "./theme" // Unser System importieren
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { AuthProvider } from "@/context/auth-context"

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
    <ChakraProvider value={system}> {/* Unser System verwenden */}
      <AuthProvider>
        <ColorModeProvider {...props} />
      </AuthProvider>
    </ChakraProvider>
  )
}

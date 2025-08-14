'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * App-wide theme provider.
 * - Uses Tailwind `dark` class on <html> (attribute="class")
 * - Defaults to system preference on first load
 * - Persists choice in localStorage
 * - Disables transition flashes during theme changes
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}

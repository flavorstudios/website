"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add error boundary
  try {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  } catch (error) {
    console.error("Theme provider error:", error)
    // Fallback to just rendering children without theme provider
    return <>{children}</>
  }
}

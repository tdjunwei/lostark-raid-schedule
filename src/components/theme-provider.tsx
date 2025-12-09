"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, type Attribute } from "next-themes"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: Attribute | Attribute[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children, 
  attribute = "class",
  defaultTheme = "light", // Start with light theme explicitly
  enableSystem = false, // Disable system initially to avoid conflicts
  disableTransitionOnChange = true,
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey="lost-ark-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
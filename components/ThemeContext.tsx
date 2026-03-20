"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface ThemeContextType {
  scrollY: number
  setScrollY: (y: number) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0)

  return (
    <ThemeContext.Provider value={{ scrollY, setScrollY }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
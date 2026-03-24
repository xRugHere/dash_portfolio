"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

export type BackgroundId = 'space' | 'earth'

interface ThemeContextType {
  scrollY: number
  setScrollY: (y: number) => void
  /** 0 = normal, 1 = fully warped forward through space */
  warpZ: number
  setWarpZ: (z: number) => void
  /** Which background scene is currently active */
  activeBackground: BackgroundId
  setActiveBackground: (bg: BackgroundId) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0)
  const [warpZ, setWarpZ] = useState(1)
  const [activeBackground, setActiveBackground] = useState<BackgroundId>('space')

  return (
    <ThemeContext.Provider value={{ scrollY, setScrollY, warpZ, setWarpZ, activeBackground, setActiveBackground }}>
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
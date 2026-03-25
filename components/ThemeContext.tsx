"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
  /** Warp-transition to a different theme */
  switchTheme: (bg: BackgroundId) => void
  /** Whether a theme-transition is in progress */
  isTransitioning: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0)
  const [warpZ, setWarpZ] = useState(1)
  const [activeBackground, setActiveBackground] = useState<BackgroundId>('space')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const switchTheme = useCallback((bg: BackgroundId) => {
    if (bg === activeBackground || isTransitioning) return

    setIsTransitioning(true)

    // Phase 1: warp forward (exit current theme)
    const warpOutDuration = 600
    const startOut = performance.now()
    let rafId: number

    const tickOut = () => {
      const t = Math.min((performance.now() - startOut) / warpOutDuration, 1)
      setWarpZ(t * t) // ease-in: 0 → 1
      if (t < 1) {
        rafId = requestAnimationFrame(tickOut)
        return
      }

      // At peak warp: swap background, scroll to top
      setActiveBackground(bg)
      window.scrollTo(0, 0)

      // Phase 2: warp back (arrive on new theme)
      const warpInDuration = 1200
      const startIn = performance.now()

      const tickIn = () => {
        const t2 = Math.min((performance.now() - startIn) / warpInDuration, 1)
        const eased = 1 - Math.pow(1 - t2, 3) // ease-out
        setWarpZ(1 - eased) // 1 → 0
        if (t2 < 1) {
          rafId = requestAnimationFrame(tickIn)
        } else {
          setIsTransitioning(false)
        }
      }

      // Small delay so the DOM settles after swapping
      requestAnimationFrame(() => {
        rafId = requestAnimationFrame(tickIn)
      })
    }

    rafId = requestAnimationFrame(tickOut)

    return () => cancelAnimationFrame(rafId)
  }, [activeBackground, isTransitioning])

  return (
    <ThemeContext.Provider value={{
      scrollY, setScrollY,
      warpZ, setWarpZ,
      activeBackground, setActiveBackground,
      switchTheme, isTransitioning,
    }}>
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
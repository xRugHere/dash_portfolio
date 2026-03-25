"use client"

import { type ReactNode } from 'react'
import { useTheme, type BackgroundId } from './ThemeContext'

interface ThemePageProps {
  /** Which theme this container belongs to */
  theme: BackgroundId
  children: ReactNode
}

/**
 * Renders its children only when `activeBackground` matches `theme`.
 * Fades content to 0 during warp transitions.
 */
export default function ThemePage({ theme, children }: ThemePageProps) {
  const { activeBackground, isTransitioning } = useTheme()

  if (activeBackground !== theme) return null

  return (
    <div
      style={{
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}

"use client"

import { type ReactNode } from 'react'
import { useSection, type SectionId } from './SectionContext'

interface SectionPageProps {
  /** Which section this container belongs to */
  section: SectionId
  children: ReactNode
}

/**
 * Renders its children only when `activeSection` matches `section`.
 * Fades content out during transitions and back in after the swap.
 */
export default function SectionPage({ section, children }: SectionPageProps) {
  const { activeSection, isTransitioning } = useSection()

  if (activeSection !== section) return null

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

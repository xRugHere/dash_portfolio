"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type SectionId = string

interface SectionContextType {
  activeSection: SectionId
  isTransitioning: boolean
  switchSection: (section: SectionId) => void
}

const SectionContext = createContext<SectionContextType | undefined>(undefined)

export function SectionProvider({
  children,
  defaultSection = 'main',
}: {
  children: ReactNode
  defaultSection?: SectionId
}) {
  const [activeSection, setActiveSection] = useState<SectionId>(defaultSection)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const switchSection = useCallback(
    (section: SectionId) => {
      if (section === activeSection || isTransitioning) return

      setIsTransitioning(true)

      // Let the fade-out complete, then swap and fade back in
      setTimeout(() => {
        setActiveSection(section)
        window.scrollTo(0, 0)
        setIsTransitioning(false)
      }, 400)
    },
    [activeSection, isTransitioning],
  )

  return (
    <SectionContext.Provider value={{ activeSection, isTransitioning, switchSection }}>
      {children}
    </SectionContext.Provider>
  )
}

export function useSection() {
  const context = useContext(SectionContext)
  if (context === undefined) {
    throw new Error('useSection must be used within a SectionProvider')
  }
  return context
}

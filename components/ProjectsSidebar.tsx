"use client"

import { useState, useEffect } from 'react'
import localFont from 'next/font/local'

const lunarLocal = localFont({
  src: [
    {
      path: '../public/fonts/PixelFont.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
})

interface Section {
  id: string
  label: string
  isMainHeader: boolean
}

interface ProjectsSidebarProps {
  sections: Section[]
}

export default function ProjectsSidebar({ sections }: ProjectsSidebarProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [sidebarTop, setSidebarTop] = useState<number>(0)

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }

    const sectionVisibility = new Map<string, number>()

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        sectionVisibility.set(entry.target.id, entry.intersectionRatio)
      })

      // Find the section with the highest intersection ratio
      let maxRatio = 0
      let mostVisibleSection: string | null = null

      sectionVisibility.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio
          mostVisibleSection = id
        }
      })

      if (mostVisibleSection && maxRatio > 0) {
        setActiveSection(mostVisibleSection)
      }
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [sections])

  // Track scroll to calculate sidebar position dynamically
  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('projects-header')
      if (header) {
        const rect = header.getBoundingClientRect()
        const scrollY = window.scrollY
        const headerHeight = header.offsetHeight
        const headerTop = header.offsetTop
        const headerBottom = headerTop + headerHeight
        
        if (rect.bottom <= 70) { // Stick to a lower position when header is off screen
          setSidebarTop(120)
        } else {
          const sidebarPosition = rect.bottom + 48 // 16px margin below header
          setSidebarTop(sidebarPosition)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Dark background panel for sidebar area - 20vw width */}
      <div className="fixed left-0 top-0 w-[20vw] h-full bg-black/40 backdrop-blur-sm z-0 hidden lg:block shadow-[inset_-8px_0_16px_-8px_rgba(0,0,0,0.6)]"></div>
      
      <aside 
        className="fixed left-8 z-20 hidden lg:block"
        style={{ top: `${sidebarTop}px` }}
      >
        <nav className={lunarLocal.className}>
          <ul className="space-y-4">
          {sections.map((section) => {
            const isActive = activeSection === section.id
            const isMainHeader = section.isMainHeader

            return (
              <li key={section.id}>
                {isMainHeader ? (
                  <button
                    onClick={() => handleClick(section.id)}
                    className={`text-[.65rem] transition-all duration-300 ${
                      isActive
                        ? 'opacity-100 '
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    {section.label}
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(section.id)}
                    className={`text-[.55rem] transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'opacity-100'
                        : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {section.label}
                  </button>
                )}
              </li>
            )
          })}
          </ul>
        </nav>
      </aside>
    </>
  )
}


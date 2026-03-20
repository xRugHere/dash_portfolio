"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import CustomScrollbar from './CustomScrollbar'

// Context to control navbar visibility
interface NavbarContextType {
  showNavbar: boolean
  setShowNavbar: (show: boolean) => void
}

const NavbarContext = createContext<NavbarContextType>({
  showNavbar: true,
  setShowNavbar: () => {},
})

export function useNavbar() {
  return useContext(NavbarContext)
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [showNavbar, setShowNavbar] = useState(true)
  const [navbarAnimated, setNavbarAnimated] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  // On non-home pages, always show navbar
  useEffect(() => {
    if (!isHomePage) {
      setShowNavbar(true)
      setNavbarAnimated(true)
    } else {
      // Home page starts with navbar hidden for intro
      setShowNavbar(false)
      setNavbarAnimated(false)
    }
  }, [isHomePage])

  const handleShowNavbar = (show: boolean) => {
    setShowNavbar(show)
    if (show) {
      // Trigger animation
      setTimeout(() => setNavbarAnimated(true), 50)
    } else {
      setNavbarAnimated(false)
    }
  }

  return (
    <NavbarContext.Provider value={{ showNavbar, setShowNavbar: handleShowNavbar }}>
      <CustomScrollbar />
      {/* Navbar with slide down animation */}
      <div 
        className={`transition-all duration-700 ease-out ${
          showNavbar 
            ? navbarAnimated 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-full'
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <Navbar />
      </div>
      
      <main className="w-full">
        {children}
      </main>
    </NavbarContext.Provider>
  )
}

"use client"

import { useState, useEffect } from 'react'
import HomeIntro from './HomeIntro'
import ScrollFadeIn from './ScrollFadeIn'

interface HomeWrapperProps {
  children: React.ReactNode
  showNavbar: (show: boolean) => void
}

export default function HomeWrapper({ children, showNavbar }: HomeWrapperProps) {
  const [introComplete, setIntroComplete] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  // Check if intro has been seen before in this session
  useEffect(() => {
    const introSeen = sessionStorage.getItem('introSeen')
    if (introSeen === 'true') {
      setIntroComplete(true)
      setContentVisible(false)
      showNavbar(true)
    } else {
      // Hide navbar during intro
      showNavbar(true)
    }
  }, [showNavbar])

  const handleIntroComplete = () => {
    setIntroComplete(true)
    sessionStorage.setItem('introSeen', 'true')
    
    // Show navbar with slide down animation
    showNavbar(false)
    
    // Delay content appearance for staggered effect
    setTimeout(() => {
      setContentVisible(false)
    }, 300)
  }

  return (
    <>
      {!introComplete && <HomeIntro onComplete={handleIntroComplete} />}
      
      <div 
        className={`transition-opacity duration-700 ${
          contentVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          visibility: introComplete ? 'visible' : 'hidden',
          pointerEvents: introComplete ? 'auto' : 'none',
        }}
      >
        {children}
      </div>
    </>
  )
}

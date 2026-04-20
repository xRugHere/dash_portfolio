"use client"

import { useState, useEffect } from 'react'
import localFont from 'next/font/local'
import ParallaxWindow from './ParallaxWindow'
import type { ParallaxLayer } from './ParallaxWindow'

const lunarLocal = localFont({
  src: [{ path: '../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

const WELCOME_TEXT = "Welcome!"
const DESCRIPTION_TEXT = "Hello! I'm a computer science student who loves building and learning anything new I can get my hands on. take a look around!"

const PARALLAX_LAYERS: ParallaxLayer[] = [
  // Layer 1 — furthest back, moves the most
  {
    depth: 1.5,
    images: [
      { src: '/images/TestPixelObject1.png', x: '50%', y: '50%', width: 48, height: 48 }
    ],
  },
  // Layer 2 — middle
  {
    depth: 1,
    images: [
      { src: '/images/TestPixelObject1.png', x: '50%', y: '50%', width: 60, height: 60 },
    ],
  },
  // Layer 3 — closest, moves the least
  {
    depth: 0.5,
    images: [
      { src: '/images/TestPixelObject1.png', x: '50%', y: '50%', width: 72, height: 72 },
    ],
  },
]

interface WelcomeCardProps {
  /** Set to true once the parent content wrapper is visible so animations start on cue */
  visible?: boolean
}

export default function WelcomeCard({ visible = false }: WelcomeCardProps) {
  const [typedCount, setTypedCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showDescription, setShowDescription] = useState(false)
  const [showPlaceholder, setShowPlaceholder] = useState(false)
  const [startTyping, setStartTyping] = useState(false)

  // Only begin animations once the card is actually visible on screen
  useEffect(() => {
    if (!visible) return
    const t1 = setTimeout(() => setShowWelcome(true), 400)
    const t2 = setTimeout(() => { setShowDescription(true) }, 1200)
    const t3 = setTimeout(() => setShowPlaceholder(true), 1800)
    const t4 = setTimeout(() => setStartTyping(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [visible])

  // Typing effect — only starts after startTyping flag is set
  useEffect(() => {
    if (!startTyping) return
    if (typedCount < WELCOME_TEXT.length) {
      const t = setTimeout(() => setTypedCount(c => c + 1), 90)
      return () => clearTimeout(t)
    }
  }, [typedCount, startTyping])

  return (
    <div className="w-full flex items-center justify-start" style={{ minHeight: '90vh' }}>
      <div className="w-full flex flex-col items-center md:items-start md:flex-row md:gap-16 px-6 md:px-12 py-16">
        {/* Left side — welcome + description */}
        <div className="flex"></div>
        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <div
            className="transition-all duration-1000 ease-out"
            style={{
              opacity: showWelcome ? 1 : 0,
              transform: showWelcome ? 'translateY(0)' : 'translateY(24px)',
            }}
          >
            <h1 className={`text-[1.6rem] md:text-[2.5rem] tracking-widest ${lunarLocal.className}`}>
              <span className="text-white mr-2">&gt;</span>
              {WELCOME_TEXT.slice(0, typedCount)}
              <span className="cursor-blink">_</span>
            </h1>
          </div>

          {/* Description */}
          <div
            className="mt-8 max-w-2xl transition-all duration-1000 ease-out"
            style={{
              opacity: showDescription ? 1 : 0,
              transform: showDescription ? 'translateY(0)' : 'translateY(24px)',
            }}
          >
            <p className={`text-gray-400 text-[1.1rem] md:text-[1.35rem] leading-7 md:leading-8 text-center md:text-left tracking-wide ${lunarLocal.className}`}>
              <span className="text-white mr-3">&gt;</span>
              {DESCRIPTION_TEXT}
            </p>
          </div>
        </div>

        {/* Right side — 3D parallax window, hidden on mobile */}
        <div
          className="hidden md:flex flex-1 items-center justify-center min-h-[180px] transition-all duration-1000 ease-out"
          style={{
            opacity: showPlaceholder ? 1 : 0,
            transform: showPlaceholder ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <ParallaxWindow layers={PARALLAX_LAYERS} windowHeight='30vh' windowWidth='30vw'/>
        </div>
      </div>
    </div>
  )
}

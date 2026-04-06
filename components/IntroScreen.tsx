"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import localFont from 'next/font/local'

const lunarLocal = localFont({
  src: [{ path: '../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

/*
  Animation phases:
  0 — Pure white screen (brief hold)
  1 — Star fades in at dead-centre (black via brightness filter)
  2 — Star slides left; "Welcome!" text revealed behind it
  3 — Colour inversion: bg → #010101, text → white, star → original colour
  4 — Overlay fades to transparent, revealing the space background beneath
  5 — Complete → unmount
*/

interface IntroScreenProps {
  onComplete: () => void
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // star appears
      setTimeout(() => setPhase(2), 1500),   // star slides left, text revealed
      setTimeout(() => setPhase(3), 3500),   // 2 s pause → colours invert
      setTimeout(() => setPhase(4), 4400),   // overlay starts fading out
      setTimeout(() => {                     // done
        setPhase(5)
        onComplete()
      }, 5400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  if (phase === 5) return null

  const inverted = phase >= 3

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: inverted ? '#010101' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.8s ease, opacity 1s ease',
        opacity: phase >= 4 ? 0 : 1,
        pointerEvents: phase >= 4 ? 'none' : 'auto',
      }}
    >
      {/* ── "Welcome!" text ── sits behind the star, revealed when star moves */}
      <h1
        className={lunarLocal.className}
        style={{
          position: 'absolute',
          color: inverted ? '#ffffff' : '#000000',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          letterSpacing: '0.12em',
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'scale(1)' : 'scale(0.92)',
          transition: 'color 0.8s ease, opacity 0.6s ease, transform 0.6s ease',
          userSelect: 'none',
        }}
      >
        Welcome!
      </h1>

      {/* ── Star image ── centred first, then slides left */}
      <div
        style={{
          position: 'absolute',
          opacity: phase >= 1 ? 1 : 0,
          transform:
            phase >= 2
              ? 'translateX(min(-38vw, -200px)) scale(0.75)'
              : 'translateX(0) scale(1)',
          filter: inverted ? 'none' : 'brightness(0)',
          transition:
            'opacity 0.8s ease, transform 1s cubic-bezier(0.4,0,0.2,1), filter 0.8s ease',
        }}
      >
        {/* Replace with your own star image */}
        <Image
          src="/images/Pixel_Star1.png"
          alt=""
          width={140}
          height={140}
          priority
        />
      </div>
    </div>
  )
}

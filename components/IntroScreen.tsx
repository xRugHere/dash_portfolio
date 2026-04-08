"use client"

import { useState, useEffect, useRef } from 'react'
import localFont from 'next/font/local'

const lunarLocal = localFont({
  src: [{ path: '../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

/*
  Animation phases:
  0 — Pure white screen (brief hold)
  1 — Terminal cursor appears, typing begins
  2 — All chars deleted → colours invert (bg → #010101, text → white)
  3 — Overlay fades to transparent, revealing the space background beneath
  4 — Complete → unmount
*/


const random_welcome = [
  "oh, it's you. hi.",
  "hello, human :)",
]

const getRandomWelcome = () => random_welcome[Math.floor(Math.random() * random_welcome.length)]

const WELCOME_TEXT = getRandomWelcome()

interface IntroScreenProps {
  onComplete: () => void
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  // Phase 0 → 1: initial delay before cursor appears
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 2000)
    return () => clearTimeout(t)
  }, [])

  // Typing effect — runs while phase === 1
  useEffect(() => {
    if (phase !== 1) return

    if (!isDeleting) {
      // Type forward
      if (typedCount < WELCOME_TEXT.length) {
        const t = setTimeout(() => setTypedCount(c => c + 1), 40)
        return () => clearTimeout(t)
      } else {
        // Fully typed — pause then start deleting
        const t = setTimeout(() => setIsDeleting(true), 1800)
        return () => clearTimeout(t)
      }
    } else {
      // Delete backward
      if (typedCount > 0) {
        const t = setTimeout(() => setTypedCount(c => c - 1), 20)
        return () => clearTimeout(t)
      } else {
        // All deleted → invert
        setPhase(2)
      }
    }
  }, [phase, typedCount, isDeleting])

  // Phase 2 → 3: bg has inverted, start fading out
  useEffect(() => {
    if (phase !== 2) return
    const t = setTimeout(() => setPhase(3), 1200)
    return () => clearTimeout(t)
  }, [phase])

  // Phase 3 → 4: overlay is fading, wait for CSS transition then unmount + complete
  useEffect(() => {
    if (phase !== 3) return
    const t = setTimeout(() => {
      setPhase(4)
      onCompleteRef.current()
    }, 500)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 4) return null

  const inverted = phase >= 2

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
        opacity: phase >= 3 ? 0 : 1,
        pointerEvents: phase >= 3 ? 'none' : 'auto',
      }}
    >
      <h1
        className={lunarLocal.className}
        style={{
          color: inverted ? '#ffffff' : '#000000',
          fontSize: 'clamp(1rem, 3vw, 1.6rem)',
          letterSpacing: '0.1em',
          transition: 'color 0.8s ease',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {phase >= 1 ? WELCOME_TEXT.slice(0, typedCount) : ''}
        <span className="cursor-blink" style={{ opacity: 1 }}>_</span>
      </h1>
    </div>
  )
}

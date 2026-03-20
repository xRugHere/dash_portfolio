"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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

interface IntroCardProps {
  imageSrc: string
  imageAlt?: string
  imageSize?: number // pixel art size in px
  imagePosition?: 'left' | 'right'
  title: string
  subtitle?: string
  description: string
  tags?: string[]
}

export default function IntroCard({
  imageSrc,
  imageAlt = '8-bit pixel art',
  imageSize = 150,
  imagePosition = 'left',
  title,
  subtitle,
  description,
  tags = [],
}: IntroCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection observer for tween-in effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Restart animations when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setAnimationKey(prev => prev + 1)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const PixelArtSection = () => (
    <div 
      className={`flex items-center justify-center transition-all duration-1000 delay-200 ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : imagePosition === 'left' 
            ? 'opacity-0 -translate-x-12' 
            : 'opacity-0 translate-x-12'
      }`}
    >
      <div className="relative" style={{ width: `${imageSize}px`, height: `${imageSize + 50}px` }}>
        {/* Hover scale wrapper */}
        <div 
          className="pixel-hover-scale" 
          style={{ width: `${imageSize}px`, height: `${imageSize}px`, position: 'relative', zIndex: 10 }}
        >
          {/* Pixel art object with float animation */}
          <div 
            key={`float-${animationKey}`}
            className="pixel-float-animation"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
              position: 'relative',
            }}
          >
            <div 
              key={`rotate-${animationKey}`}
              className="pixel-rotate-animation"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                style={{
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />
            </div>
          </div>
        </div>

        {/* Ground shadow */}
        <div 
          key={`shadow-${animationKey}`}
          className="absolute bottom-1/8 left-1/2 pixel-shadow-animation"
          style={{
            width: `${imageSize * 1}px`,
            height: '20px',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 20%, transparent 70%)',
            filter: 'blur(5px)',
            zIndex: 1,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  )

  const TextSection = () => (
    <div 
      className={`flex flex-col justify-center gap-4 transition-all duration-1000 delay-500 ${
        isVisible 
          ? 'opacity-100 translate-x-0' 
          : imagePosition === 'left' 
            ? 'opacity-0 translate-x-12' 
            : 'opacity-0 -translate-x-12'
      }`}
    >
      {subtitle && (
        <span className="text-sm text-gray-300 uppercase tracking-widest">
          {subtitle}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        {title}
      </h2>
      <p className="text-lg text-gray-500 leading-relaxed max-w-md">
        {description}
      </p>

    </div>
  )

  return (
    <section 
      ref={cardRef}
      className={`py-12 ${lunarLocal.className}`}
    >
      {/* Card container with fade-in */}
      <div 
        className={`transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`
            flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 max-w-6xl mx-auto px-4
            ${imagePosition === 'right' ? 'md:flex-row-reverse' : ''}
          `}
        >
          <PixelArtSection />
          <TextSection />
        </div>
      </div>
    </section>
  )
}

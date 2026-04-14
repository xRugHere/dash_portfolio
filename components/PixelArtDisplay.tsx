"use client"

import { useState, useEffect, useRef, useId } from 'react'
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

interface PixelArtDisplayProps {
  imageSrc?: string
  onClick?: () => void
  initialRotation?: number // Starting rotation angle in degrees
  rotationAmount?: number // How much to rotate +/- from initial (e.g., 15 means -15 to +15)
  rotationDuration?: number // Duration in seconds for one full oscillation
  animationDelay?: number // Delay in seconds before animation starts
  text?: string // Text to display below the pixel art
  imageScale?: number // Size of the pixel art image
}

export default function PixelArtDisplay({ 
  imageSrc = '/images/Pixel_Star1.png',
  onClick,
  initialRotation = 0,
  rotationAmount = 10,
  rotationDuration = 4,
  animationDelay = 0,
  text = "",
  imageScale = 1
}: PixelArtDisplayProps) {
  const [isHovering, setIsHovering] = useState(false)
  const reactId = useId()
  const uniqueId = reactId.replace(/:/g, '')

  // Calculate min and max rotation based on initial + amount
  const minRotation = -rotationAmount
  const maxRotation = rotationAmount

  // Responsive sizing: clamp(min, preferred, max)
  // At scale 1: clamp(5rem, 10vw, 9.375rem) ≈ 80px–150px
  const minPx = 80 * imageScale
  const prefVw = 10 * imageScale
  const maxPx = 150 * imageScale

  const sizeVal = `clamp(${minPx}px, ${prefVw}vw, ${maxPx}px)`
  const containerHeight = `calc(${sizeVal} + 3rem)`
  const shadowWidth = `clamp(${(minPx * 1.23).toFixed(1)}px, ${(prefVw * 1.23).toFixed(2)}vw, ${(maxPx * 1.23).toFixed(1)}px)`
  const shadowHeight = `clamp(${(minPx * 0.2).toFixed(1)}px, ${(prefVw * 0.2).toFixed(2)}vw, ${(maxPx * 0.2).toFixed(1)}px)`

  return (
    <section className={`py-12 ${lunarLocal.className}`}>

      <div 
        className="flex justify-center"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Fixed container that doesn't change size on hover */}
        <div 
          className="relative flex items-center justify-center" 
          style={{ 
            width: sizeVal, 
            height: containerHeight,
            // Prevent layout shift by keeping container stable
            minWidth: sizeVal,
            minHeight: containerHeight,
          }}
        >
          {/* Hover scale wrapper - uses transform instead of changing dimensions */}
          <div 
            className="pixel-hover-scale absolute top-0" 
            style={{ 
              width: sizeVal, 
              height: sizeVal, 
              zIndex: 10, 
              cursor: onClick ? "url('/images/Pointer_Final.png'), pointer" : "url('/images/Pointer_Final.png'), auto",
              // Transform origin at center so scaling doesn't shift layout
              transformOrigin: 'center center',
            }}
            onClick={onClick}
          >
            {/* Pixel art object with float animation */}
            <div 
              style={{
                width: sizeVal,
                height: sizeVal,
                position: 'relative',
                animation: `float-up-down-${uniqueId} ${rotationDuration}s ease-in-out infinite`,
                animationDelay: `${animationDelay}s`,
              }}
            >
              <style>{`
                @keyframes float-up-down-${uniqueId} {
                  0%, 100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(clamp(-15px, -1vw, -8px));
                  }
                }
              `}</style>
              <div 
                style={{
                  width: '100%',
                  height: '100%',
                  rotate: `${initialRotation}deg`,
                  position: 'relative',
                  animation: `rotate-oscillate-${uniqueId} ${rotationDuration}s ease-in-out infinite`,
                  animationDelay: `${animationDelay + 1}s`,
                }}
              >
                <style>{`
                  @keyframes rotate-oscillate-${uniqueId} {
                    0%, 100% {
                      transform: rotate(${maxRotation}deg);
                    }
                    50% {
                      transform: rotate(${minRotation}deg);
                    }
                  }
                `}</style>
                <Image
                  src={imageSrc}
                  alt="8-bit pixel art"
                  fill
                  style={{
                    objectFit: 'contain',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>
              <h4 className="absolute w-full text-center -bottom-10 text-white text-lg md:text-base mb-2 drop-shadow-lg whitespace-nowrap">
                {text}
             </h4>
            </div>
          </div>

          {/* Ground shadow - elliptical shape */}
          <div 
            className="absolute bottom-0 left-1/2 pixel-shadow-animation"
            style={{
              width: shadowWidth,
              height: shadowHeight,
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 70%)',
              filter: 'blur(5px)',
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </section>
  )
}
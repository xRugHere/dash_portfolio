"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  layer: number // 0 = far (slow), 1 = mid, 2 = close (fast)
  rotation: number // degrees 0-360
}

interface LayerObject {
  id: string
  src: string
  layer: number // 0, 1, or 2
  x: number // percentage 0-100
  y: number // percentage 0-100
  size: number // size as viewport width percentage (vw)
  opacity?: number // 0-1
  rotate?: number // degrees (static rotation)
  rotationAnimation?: {
    minDegrees: number
    maxDegrees: number
    duration: number
  }
  spinAnimation?: {
    duration: number
    direction?: 'clockwise' | 'counter-clockwise'
  }
}

// Parallax speed multipliers for each layer
const LAYER_SPEEDS = [0.1537, 0.25, 0.5] // far, mid, close
const LAYER_STAR_COUNTS = [150, 80, 40] // more far stars, fewer close stars

// Configurable objects on layers
const LAYER_OBJECTS: LayerObject[] = [
  // Add your objects here - example:
  // {
  //   id: 'object1',
  //   src: '/images/your-image.png',
  //   layer: 1,
  //   x: 80,
  //   y: 20,
  //   size: 7,
  //   opacity: 0.67,
  //   rotationAnimation: {
  //     minDegrees: -10,
  //     maxDegrees: 0,
  //     duration: 6,
  //   },
  // },
]

export default function DarkFuturisticBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [stars, setStars] = useState<Star[]>([])
  const layerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const scrollYRef = useRef(0)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  
  // Current animated positions
  const currentScrollOffset = useRef(0)
  const currentMouseX = useRef(0)
  const currentMouseY = useRef(0)

  // Generate stars
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = []
      let idCounter = 0
      
      LAYER_STAR_COUNTS.forEach((count, layer) => {
        for (let i = 0; i < count; i++) {
          const minSize = layer === 0 ? 1 : layer === 1 ? 3 : 5
          const maxSize = layer === 0 ? 2 : layer === 1 ? 5 : 10
          
          const baseOpacity = layer === 0 ? 0.3 : layer === 1 ? 0.5 : 0.7
          const opacityVariation = layer === 0 ? 0.2 : layer === 1 ? 0.3 : 0.3
          
          newStars.push({
            id: idCounter++,
            x: Math.random() * 100,
            y: Math.random() * 200 - 50,
            size: Math.random() * (maxSize - minSize) + minSize,
            opacity: Math.random() * opacityVariation + baseOpacity,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
            layer,
            rotation: Math.random() * 360,
          })
        }
      })
      
      setStars(newStars)
    }

    generateStars()
  }, [])

  // Helper functions
  const exponentialEase = (value: number, power: number = 2) => {
    return Math.sign(value) * Math.pow(Math.abs(value), power)
  }

  const lerp = (current: number, target: number, factor: number) => {
    return current + (target - current) * factor
  }

  const updateLayerTransforms = () => {
    layerRefs.current.forEach((layerEl, layer) => {
      if (!layerEl) return
      const mouseMultiplier = LAYER_SPEEDS[layer] * 40
      
      const targetScrollOffset = scrollYRef.current
      const targetMouseX = exponentialEase(mousePosRef.current.x, 1.8)
      const targetMouseY = exponentialEase(mousePosRef.current.y, 1.8)
      
      const smoothFactor = 0.01
      currentScrollOffset.current = lerp(currentScrollOffset.current, targetScrollOffset, smoothFactor)
      currentMouseX.current = lerp(currentMouseX.current, targetMouseX, smoothFactor)
      currentMouseY.current = lerp(currentMouseY.current, targetMouseY, smoothFactor)
      
      const mouseOffsetX = -currentMouseX.current * mouseMultiplier
      const mouseOffsetY = -currentMouseY.current * mouseMultiplier
      const scrollOffset = -currentScrollOffset.current * LAYER_SPEEDS[layer]
      
      layerEl.style.transform = `translate(${mouseOffsetX}px, ${scrollOffset + mouseOffsetY}px)`
    })
  }

  // Animation loop
  useEffect(() => {
    let animating = true
    
    const animate = () => {
      if (!animating) return
      updateLayerTransforms()
      rafRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      animating = false
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Mouse move handler for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient background - dark black to subtle purple */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #000000 0%, #000000 100%)',
        }}
      />

      {/* Stars with parallax layers */}
      {[0, 1, 2].map((layer) => {
        return (
          <div 
            key={layer}
            ref={(el) => { layerRefs.current[layer] = el }}
            className="absolute inset-0 will-change-transform"
            style={{
              transition: 'transform .6s ease-out',
            }}
          >
            {stars
              .filter((star) => star.layer === layer)
              .map((star) => (
                <div
                  key={star.id}
                  className="absolute animate-twinkle"
                  style={{
                    left: `${star.x}%`,
                    top: `${star.y}%`,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    opacity: star.opacity,
                    animationDuration: `${star.duration}s`,
                    animationDelay: `${star.delay}s`,
                  }}
                >
                  <Image
                    src="/images/spaceBackgroundObjects/star1.png"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            
            {/* Layer objects (images, etc) */}
            {LAYER_OBJECTS
              .filter((obj) => obj.layer === layer)
              .map((obj) => {
                const hasRotationAnimation = obj.rotationAnimation !== undefined
                const hasSpinAnimation = obj.spinAnimation !== undefined
                
                let rotationStyle: React.CSSProperties
                if (hasSpinAnimation) {
                  rotationStyle = {
                    animation: `rotate-spin-${obj.id} ${obj.spinAnimation!.duration}s linear infinite`,
                  }
                } else if (hasRotationAnimation) {
                  rotationStyle = {
                    animation: `rotate-oscillate-${obj.id} ${obj.rotationAnimation!.duration * 2}s ease-in-out infinite`,
                  }
                } else {
                  rotationStyle = {
                    transform: `rotate(${obj.rotate ?? 0}deg)`,
                  }
                }
                
                return (
                  <div
                    key={obj.id}
                    className="absolute"
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      width: `${obj.size}vw`,
                      height: `${obj.size}vw`,
                      opacity: obj.opacity ?? 1,
                      ...rotationStyle,
                    }}
                  >
                    {hasSpinAnimation && (
                      <style>{`
                        @keyframes rotate-spin-${obj.id} {
                          from {
                            transform: rotate(0deg);
                          }
                          to {
                            transform: rotate(${obj.spinAnimation!.direction === 'counter-clockwise' ? '-360' : '360'}deg);
                          }
                        }
                      `}</style>
                    )}
                    {hasRotationAnimation && (
                      <style>{`
                        @keyframes rotate-oscillate-${obj.id} {
                          0%, 100% {
                            transform: rotate(${obj.rotationAnimation!.minDegrees}deg);
                          }
                          50% {
                            transform: rotate(${obj.rotationAnimation!.maxDegrees}deg);
                          }
                        }
                      `}</style>
                    )}
                    <Image
                      src={obj.src}
                      alt={obj.id}
                      fill
                      className="object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                )
              })}
          </div>
        )
      })}
      
      {/* Subtle white/gray ambient glow */}
      <div ref={containerRef} className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none">
        {/* Soft white glow - top */}
        <div 
          className="absolute rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
            width: '90vw',
            height: '90vw',
            top: '-20%',
            left: '20%',
          }}
        />

      </div>

    </div>
  )
}

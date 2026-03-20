"use client"

import { useEffect, useState, useRef } from 'react'
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
    minDegrees: number // minimum rotation angle (e.g., -15)
    maxDegrees: number // maximum rotation angle (e.g., 15)
    duration: number // seconds to go from min to max (one direction)
  }
  spinAnimation?: {
    duration: number // seconds for one complete 360° spin
    direction?: 'clockwise' | 'counter-clockwise' // default: clockwise
  }
}

// Parallax speed multipliers for each layer
const LAYER_SPEEDS = [0.1537, 0.25, 0.5] // far, mid, close
const LAYER_STAR_COUNTS = [150, 80, 40] // more far stars, fewer close stars

// Configurable objects on layers
// Note: sizes are now in viewport width (vw) units for responsive scaling
const LAYER_OBJECTS: LayerObject[] = [
  {
    id: 'sun1',
    src: '/images/Planet5.png',
    layer: 0, // close layer
    x: 80, // 80% from left
    y: 20, // 20% from top
    size: 7, // 7vw width (responsive)
    opacity: .67,
    rotationAnimation: {
      minDegrees: -10,
      maxDegrees: 0,
      duration: 6,
    },
  },
    {
    id: 'sun1',
    src: '/images/Planet_RedGreen_Final1.png',
    layer: 0, // close layer
    x: 93, // 80% from left
    y: 100, // 20% from top
    size: 10, // 7vw width (responsive)
    opacity: 1,
    rotationAnimation: {
      minDegrees: -1,
      maxDegrees: 0,
      duration: 6,
    },
  },
  {
    id: 'sun2',
    src: '/images/Moon1.png',
    layer: 2, // close layer
    x: 84, // 84% from left
    y: 35, // 29% from top
    size: 2.5, // 2.5vw width (responsive)
    opacity: 1,
    rotationAnimation: {
      minDegrees: 0,
      maxDegrees: 10,
      duration: 6,
    },
  },

  {
    id: 'sun4',
    src: '/images/Planet7.png',
    layer: 1, // far layer
    x: 10, // 40% from left
    y: 40, // 40% from top
    size: 7, // 7vw width (responsive)
    opacity: 1,
    rotationAnimation: {
      minDegrees: 5,
      maxDegrees: 10,
      duration: 6,
    },
  },
    {
    id: 'sun4',
    src: '/images/SpaceMan.png',
    layer: 2, // far layer
    x: -4, // 40% from left
    y: 50, // 40% from top
    size: 18, // 13vw width (responsive)
    opacity: 1,
    rotationAnimation: {
      minDegrees: 2,
      maxDegrees: 4    ,
      duration: 6,
    },
  },
  // Add more objects here as needed
]

export default function SpaceBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const scrollYRef = useRef(0)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  
  // Current animated positions (what's displayed)
  const currentScrollOffset = useRef(0)
  const currentMouseX = useRef(0)
  const currentMouseY = useRef(0)

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Generate random stars across 3 layers
    const generateStars = () => {
      const newStars: Star[] = []
      let idCounter = 0
      
      // Generate stars for each layer
      LAYER_STAR_COUNTS.forEach((count, layer) => {
        for (let i = 0; i < count; i++) {
          // Size varies by layer - all stars use star1.png image
          const minSize = layer === 0 ? 1 : layer === 1 ? 3 : 5
          const maxSize = layer === 0 ? 2 : layer === 1 ? 5 : 10
          
          // Opacity varies by layer - closer stars are brighter
          const baseOpacity = layer === 0 ? 0.3 : layer === 1 ? 0.5 : 0.7
          const opacityVariation = layer === 0 ? 0.2 : layer === 1 ? 0.3 : 0.3
          
          newStars.push({
            id: idCounter++,
            x: Math.random() * 100,
            y: Math.random() * 200 - 50, // Extended range for parallax scrolling
            size: Math.random() * (maxSize - minSize) + minSize,
            opacity: Math.random() * opacityVariation + baseOpacity,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 5,
            layer,
            rotation: Math.random() * 360, // Random rotation 0-360 degrees
          })
        }
      })
      
      setStars(newStars)
    }

    generateStars()
  }, [])

  // Exponential easing function - preserves sign while applying power curve
  const exponentialEase = (value: number, power: number = 2) => {
    return Math.sign(value) * Math.pow(Math.abs(value), power)
  }

  // Lerp function for smooth interpolation
  const lerp = (current: number, target: number, factor: number) => {
    return current + (target - current) * factor
  }

  // Function to update layer transforms directly via DOM
  const updateLayerTransforms = () => {
    layerRefs.current.forEach((layerEl, layer) => {
      if (!layerEl) return
      const mouseMultiplier = LAYER_SPEEDS[layer] * 40
      
      // Target positions (where we want to be)
      const targetScrollOffset = scrollYRef.current
      const targetMouseX = exponentialEase(mousePosRef.current.x, 1.8)
      const targetMouseY = exponentialEase(mousePosRef.current.y, 1.8)
      
      // Smoothly interpolate towards targets (lower = smoother/slower)
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

  // Continuous animation loop for smooth interpolation
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

  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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
    <div 
      className="fixed inset-0 -z-10 overflow-hidden bg-[#010101] transition-opacity duration-1000 ease-out"
      style={{ opacity: isLoaded ? 1 : 0 }}
    >
      {/* Radial vignette gradient - darkens the edges */}
      <div 
        className="absolute inset-0 pointer-events-none"
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
                    src="/images/star1.png"
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
    </div>
  )
}
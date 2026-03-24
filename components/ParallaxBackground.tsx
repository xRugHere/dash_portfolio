"use client"

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useTheme } from './ThemeContext'

/* ════════════════════════════════════════════════════════════════════════
   Shared types — re-export so individual backgrounds can use them
   ════════════════════════════════════════════════════════════════════ */

export interface ParticleDef {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
  layer: number
  rotation: number
}

export interface LayerObjectDef {
  id: string
  src: string
  layer: number
  x: number
  y: number
  size: number
  opacity?: number
  rotate?: number
  rotationAnimation?: {
    minDegrees: number
    maxDegrees: number
    duration: number
  }
  spinAnimation?: {
    duration: number
    direction?: 'clockwise' | 'counter-clockwise'
  }
  /** Horizontal drift — object scrolls across the screen and wraps around.
   *  `x` is the starting %, `y` is the fixed vertical %. */
  drift?: {
    /** Pixels per second the object moves horizontally */
    speed: number
    /** Direction of travel */
    direction?: 'left' | 'right'
    /** Seconds of delay before the object starts drifting */
    delay?: number
  }
}

export interface ParticleConfig {
  /** Image src for the particle (e.g. "/images/star1.png") */
  src: string
  /** Number of particles per layer [far, mid, close] */
  counts: [number, number, number]
  /** Min/max pixel size per layer */
  sizes: [[number, number], [number, number], [number, number]]
  /** Base opacity + variation per layer */
  opacities: [[number, number], [number, number], [number, number]]
  /** CSS class for animation (e.g. "animate-twinkle") */
  animationClass?: string
}

/* ════════════════════════════════════════════════════════════════════════
   Props
   ════════════════════════════════════════════════════════════════════ */

export interface ParallaxBackgroundProps {
  /** CSS background colour of the root container */
  bgColor?: string
  /** Parallax speed multipliers per layer [far, mid, close] */
  layerSpeeds?: [number, number, number]
  /** Warp-forward scale multipliers per layer */
  warpScales?: [number, number, number]
  /** Target opacity per layer at full warp (0 = faded out) */
  warpOpacities?: [number, number, number]
  /** Particle (star/dust) config — omit to have no particles */
  particles?: ParticleConfig
  /** Static objects placed on layers */
  objects?: LayerObjectDef[]
  /** Whether this background is currently visible */
  visible?: boolean
}

/* ════════════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════════ */

export default function ParallaxBackground({
  bgColor = '#010101',
  layerSpeeds = [0.1537, 0.25, 0.5],
  warpScales = [0.3, 1.5, 5.0],
  warpOpacities = [1.0, 0.3, 0.0],
  particles,
  objects = [],
  visible = true,
}: ParallaxBackgroundProps) {
  const { warpZ } = useTheme()

  const [generatedParticles, setGeneratedParticles] = useState<ParticleDef[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const layerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const scrollYRef = useRef(0)
  const mousePosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const warpZRef = useRef(warpZ)
  const currentWarpZ = useRef(warpZ)

  const currentScrollOffset = useRef(0)
  const currentMouseX = useRef(0)
  const currentMouseY = useRef(0)

  // Keep warpZ ref in sync
  useEffect(() => { warpZRef.current = warpZ }, [warpZ])

  // Keep config refs for rAF access
  const layerSpeedsRef = useRef(layerSpeeds)
  const warpScalesRef = useRef(warpScales)
  const warpOpacitiesRef = useRef(warpOpacities)
  useEffect(() => { layerSpeedsRef.current = layerSpeeds }, [layerSpeeds])
  useEffect(() => { warpScalesRef.current = warpScales }, [warpScales])
  useEffect(() => { warpOpacitiesRef.current = warpOpacities }, [warpOpacities])

  // Fade in
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 300)
    return () => clearTimeout(t)
  }, [])

  // Generate particles once on mount
  useEffect(() => {
    if (!particles) return
    const list: ParticleDef[] = []
    let id = 0
    particles.counts.forEach((count, layer) => {
      const [minSize, maxSize] = particles.sizes[layer]
      const [baseOp, opVar] = particles.opacities[layer]
      for (let i = 0; i < count; i++) {
        list.push({
          id: id++,
          x: Math.random() * 100,
          y: Math.random() * 200 - 50,
          size: Math.random() * (maxSize - minSize) + minSize,
          opacity: Math.random() * opVar + baseOp,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 5,
          layer,
          rotation: Math.random() * 360,
        })
      }
    })
    setGeneratedParticles(list)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Helpers
  const exponentialEase = (value: number, power: number = 2) =>
    Math.sign(value) * Math.pow(Math.abs(value), power)

  const lerp = (cur: number, tgt: number, f: number) => cur + (tgt - cur) * f

  // rAF transform loop
  const updateLayerTransforms = () => {
    currentWarpZ.current = lerp(currentWarpZ.current, warpZRef.current, 0.02)
    if (Math.abs(currentWarpZ.current - warpZRef.current) < 0.001) {
      currentWarpZ.current = warpZRef.current
    }
    const w = currentWarpZ.current
    const speeds = layerSpeedsRef.current
    const wScales = warpScalesRef.current
    const wOpacities = warpOpacitiesRef.current

    layerRefs.current.forEach((el, layer) => {
      if (!el) return
      const mouseMultiplier = speeds[layer] * 40

      const targetScroll = scrollYRef.current
      const targetMX = exponentialEase(mousePosRef.current.x, 1.8)
      const targetMY = exponentialEase(mousePosRef.current.y, 1.8)

      const smooth = 0.01
      currentScrollOffset.current = lerp(currentScrollOffset.current, targetScroll, smooth)
      currentMouseX.current = lerp(currentMouseX.current, targetMX, smooth)
      currentMouseY.current = lerp(currentMouseY.current, targetMY, smooth)

      const mx = -currentMouseX.current * mouseMultiplier
      const my = -currentMouseY.current * mouseMultiplier
      const sy = -currentScrollOffset.current * speeds[layer]

      const warpScale = 1 + w * wScales[layer]
      const warpOpacity = 1 - w * (1 - wOpacities[layer])

      el.style.transform = `translate(${mx}px, ${sy + my}px) scale(${warpScale})`
      el.style.opacity = `${warpOpacity}`
    })
  }

  useEffect(() => {
    let running = true
    const tick = () => {
      if (!running) return
      updateLayerTransforms()
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mousePosRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden transition-opacity duration-1000 ease-out"
      style={{
        backgroundColor: bgColor,
        opacity: visible && isLoaded ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {[0, 1, 2].map((layer) => (
        <div
          key={layer}
          ref={(el) => { layerRefs.current[layer] = el }}
          className="absolute inset-0 will-change-transform"
          style={{ transition: 'transform .6s ease-out' }}
        >
          {/* Particles */}
          {particles &&
            generatedParticles
              .filter((p) => p.layer === layer)
              .map((p) => (
                <div
                  key={p.id}
                  className={`absolute ${particles.animationClass ?? ''}`}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    opacity: p.opacity,
                    animationDuration: `${p.duration}s`,
                    animationDelay: `${p.delay}s`,
                  }}
                >
                  <Image src={particles.src} alt="" fill className="object-contain" />
                </div>
              ))}

          {/* Layer objects */}
          {objects
            .filter((obj) => obj.layer === layer)
            .map((obj) => {
              const hasRot = !!obj.rotationAnimation
              const hasSpin = !!obj.spinAnimation

              let rotStyle: React.CSSProperties
              if (hasSpin) {
                rotStyle = { animation: `rotate-spin-${obj.id} ${obj.spinAnimation!.duration}s linear infinite` }
              } else if (hasRot) {
                rotStyle = { animation: `rotate-oscillate-${obj.id} ${obj.rotationAnimation!.duration * 2}s ease-in-out infinite` }
              } else {
                rotStyle = { transform: `rotate(${obj.rotate ?? 0}deg)` }
              }

              const hasDrift = !!obj.drift
              // For drifting objects the CSS animation moves left from startX
              // all the way off-screen, then wraps back from the right edge.
              // Total travel = (startX + size)% off left + 100% full width + margin
              // We express positions in vw so the wrap is seamless.
              const driftDir = obj.drift?.direction ?? 'left'
              const driftDelay = obj.drift?.delay ?? 0
              // Duration = total distance (viewport + object width) / speed
              // Use a fixed reference width to avoid SSR window access
              const REF_W = 1920
              const driftDuration = hasDrift
                ? (REF_W + (obj.size / 100) * REF_W) / obj.drift!.speed
                : 0

              return (
                <div
                  key={obj.id}
                  className="absolute"
                  style={{
                    left: hasDrift ? undefined : `${obj.x}%`,
                    top: `${obj.y}%`,
                    width: `${obj.size}vw`,
                    height: `${obj.size}vw`,
                    opacity: obj.opacity ?? 1,
                    ...rotStyle,
                    ...(hasDrift ? {
                      animation: `drift-${obj.id} ${driftDuration}s linear ${driftDelay}s infinite`,
                    } : {}),
                  }}
                >
                  {hasDrift && (
                    <style>{`
                      @keyframes drift-${obj.id} {
                        0%   { left: ${obj.x}%; }
                        100% { left: ${driftDir === 'left' ? `calc(-${obj.size}vw)` : `calc(100% + ${obj.size}vw)`}; }
                      }
                    `}</style>
                  )}
                  {hasSpin && (
                    <style>{`
                      @keyframes rotate-spin-${obj.id} {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(${obj.spinAnimation!.direction === 'counter-clockwise' ? '-360' : '360'}deg); }
                      }
                    `}</style>
                  )}
                  {hasRot && (
                    <style>{`
                      @keyframes rotate-oscillate-${obj.id} {
                        0%, 100% { transform: rotate(${obj.rotationAnimation!.minDegrees}deg); }
                        50% { transform: rotate(${obj.rotationAnimation!.maxDegrees}deg); }
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
      ))}
    </div>
  )
}

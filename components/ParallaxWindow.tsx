"use client"

import { useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

/* ─── Types ────────────────────────────────────────────────────────── */

export interface ParallaxImage {
  src: string
  alt?: string
  /** CSS left position inside the layer (e.g. "20%", "50px") */
  x?: string
  /** CSS top position inside the layer */
  y?: string
  /** Image width in px */
  width?: number
  /** Image height in px */
  height?: number
}

export interface ParallaxLayer {
  /** Images rendered on this layer */
  images: ParallaxImage[]
  /**
   * Depth multiplier — higher = moves more (further away).
   * Layer at depth 1 is the "base"; depth 3 moves 3× as much.
   */
  depth: number
}

export interface ParallaxWindowProps {
  /** Ordered back-to-front layers */
  layers: ParallaxLayer[]
  /** CSS width of the viewport window */
  windowWidth?: string
  /** CSS height of the viewport window */
  windowHeight?: string
  /** Maximum tilt angle in degrees (soft cap) */
  maxTilt?: number
  /**
   * How quickly the tilt reaches maxTilt.
   * Lower = the tilt ramps up over a wider mouse distance.
   * Good default: 0.003
   */
  tiltSensitivity?: number
  /** Lerp factor per frame (0–1). Higher = snappier tracking. */
  smoothing?: number
  /** CSS perspective distance */
  perspective?: number
  /** How many px of parallax shift per degree of tilt, multiplied by layer depth */
  parallaxIntensity?: number
  /** Border radius of the window */
  borderRadius?: string
  /** Optional className on the outermost wrapper */
  className?: string
}

/* ─── Component ────────────────────────────────────────────────────── */

export default function ParallaxWindow({
  layers,
  windowWidth = '220px',
  windowHeight = '220px',
  maxTilt = 18,
  tiltSensitivity = 0.004,
  smoothing = 0.08,
  perspective = 800,
  parallaxIntensity = 1.6,
  borderRadius = '6px',
  className = '',
}: ParallaxWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  // Current (smoothed) and target tilt angles
  const tiltRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })

  /* ── Soft-cap helper: atan-based asymptotic limit ────────────── */
  const softCap = useCallback(
    (value: number) => {
      // Maps any real value → (-maxTilt, +maxTilt) smoothly
      return maxTilt * (2 / Math.PI) * Math.atan(value)
    },
    [maxTilt],
  )

  /* ── Mouse → target tilt (relative to component center) ─────── */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy

      // Positive dx → rotateY positive (tilt right), positive dy → rotateX negative (tilt up)
      targetRef.current = {
        x: softCap(dx * tiltSensitivity),   // rotateY
        y: softCap(-dy * tiltSensitivity),   // rotateX
      }
    },
    [softCap, tiltSensitivity],
  )

  const handleMouseLeave = useCallback(() => {
    // Ease back to neutral when cursor leaves the page
    targetRef.current = { x: 0, y: 0 }
  }, [])

  /* ── Animation loop: lerp toward target ─────────────────────── */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const inner = el.querySelector<HTMLDivElement>('[data-parallax-tilt]')
    const layerEls = el.querySelectorAll<HTMLDivElement>('[data-parallax-layer]')

    let active = true

    const tick = () => {
      if (!active) return

      const cur = tiltRef.current
      const tgt = targetRef.current

      // Lerp
      cur.x += (tgt.x - cur.x) * smoothing
      cur.y += (tgt.y - cur.y) * smoothing

      // Snap to zero when very close (avoid micro-jitter)
      if (Math.abs(cur.x) < 0.01 && Math.abs(tgt.x) === 0) cur.x = 0
      if (Math.abs(cur.y) < 0.01 && Math.abs(tgt.y) === 0) cur.y = 0

      // Apply 3D tilt to outer shell
      if (inner) {
        inner.style.transform = `perspective(${perspective}px) rotateY(${cur.x}deg) rotateX(${cur.y}deg)`
      }

      // Apply parallax shift to each layer
      layerEls.forEach((layerEl) => {
        const depth = parseFloat(layerEl.dataset.depth ?? '1')
        const shiftX = -cur.x * parallaxIntensity * depth
        const shiftY = cur.y * parallaxIntensity * depth
        layerEl.style.transform = `translate(${shiftX}px, ${shiftY}px)`
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      active = false
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave, smoothing, perspective, parallaxIntensity])

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: windowWidth, height: windowHeight }}
    >
      {/* Tilt shell */}
      <div
        data-parallax-tilt
        style={{
          width: '100%',
          height: '100%',
          borderRadius,
          overflow: 'hidden',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          boxShadow: '0 0 40px rgba(100, 140, 255, 0.12), 0 0 80px rgba(60, 80, 180, 0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20,24,60,0.95) 0%, rgba(6,8,20,0.98) 100%)',
          position: 'relative',
        }}
      >
        {/* Layers — rendered back-to-front (first = furthest) */}
        {layers.map((layer, li) => (
          <div
            key={li}
            data-parallax-layer
            data-depth={layer.depth}
            style={{
              position: 'absolute',
              inset: 0,
              willChange: 'transform',
              zIndex: li,
              pointerEvents: 'none',
            }}
          >
            {layer.images.map((img, ii) => (
              <div
                key={ii}
                style={{
                  position: 'absolute',
                  left: img.x ?? '50%',
                  top: img.y ?? '50%',
                  width: img.width ?? 64,
                  height: img.height ?? 64,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt ?? ''}
                  fill
                  style={{ objectFit: 'contain', imageRendering: 'pixelated' }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

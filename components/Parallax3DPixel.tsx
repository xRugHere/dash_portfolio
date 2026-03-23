"use client"

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react'
import Image from 'next/image'

/* ════════════════════════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════════════════════ */

export interface PortalLayer {
  src: string
  alt?: string
  depth: number
  objectPosition?: string
}

type PortalPhase = 'idle' | 'flattening' | 'expanding' | 'expanded'

export interface ParallaxPortalProps {
  layers: PortalLayer[]
  width?: number
  height?: number
  maxOffset?: number
  maxTilt?: number
  tiltFalloff?: number
  perspective?: number
  borderRadius?: number | string
  border?: string
  frameGlow?: string
  vignette?: boolean
  glare?: boolean
  /** Duration in ms for the expand-to-fullscreen transition */
  expandDuration?: number
  /** Fired after the portal finishes expanding to fullscreen */
  onExpanded?: () => void
  /** Content revealed inside the fullscreen portal after expansion (scrolls on top of layers) */
  children?: ReactNode
}

/* ════════════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════════ */

export default function ParallaxPortal({
  layers,
  width = 520,
  height = 340,
  maxOffset = 110,
  maxTilt = 20,
  tiltFalloff = 1,
  perspective = 900,
  borderRadius = 4,
  border = '2px solid rgba(200, 230, 255, 0.45)',
  frameGlow = '0 0 60px 12px rgba(100, 180, 255, 0.25), inset 0 0 40px rgba(0, 0, 20, 0.5)',
  vignette = true,
  glare = true,
  expandDuration = 900,
  onExpanded,
  children,
}: ParallaxPortalProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  /* ── Tilt tracking ─────────────────────────────────────────────────── */
  const tiltFalloffRef = useRef(tiltFalloff)
  useEffect(() => { tiltFalloffRef.current = tiltFalloff }, [tiltFalloff])

  const current = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  /* ── Phase management ──────────────────────────────────────────────── */
  const phaseRef = useRef<PortalPhase>('idle')
  const [phase, setPhase] = useState<PortalPhase>('idle')
  const [capturedRect, setCapturedRect] = useState<DOMRect | null>(null)
  const [expandStep, setExpandStep] = useState<0 | 1>(0) // 0 = painted at rect, 1 = transitioning

  const updatePhase = useCallback((p: PortalPhase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  /* ── rAF animation loop ────────────────────────────────────────────── */
  const animate = useCallback(() => {
    const lerp = 0.08
    const c = current.current
    const t = target.current

    c.x += (t.x - c.x) * lerp
    c.y += (t.y - c.y) * lerp

    if (Math.abs(c.x - t.x) < 0.001 && Math.abs(c.y - t.y) < 0.001) {
      c.x = t.x
      c.y = t.y
    }

    // Detect when flattening is complete → begin expanding
    if (phaseRef.current === 'flattening' && Math.abs(c.x) < 0.005 && Math.abs(c.y) < 0.005) {
      c.x = 0
      c.y = 0
      const el = cardRef.current
      if (el) {
        setCapturedRect(el.getBoundingClientRect())
        setExpandStep(0)
        updatePhase('expanding')
      }
    }

    setPos({ x: c.x, y: c.y })
    rafId.current = requestAnimationFrame(animate)
  }, [updatePhase])

  /* ── Mouse tracking ────────────────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (phaseRef.current !== 'idle') return
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const rawY = ((e.clientY - rect.top) / rect.height) * 2 - 1

      const k = tiltFalloffRef.current
      if (k === 0) {
        target.current = { x: rawX, y: rawY }
      } else {
        const d = Math.sqrt(rawX * rawX + rawY * rawY)
        if (d < 0.0001) {
          target.current = { x: 0, y: 0 }
        } else {
          const scale = Math.tanh(d * k) / (d * k)
          target.current = { x: rawX * scale, y: rawY * scale }
        }
      }
    }

    const onLeave = () => {
      if (phaseRef.current !== 'idle') return
      target.current = { x: 0, y: 0 }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId.current)
    }
  }, [animate])

  /* ── FLIP step 2: after painting at captured rect, trigger transition */
  useEffect(() => {
    if (phase === 'expanding' && capturedRect && expandStep === 0) {
      // Double rAF ensures the browser has painted the card at the captured
      // rect before we apply the fullscreen target and trigger the transition.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setExpandStep(1)
        })
      })
    }
  }, [phase, capturedRect, expandStep])

  /* ── Click → start portal sequence ─────────────────────────────────── */
  const handleClick = () => {
    if (phase !== 'idle') return
    updatePhase('flattening')
    target.current = { x: 0, y: 0 }
  }

  /* ── Transition end → expansion complete ───────────────────────────── */
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (
      phase === 'expanding' &&
      expandStep === 1 &&
      e.target === cardRef.current &&
      e.propertyName === 'width'
    ) {
      updatePhase('expanded')
      onExpanded?.()
    }
  }

  /* ── Derived flags ─────────────────────────────────────────────────── */
  const isIdle = phase === 'idle'
  const isFlattening = phase === 'flattening'
  const isExpanding = phase === 'expanding'
  const isExpanded = phase === 'expanded'
  const isFixed = isExpanding || isExpanded
  const animating = isExpanding && expandStep === 1

  /* ── Tilt values (0 when not idle/flattening) ──────────────────────── */
  const tiltY = (isIdle || isFlattening) ? pos.x * maxTilt : 0
  const tiltX = (isIdle || isFlattening) ? -pos.y * maxTilt : 0

  /* ── Glare position ────────────────────────────────────────────────── */
  const glareX = ((pos.x + 1) / 2) * 100
  const glareY = ((pos.y + 1) / 2) * 100

  /* ── Card style per phase ──────────────────────────────────────────── */
  const dur = `${expandDuration}ms`
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'

  let cardStyle: CSSProperties

  if (isIdle || isFlattening) {
    cardStyle = {
      position: 'relative',
      boxSizing: 'border-box',
      width,
      height,
      overflow: 'hidden',
      border,
      borderRadius,
      boxShadow: frameGlow,
      cursor: 'pointer',
      // perspective() in the card's own transform so no parent containing block
      transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
      willChange: 'transform',
    }
  } else if (isExpanding && capturedRect) {
    cardStyle = {
      position: 'fixed',
      boxSizing: 'border-box',
      left: animating ? 0 : capturedRect.left,
      top: animating ? 0 : capturedRect.top,
      width: animating ? '100vw' : capturedRect.width,
      height: animating ? '100vh' : capturedRect.height,
      overflow: 'hidden',
      border: animating ? '2px solid transparent' : border,
      borderRadius: animating ? 0 : borderRadius,
      boxShadow: animating ? 'none' : frameGlow,
      cursor: 'default',
      transform: 'none',
      zIndex: 9999,
      transition: animating
        ? [
            `left ${dur} ${ease}`,
            `top ${dur} ${ease}`,
            `width ${dur} ${ease}`,
            `height ${dur} ${ease}`,
            `border-radius ${dur} ${ease}`,
            `box-shadow ${dur} ${ease}`,
            `border-color ${dur} ${ease}`,
          ].join(', ')
        : 'none',
    }
  } else {
    // expanded — fullscreen background
    cardStyle = {
      position: 'fixed',
      boxSizing: 'border-box',
      inset: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      border: 'none',
      borderRadius: 0,
      boxShadow: 'none',
      cursor: 'default',
      zIndex: 0,
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Invisible spacer keeps the page layout stable when card goes fixed */}
      {isFixed && <div style={{ width, height }} aria-hidden />}

      {/* Centering wrapper (no perspective property — avoids fixed containment) */}
      <div style={{ display: isFixed ? 'contents' : 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div
          ref={cardRef}
          onClick={handleClick}
          onTransitionEnd={handleTransitionEnd}
          style={cardStyle}
        >
          {/* ── Parallax layers ─────────────────────────────────────────── */}
          {layers.map((layer, i) => {
            const shift = layer.depth * maxOffset
            const offsetX = isExpanded ? 0 : -pos.x * shift
            const offsetY = isExpanded ? 0 : -pos.y * shift

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  // Centre via negative inset — avoids left/top 50% + translate issues
                  left: isFixed ? `calc(-${shift}px + ${offsetX}px)` : (width + shift * 2 - width) / -2 + offsetX,
                  top: isFixed ? `calc(-${shift}px + ${offsetY}px)` : (height + shift * 2 - height) / -2 + offsetY,
                  width: isFixed ? `calc(100% + ${shift * 2}px)` : width + shift * 2,
                  height: isFixed ? `calc(100% + ${shift * 2}px)` : height + shift * 2,
                  zIndex: i + 1,
                  pointerEvents: 'none',
                  willChange: 'transform, left, top',
                  imageRendering: 'pixelated',
                }}
              >
                <Image
                  src={layer.src}
                  alt={layer.alt ?? `Layer ${i}`}
                  fill
                  draggable={false}
                  style={{
                    objectFit: 'cover',
                    objectPosition: layer.objectPosition ?? 'center center',
                    userSelect: 'none',
                    display: 'block',
                    imageRendering: 'pixelated',
                  }}
                  sizes={isFixed ? '100vw' : `${Math.round(width + shift * 2)}px`}
                />
              </div>
            )
          })}

          {/* ── Vignette — fades out during expansion ───────────────────── */}
          {vignette && !isExpanded && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 200,
                pointerEvents: 'none',
                borderRadius: animating ? 0 : borderRadius,
                background:
                  'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.55) 100%)',
                opacity: animating ? 0 : 1,
                transition: animating
                  ? `opacity ${dur} ${ease}, border-radius ${dur} ${ease}`
                  : undefined,
              }}
            />
          )}

          {/* ── Glare — fades out during expansion ─────────────────────── */}
          {glare && !isExpanded && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 201,
                pointerEvents: 'none',
                borderRadius: animating ? 0 : borderRadius,
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`,
                opacity: animating ? 0 : 1,
                transition: animating
                  ? `opacity ${dur} ${ease}, border-radius ${dur} ${ease}`
                  : undefined,
              }}
            />
          )}

          {/* ── Post-expansion content (scrolls on top of the layers) ──── */}
          {isExpanded && children && (
            <div
              style={{
                position: 'relative',
                zIndex: 300,
                width: '100%',
                height: '100%',
                overflowY: 'auto',
              }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

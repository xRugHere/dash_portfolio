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
import type { ParticleConfig, LayerObjectDef, ParticleDef } from './ParallaxBackground'

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
  /** Static full-bleed image layers (original behaviour) */
  layers?: PortalLayer[]

  /* ── Scene content (background-style objects inside the portal) ──── */
  /** Background colour visible through the portal */
  bgColor?: string
  /** Particle config (stars / dust) rendered inside the portal */
  sceneParticles?: ParticleConfig
  /** Layer objects (planets / clouds) rendered inside the portal */
  sceneObjects?: LayerObjectDef[]
  /** Depth multipliers for the 3 scene layers [far, mid, close].
   *  Higher = more parallax shift with cursor. */
  layerDepths?: [number, number, number]
  /** Warp-forward scale multipliers per scene layer */
  warpScales?: [number, number, number]
  /** Target opacity per scene layer when warpZ = 1 */
  warpOpacities?: [number, number, number]
  /** 0 = idle, 1 = fully warped forward. Controls the "entering" effect. */
  warpZ?: number

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
  /**
   * Called the moment the portal is clicked (before the expand animation begins).
   * Use this to trigger navigation, audio, state changes, etc.
   */
  onPortalClick?: () => void
  /**
   * Extra CSSProperties merged into the card style while the portal is
   * expanding (both the initial-paint frame and the animated frame).
   * Drive this with React state set inside `onPortalClick` to customise
   * the expansion — e.g. filter, background, opacity, transform, etc.
   * These spread last, so they override the defaults.
   */
  expandingCardStyle?: CSSProperties
  /** Content revealed inside the fullscreen portal after expansion (scrolls on top of layers) */
  children?: ReactNode
}

/* ════════════════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════════════ */

export default function ParallaxPortal({
  layers,
  bgColor,
  sceneParticles,
  sceneObjects = [],
  layerDepths = [0.5, 0.3, 0.1],
  warpScales = [0.3, 1.5, 5.0],
  warpOpacities = [1.0, 0.3, 0.0],
  warpZ: warpZProp = 0,
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
  onPortalClick,
  expandingCardStyle,
  children,
}: ParallaxPortalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const hasScene = sceneObjects.length > 0 || !!sceneParticles

  /* ── Warp-on-click timing ──────────────────────────────────────────── */
  const warpStartRef = useRef<number | null>(null)
  const internalWarpTarget = useRef(0)
  const expandDurationRef = useRef(expandDuration)
  useEffect(() => { expandDurationRef.current = expandDuration }, [expandDuration])

  /* ── Scene particle generation ─────────────────────────────────────── */
  const [generatedParticles, setGeneratedParticles] = useState<ParticleDef[]>([])

  useEffect(() => {
    if (!sceneParticles) return
    const list: ParticleDef[] = []
    let id = 0
    sceneParticles.counts.forEach((count, layer) => {
      const [minSize, maxSize] = sceneParticles.sizes[layer]
      const [baseOp, opVar] = sceneParticles.opacities[layer]
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

  /* ── Warp tracking (smooth interpolation) ──────────────────────────── */
  const warpZRef = useRef(warpZProp)
  const currentWarpZ = useRef(0)
  useEffect(() => { warpZRef.current = warpZProp }, [warpZProp])

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

    // Drive internal warp forward from click timestamp
    if (warpStartRef.current !== null) {
      const elapsed = performance.now() - warpStartRef.current
      const t = Math.min(elapsed / expandDurationRef.current, 1)
      // ease-in curve so the rush accelerates into the portal
      internalWarpTarget.current = t * t
    }

    // Smoothly interpolate warp for scene layers (faster lerp during expansion)
    const effectiveWarpTarget = Math.max(warpZRef.current, internalWarpTarget.current)
    const warpLerp = warpStartRef.current !== null ? 0.07 : 0.02
    currentWarpZ.current += (effectiveWarpTarget - currentWarpZ.current) * warpLerp
    if (Math.abs(currentWarpZ.current - effectiveWarpTarget) < 0.001) {
      currentWarpZ.current = effectiveWarpTarget
    }

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
    // Kick off the warp-forward animation timed to the expansion
    warpStartRef.current = performance.now()
    internalWarpTarget.current = 0
    // Expose click to the consumer for custom behaviour
    onPortalClick?.()
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
     // left: '-50vw',
    //  top: '-50vh',
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
      // Consumer overrides — spread last so they win
      ...expandingCardStyle,
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

  /* ── Warp-derived values for scene layers ────────────────────────── */
  const w = currentWarpZ.current

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
          style={{
            ...cardStyle,
            backgroundColor: hasScene ? bgColor : undefined,
          }}
        >
          {/* ── Static image layers (original behaviour) ───────────────── */}
          {layers && layers.map((layer, i) => {
            const shift = layer.depth * maxOffset
            const offsetX = isExpanded ? 0 : -pos.x * shift
            const offsetY = isExpanded ? 0 : -pos.y * shift

            return (
              <div
                key={`img-${i}`}
                style={{
                  position: 'absolute',
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

          {/* ── Scene depth layers (background-style objects/particles) ── */}
          {hasScene && [0, 1, 2].map((layerIdx) => {
            const depth = layerDepths[layerIdx]
            const shift = depth * maxOffset
            const offsetX = isExpanded ? 0 : -pos.x * shift
            const offsetY = isExpanded ? 0 : -pos.y * shift

            const warpScale = 1 + w * warpScales[layerIdx]
            const warpOpacity = 1 - w * (1 - warpOpacities[layerIdx])

            const layerParticles = generatedParticles.filter((p) => p.layer === layerIdx)
            const layerObjects = sceneObjects.filter((o) => o.layer === layerIdx)

            return (
              <div
                key={`scene-${layerIdx}`}
                style={{
                  position: 'absolute',
                  left: isFixed ? `calc(-${shift}px + ${offsetX}px)` : -shift + offsetX,
                  top: isFixed ? `calc(-${shift}px + ${offsetY}px)` : -shift + offsetY,
                  width: isFixed ? `calc(100% + ${shift * 2}px)` : width + shift * 2,
                  height: isFixed ? `calc(100% + ${shift * 2}px)` : height + shift * 2,
                  zIndex: 10 + layerIdx,
                  pointerEvents: 'none',
                  willChange: 'transform',
                  transform: `scale(${warpScale})`,
                  opacity: warpOpacity,
                  transformOrigin: 'center center',
                }}
              >
                {/* Particles */}
                {sceneParticles && layerParticles.map((p) => (
                  <div
                    key={p.id}
                    className={`absolute ${sceneParticles.animationClass ?? ''}`}
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
                    <Image src={sceneParticles.src} alt="" fill className="object-contain" />
                  </div>
                ))}

                {/* Objects */}
                {layerObjects.map((obj) => {
                  const hasRot = !!obj.rotationAnimation
                  const hasSpin = !!obj.spinAnimation

                  let rotStyle: CSSProperties
                  if (hasSpin) {
                    rotStyle = { animation: `portal-spin-${obj.id} ${obj.spinAnimation!.duration}s linear infinite` }
                  } else if (hasRot) {
                    rotStyle = { animation: `portal-osc-${obj.id} ${obj.rotationAnimation!.duration * 2}s ease-in-out infinite` }
                  } else {
                    rotStyle = { transform: `rotate(${obj.rotate ?? 0}deg)` }
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
                        ...rotStyle,
                      }}
                    >
                      {hasSpin && (
                        <style>{`
                          @keyframes portal-spin-${obj.id} {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(${obj.spinAnimation!.direction === 'counter-clockwise' ? '-360' : '360'}deg); }
                          }
                        `}</style>
                      )}
                      {hasRot && (
                        <style>{`
                          @keyframes portal-osc-${obj.id} {
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

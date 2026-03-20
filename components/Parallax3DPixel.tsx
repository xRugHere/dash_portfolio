"use client"

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface LayerConfig {
  src: string
  alt?: string
}

interface Parallax3DPixelProps {
  /** Array of layer image paths, ordered from back (index 0) to front (last index) */
  layers: LayerConfig[]
  /** Width of each layer image in px */
  width?: number
  /** Height of each layer image in px */
  height?: number
  /** Vertical gap between layers in px (stacking thickness) */
  layerGap?: number
  /** Max horizontal parallax offset in px for the frontmost layer */
  maxOffsetX?: number
  /** Max vertical parallax offset in px for the frontmost layer */
  maxOffsetY?: number
  /** Whether rotation follows the mouse or uses a fixed angle */
  interactive?: boolean
  /** Fixed rotation when not interactive — normalised -1 to 1 for X and Y */
  fixedAngle?: { x: number; y: number }
}

export default function Parallax3DPixel({
  layers,
  width = 200,
  height = 200,
  layerGap = 4,
  maxOffsetX = 30,
  maxOffsetY = 20,
  interactive = true,
  fixedAngle = { x: 0, y: 0 },
}: Parallax3DPixelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Normalise mouse position to -1..1 relative to container centre
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1
      setMouse({ x, y })
    },
    [],
  )

  const handleMouseLeave = useCallback(() => {
    setMouse({ x: 0, y: 0 })
  }, [])

  const angle = interactive ? mouse : fixedAngle
  const totalLayers = layers.length
  const totalStackHeight = (totalLayers - 1) * layerGap

  return (
    <div
      ref={containerRef}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      className="relative inline-flex items-center justify-center"
      style={{
        width: width + maxOffsetX * 2,
        height: height + maxOffsetY * 2 + totalStackHeight,
        cursor: interactive ? 'crosshair' : 'default',
      }}
    >
      {layers.map((layer, i) => {
        // depth goes from 0 (backmost) to 1 (frontmost)
        const depth = totalLayers > 1 ? i / (totalLayers - 1) : 0

        // Front layers move MORE, back layers move LESS
        const offsetX = angle.x * maxOffsetX * depth
        // Y offset: front layers shift up when looking down, plus a small stack offset
        const offsetY = angle.y * maxOffsetY * depth
        // Stack offset so back layers sit behind (higher up) and front layers lower
        const stackOffset = (totalLayers - 1 - i) * layerGap

        return (
          <div
            key={i}
            className="absolute"
            style={{
              width,
              height,
              transition: interactive ? 'transform 0.1s ease-out' : undefined,
              transform: `translate(${offsetX}px, ${offsetY - stackOffset}px)`,
              zIndex: i,
              // Slight shadow on each layer to enhance depth
              filter: i < totalLayers - 1
                ? `drop-shadow(0 ${layerGap / 2}px ${layerGap}px rgba(0,0,0,0.25))`
                : 'none',
              imageRendering: 'pixelated',
            }}
          >
            <Image
              src={layer.src}
              alt={layer.alt ?? `Layer ${i}`}
              width={width}
              height={height}
              draggable={false}
              style={{ imageRendering: 'pixelated', width: '100%', height: '100%' }}
            />
          </div>
        )
      })}
    </div>
  )
}

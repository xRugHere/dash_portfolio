"use client"

import { ReactNode } from 'react'

interface FuturisticSectionProps {
  children?: ReactNode
  showTopTransition?: boolean
  showBottomTransition?: boolean
  className?: string
  minHeight?: string
}

export default function FuturisticSection({ 
  children, 
  showTopTransition = true, 
  showBottomTransition = true,
  className = '',
  minHeight = 'auto'
}: FuturisticSectionProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Top transition image (flipped) */}
      {showTopTransition && (
        <div className="relative w-full z-20">
          <img
            src="/WebPageDecorImages/PixelTrasition_Final1.png"
            alt=""
            className="w-full h-auto block"
            style={{
              minHeight: '50px',
              transform: 'scaleY(-1)', // Flip vertically
            }}
          />
        </div>
      )}

      {/* Futuristic background section */}
      <div 
        className="relative w-full"
        style={{ minHeight }}
      >
        {/* Background gradient */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(180deg, #e8eeff 0%, #f0f4ff 25%, #e8eeff 50%, #f5f0ff 75%, #e8eeff 100%)',
          }}
        >
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute rounded-full blur-[100px] animate-drift-1"
              style={{
                background: 'radial-gradient(circle, rgba(100, 200, 255, 0.3) 0%, transparent 70%)',
                width: '50vw',
                height: '50vw',
                top: '-15%',
                left: '-10%',
              }}
            />
            <div 
              className="absolute rounded-full blur-[120px] animate-drift-2"
              style={{
                background: 'radial-gradient(circle, rgba(180, 130, 255, 0.25) 0%, transparent 70%)',
                width: '45vw',
                height: '45vw',
                bottom: '-10%',
                right: '-5%',
              }}
            />
            <div 
              className="absolute rounded-full blur-[80px] animate-drift-3"
              style={{
                background: 'radial-gradient(circle, rgba(255, 150, 200, 0.2) 0%, transparent 70%)',
                width: '30vw',
                height: '30vw',
                top: '30%',
                right: '10%',
              }}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>

      {/* Bottom transition image */}
      {showBottomTransition && (
        <div className="relative w-full z-20 -mt-1">
          <img
            src="/WebPageDecorImages/PixelTrasition_Final1.png"
            alt=""
            className="w-full h-auto block"
            style={{
              minHeight: '50px',
            }}
          />
        </div>
      )}
    </div>
  )
}

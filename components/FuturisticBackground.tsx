"use client"

import { useEffect, useRef } from 'react'

export default function FuturisticBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Subtle parallax on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      containerRef.current.style.transform = `translate(${x}px, ${y}px)`
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient - white to light blue/purple */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #f0f4ff 25%, #e8eeff 50%, #f5f0ff 75%, #ffffff 100%)',
        }}
      />
      
      {/* Animated gradient orbs */}
      <div ref={containerRef} className="absolute inset-0 transition-transform duration-300 ease-out">
        {/* Large cyan/blue orb - top left */}
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
        
        {/* Purple orb - bottom right */}
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
        
        {/* Pink accent orb - center right */}
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
        
        {/* Teal accent - bottom left */}
        <div 
          className="absolute rounded-full blur-[90px] animate-drift-1"
          style={{
            background: 'radial-gradient(circle, rgba(100, 230, 220, 0.2) 0%, transparent 70%)',
            width: '35vw',
            height: '35vw',
            bottom: '10%',
            left: '5%',
            animationDelay: '-5s',
          }}
        />
      </div>

      {/* Grid pattern overlay for futuristic feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100, 150, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 150, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Circle outline - left */}
        <svg 
          className="absolute opacity-10 animate-float-slow"
          style={{ top: '40%', left: '8%', width: '80px', height: '80px', animationDelay: '-3s' }}
          viewBox="0 0 100 100"
        >
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="rgba(180, 130, 255, 0.8)" 
            strokeWidth="1"
          />
        </svg>

        {/* Triangle - bottom center */}
        <svg 
          className="absolute opacity-10 animate-float-slow"
          style={{ bottom: '20%', left: '45%', width: '60px', height: '60px', animationDelay: '-7s' }}
          viewBox="0 0 100 100"
        >
          <polygon 
            points="50,10 90,90 10,90" 
            fill="none" 
            stroke="rgba(100, 200, 255, 0.8)" 
            strokeWidth="1"
          />
        </svg>

        {/* Diamond - top center */}
        <svg 
          className="absolute opacity-10 animate-float-slow"
          style={{ top: '5%', left: '35%', width: '40px', height: '40px', animationDelay: '-2s' }}
          viewBox="0 0 100 100"
        >
          <polygon 
            points="50,5 95,50 50,95 5,50" 
            fill="none" 
            stroke="rgba(255, 150, 200, 0.8)" 
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

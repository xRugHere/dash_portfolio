"use client"

import { useEffect, useRef, useState, ReactNode, Children } from 'react'

interface SequentialFadeInProps {
  children: ReactNode
  staggerDelay?: number // Delay in ms between each child
  initialDelay?: number // Initial delay in ms before first child starts
  className?: string
}

export default function SequentialFadeIn({ 
  children, 
  staggerDelay = 3,
  initialDelay = 0,
  className = ''
}: SequentialFadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  const childArray = Children.toArray(children)

  return (
    <div ref={containerRef} className={`flex flex-wrap items-center justify-center gap-25 ${className}`}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className="transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: isVisible ? `${initialDelay + (index * staggerDelay)}ms` : '0ms',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

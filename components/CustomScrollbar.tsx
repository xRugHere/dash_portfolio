"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

export default function CustomScrollbar() {
  const [thumbHeight, setThumbHeight] = useState(0)
  const [thumbTop, setThumbTop] = useState(0)
  const [visible, setVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const dragStartScroll = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateThumb = useCallback(() => {
    const doc = document.documentElement
    const viewportHeight = window.innerHeight
    const totalHeight = doc.scrollHeight

    if (totalHeight <= viewportHeight) {
      setVisible(false)
      return
    }

    const trackHeight = viewportHeight - 16 // 8px padding top + bottom
    const ratio = viewportHeight / totalHeight
    const newThumbHeight = Math.max(ratio * trackHeight, 30)
    const scrollRatio = doc.scrollTop / (totalHeight - viewportHeight)
    const newThumbTop = scrollRatio * (trackHeight - newThumbHeight)

    setThumbHeight(newThumbHeight)
    setThumbTop(newThumbTop)
    setVisible(true)
  }, [])

  // Show scrollbar on scroll, then fade after idle
  const handleScroll = useCallback(() => {
    updateThumb()

    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (!isDragging && !isHovered) {
        setVisible(false)
      }
    }, 1500)
  }, [updateThumb, isDragging, isHovered])

  useEffect(() => {
    updateThumb()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateThumb)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateThumb)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [handleScroll, updateThumb])

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartY.current = e.clientY
    dragStartScroll.current = document.documentElement.scrollTop
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const trackHeight = window.innerHeight - 16
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const deltaY = e.clientY - dragStartY.current
      const scrollDelta = (deltaY / (trackHeight - thumbHeight)) * scrollableHeight
      window.scrollTo(0, dragStartScroll.current + scrollDelta)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, thumbHeight])

  // Click on track to jump to position
  const handleTrackClick = (e: React.MouseEvent) => {
    if (e.target !== trackRef.current) return
    const rect = trackRef.current!.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const trackHeight = rect.height
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollTo = (clickY / trackHeight) * scrollableHeight
    window.scrollTo({ top: scrollTo, behavior: 'smooth' })
  }

  const showBar = visible || isDragging || isHovered

  return (
    <div
      ref={trackRef}
      className="fixed top-2 right-1 bottom-2 w-1.5 z-[9998] transition-opacity duration-300"
      style={{
        opacity: showBar ? 1 : .2,
        pointerEvents: showBar ? 'auto' : 'none',
        cursor: "url('/images/Pointer_Final.png'), pointer",
      }}
      onClick={handleTrackClick}
      onMouseEnter={() => {
        setIsHovered(true)
        setVisible(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        if (!isDragging) {
          hideTimer.current = setTimeout(() => setVisible(false), 1000)
        }
      }}
    >
      {/* Thumb */}
      <div
        className="absolute left-0 w-full transition-[width,left] duration-150"
        style={{
          top: `${thumbTop}px`,
          height: `${thumbHeight}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <Image
          src="/images/ScrollbarImage1.png"
          alt=""
          fill
          className="object-cover rounded-sm"
          style={{
            imageRendering: 'pixelated',
            opacity: isDragging ? 1 : isHovered ? 0.85 : 0.6,
            transition: 'opacity 200ms',
          }}
          draggable={false}
        />
      </div>
    </div>
  )
}

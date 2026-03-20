"use client"

import { useState } from 'react'
import Image from 'next/image'

interface HorizontalImageScrollProps {
  images: (string | { type: 'youtube', videoId: string })[]
  title?: string
}

export default function HorizontalImageScroll({ images, title }: HorizontalImageScrollProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Duplicate images for seamless loop - using more duplications for smoother loop
  const duplicatedImages = [...images, ...images, ...images, ...images]

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="rounded-lg transition-all duration-300 w-screen relative left-1/2 -translate-x-1/2">
        {/* Horizontal scrolling container */}
        <div className="relative">
          <div 
            className="relative w-full h-60 overflow-hidden flex items-center"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 35%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%, black 85%, transparent 100%)',
            }}
          >
            <div 
              className="flex gap-10 absolute left-0"
              style={{
                animation: 'scrollHorizontal 60s linear infinite',
                animationPlayState: 'running',
              }}
            >
              {duplicatedImages.map((item, idx) => {
                const isYouTube = typeof item === 'object' && item.type === 'youtube'
                const img = typeof item === 'string' ? item : ''
                const isVideo = typeof item === 'string' && (item.toLowerCase().endsWith('.mp4') || item.toLowerCase().endsWith('.webm') || item.toLowerCase().endsWith('.mov'))
                const isGif = typeof item === 'string' && item.toLowerCase().endsWith('.gif')
                
                return (
                  <div
                    key={idx}
                    className="flex-shrink-0 relative h-40 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 drop-shadow-2xl/50"
                    style={{ width: isYouTube ? '455px' : 'auto', minWidth: isYouTube ? '455px' : '200px', maxWidth: '500px' }}
                    onClick={!isYouTube ? () => openModal(idx % images.length) : undefined}
                  >
                    {isYouTube ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${item.videoId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : isVideo ? (
                      <video
                        src={img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-auto object-contain cursor-pointer"
                      />
                    ) : isGif ? (
                      <img
                        src={img}
                        alt={`${title || 'Image'} ${(idx % images.length) + 1}`}
                        className="h-full w-auto object-contain cursor-pointer"
                      />
                    ) : (
                      <div className="relative h-full w-full cursor-pointer">
                        <Image
                          src={img}
                          alt={`${title || 'Image'} ${(idx % images.length) + 1}`}
                          width={500}
                          height={256}
                          className="h-full w-auto object-contain"
                          style={{ height: '100%', width: 'auto' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for image viewing */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#030306] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-50"
            onClick={closeModal}
          >
            ×
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              className="absolute left-4 text-white text-5xl hover:text-gray-300 hover:scale-110 transition-transform z-50"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              ‹
            </button>
          )}

          {/* Current image */}
          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] : ''}
              alt={`${title || 'Image'} ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              className="absolute right-4 text-white text-5xl hover:text-gray-300 hover:scale-110 transition-transform z-50"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              ›
            </button>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}

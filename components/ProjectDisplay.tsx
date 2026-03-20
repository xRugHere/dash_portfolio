"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import localFont from 'next/font/local'

const lunarLocal = localFont({
  src: [
    {
      path: '../public/fonts/PixelFont.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
})

interface ProjectDisplayProps {
  title: string
  description: string
  secondDescription?: string
  images: string[]
  date?: string
  imagePosition?: 'left' | 'right'
  features?: string[]
}

export default function ProjectDisplay({ title, description, secondDescription, images, date, imagePosition = 'left', features }: ProjectDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images, ...images]

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
      <div className={`flex flex-col md:flex-row gap-8 p-6 transition-all duration-300 ${imagePosition === 'right' ? 'md:flex-row-reverse' : ''}`}>
        {/* Scrolling images */}
        <div className="md:w-1/3 flex-shrink-0 relative h-[350px] overflow-hidden">
          <div className="relative h-full px-4 py-6">
            <div 
              className="flex flex-col gap-4 animate-scroll-vertical"
              style={{
                animation: 'scrollVertical 45s linear infinite'
              }}
            >
              {duplicatedImages.map((img, idx) => {
                const isVideo = img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm') || img.toLowerCase().endsWith('.mov')
                const isGif = img.toLowerCase().endsWith('.gif')
                
                return (
                  <div key={idx} className="relative">
                    <div
                      className="flex justify-center relative w-full h-40 cursor-pointer overflow-hidden transition-transform duration-200"
                      onClick={() => openModal(idx % images.length)}
                    >
                    {isVideo ? (
                      <video
                        src={img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : isGif ? (
                      <img
                        src={img}
                        alt={`${title} image ${(idx % images.length) + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={img}
                        alt={`${title} image ${(idx % images.length) + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                    {/* Vignette effect to simulate border shadow */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
                        zIndex: 10
                      }}
                    ></div>
                    </div>
                    {/* Border overlay - sits on top of content */}
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderStyle: 'solid',
                        borderWidth: '5px',
                        borderImage: 'url(/images/ImageBorder.png) 5 stretch',
                        filter: 'brightness(0.15) sepia(20%) saturate(200%) hue-rotate(210deg)',
                        zIndex: 100
                      }}
                    />

                    {/* Bottom strip for raised 3D effect */}
                    <div className="w-full h-[5px] bg-black/80" />
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Gradient fade overlays - on outer container */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--background)] to-transparent pointer-events-none z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Title and description */}
        <div className={`md:w-2/3 flex flex-col justify-center ${imagePosition === 'right' ? 'text-right items-end' : ''}`}>
          {date && (
            <p className={`text-gray-500 text-[.55rem] mb-2 ${lunarLocal.className}`}>{date}</p>
          )}
          <h3 className={`text-md md:text-md mb-4 ${lunarLocal.className}`}>{title}</h3>
          <p className={`text-gray-400 text-[.65rem] mb-4 leading-5.5 ${lunarLocal.className}`}>{description}</p>
          
          {features && features.length > 0 && (
            <div className={`mb-4 ${imagePosition === 'right' ? 'text-right' : ''}`}>
              <h4 className={`text-gray-300 text-[.7rem] mb-2 ${lunarLocal.className}`}>Features:</h4>
              <ul className={`space-y-1 ${imagePosition === 'right' ? 'text-right' : ''}`}>
                {features.map((feature, idx) => (
                  <li key={idx} className={`text-gray-400 text-[.60rem] ${lunarLocal.className}`}>
                    • {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className={`text-gray-500 text-[.60rem] leading-5.5 ${lunarLocal.className}`}>{secondDescription}</p>
        </div>
      </div>

      {/* Modal for image viewing */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
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
              src={images[currentImageIndex]}
              alt={`${title} image ${currentImageIndex + 1}`}
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

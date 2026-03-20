"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

interface ProjectCardProps {
  title: string
  thumbnail: string
  description: string
  secondDescription?: string
  images: string[]
  date?: string
  features?: string[]
}

export default function ProjectCard({ 
  title, 
  thumbnail, 
  description, 
  secondDescription, 
  images, 
  date, 
  features 
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [modalEntering, setModalEntering] = useState(false)
  const [modalExiting, setModalExiting] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const hoverSoundRef = useRef<HTMLAudioElement>(null)
  const clickSoundRef = useRef<HTMLAudioElement>(null)

  // Lock body scroll when any modal is open (compensate for scrollbar width to prevent layout shift)
  useEffect(() => {
    if (isProjectModalOpen || isModalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isProjectModalOpen, isModalOpen])

  // Entrance tween for project modal
  useEffect(() => {
    if (isProjectModalOpen) {
      setModalExiting(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setModalEntering(true)
        })
      })
    } else {
      setModalEntering(false)
    }
  }, [isProjectModalOpen])

  // Close with exit animation
  const closeProjectModal = () => {
    setModalExiting(true)
    setModalEntering(false)
    setTimeout(() => {
      setModalExiting(false)
      setIsProjectModalOpen(false)
    }, 500)
  }

  // Auto-cycle gallery carousel
  useEffect(() => {
    if (!isProjectModalOpen) return
    const interval = setInterval(() => {
      setGalleryIndex(prev => prev + 1)
    }, 4000)
    return () => clearInterval(interval)
  }, [isProjectModalOpen])

  const isVideo = (src: string) => {
    return src?.toLowerCase().endsWith('.mp4') || src?.toLowerCase().endsWith('.webm') || src?.toLowerCase().endsWith('.mov')
  }

  const isGif = (src: string) => {
    return src?.toLowerCase().endsWith('.gif')
  }

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
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4));
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }
      `}} />
      <div className="relative">
        {/* Card Container with border */}
        <div 
          className="z-50 relative transition-all duration-300"
          onClick={() => {
            if (clickSoundRef.current) {
              clickSoundRef.current.currentTime = 0
              clickSoundRef.current.playbackRate = 1 // Random between 1.0-1.4
              clickSoundRef.current.volume = .2
              clickSoundRef.current.play().catch(() => {})
            }
            setGalleryIndex(0)
            setModalExiting(false)
            setIsProjectModalOpen(true)
          }}
          style={{
            transform: isHovered ? 'translateY(-8px)' : 'translateY(0px)',
            cursor: "url('/images/Pointer_Final.png'), pointer"
          }}
        >
          {/* Wrapper for image and border only */}
          <div className="relative overflow-visible">
            {/* Card Image - Fixed Height */}
            <div 
              className="relative w-full h-64 overflow-hidden transition-all duration-300"
              style={{ zIndex: 1 }}
              onMouseEnter={() => {
                setIsHovered(true)
                if (hoverSoundRef.current) {
                  hoverSoundRef.current.currentTime = 0
                  hoverSoundRef.current.playbackRate = 4.5 + Math.random() * 1.0 // Random between 4.5-5.5
                  hoverSoundRef.current.volume = .6
                  hoverSoundRef.current.play().catch(() => {})
                }
              }}
              onMouseLeave={() => {
                setIsHovered(false)
              }}
            >
            {isVideo(thumbnail) ? (
              <video
                src={thumbnail}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : isGif(thumbnail) ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            
            {/* Vignette effect to simulate border shadow */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.8) 100%)',
                zIndex: 10
              }}
            ></div>
            
            {/* Hover Overlay - Darkening effect with text */}
            <div 
              className="absolute inset-0 bg-black transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ opacity: isHovered ? 0.5 : 0, zIndex: 15 }}
            ></div>
            
            {/* "click to view more" text */}
            <div 
              className={`absolute inset-0 flex items-center justify-center ${lunarLocal.className}`}
              style={{ zIndex: 20 }}
            >
              <p 
                className="text-white text-[20px] uppercase tracking-wider transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ opacity: isHovered ? 1 : 0 }}
              >
                click to vieW more
              </p>
            </div>
            
            {/* Arrow at bottom center */}
            <div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ opacity: isHovered ? 1 : 0, zIndex: 20 }}
            >
              <div 
                className="w-12 h-12 relative transition-transform duration-300 animate-bounce"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <Image
                  src="/images/arrow.png"
                  alt="arrow"
                  fill
                  className="object-contain "
                  style={{ transform: 'rotate(90deg)' }}
                />
              </div>
            </div>

            {/* Frosted glass overlay for title and date */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/0 backdrop-blur-[.5px] border-t border-white/0" style={{ zIndex: 10 }}></div>
            <div className={`absolute top-0 left-0 right-0 p-7 ${lunarLocal.className}`} style={{ zIndex: 25 }}>
              <h3 className="text-2xl text-white drop-shadow-[4px_4px_4px_rgba(0,0,0,0.5)] relative z-10">{title}</h3>
              {date && (
                <p className="text-xl/2 text-gray-400 mt-2 uppercase drop-shadow-[4px_4px_4px_rgba(0,0,0,0.6)] tracking-wider relative z-10">{date}</p>
              )}
            </div>
          </div>
          
          {/* Border overlay - sits on top of content, only on image section
          <div 
            className="absolute top-0 left-0 right-0  pointer-events-none transition-all duration-700"
            style={{
              height: '264px',
              borderStyle: 'solid',
              borderWidth: '18px',
              borderImage: 'url(/images/ImageBorder3.png) 22 stretch',
              filter: 'brightness(0.25) sepia(20%) saturate(300%) hue-rotate(200deg) drop-shadow(0 0 8px rgba(0, 0, 0, 1))',
              zIndex: 100
            }}
          /> */}
          
          {/* Darker bottom strip for raised 3D effect - extends below the card */}
          {/* <div 
            className="w-full h-[6px] bg-black/80 transition-all duration-300"
          /> */}
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {(isProjectModalOpen || modalExiting) && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={closeProjectModal}
          style={{
            backgroundColor: (modalEntering && !modalExiting) ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)',
            transition: 'background-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div 
            className="relative bg-black/80 backdrop-blur-sm border-2 border-white/20 rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: (modalEntering && !modalExiting) ? 'translateY(0)' : 'translateY(50px)',
              opacity: (modalEntering && !modalExiting) ? 1 : 0,
              transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Scrollable content area */}
            <div className="overflow-y-auto flex-1 p-8 custom-scrollbar">

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Title and Date */}
              <div className={lunarLocal.className}>
                <h2 className="text-3xl text-white mb-2">{title}</h2>
                {date && (
                  <p className="text-xl text-gray-400 uppercase tracking-wider">{date}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className={`text-[23px] font-medium text-gray-300 ${lunarLocal.className}`}>Description</h4>
                <p className={`leading-5.5 text-gray-400 ${lunarLocal.className} text-[20px]`}>{description}</p>
              </div>

              {/* Features */}
              {features && features.length > 0 && (
                <div>
                  <h4 className={`text-[23px] font-medium text-gray-300 mb-2 ${lunarLocal.className}`}>Features</h4>
                  <ul className={`list-none text-gray-400 text-[20px] leading-6 ${lunarLocal.className}`}>
                    {features.map((feature, idx) => (
                      <li key={idx}>&nbsp;|&gt; {feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Image Gallery Carousel */}
              <div>
                <h4 className={`text-[23px] font-medium mb-4 text-gray-300 ${lunarLocal.className}`}>project gallery</h4>
                <div 
                  className="relative h-56 overflow-hidden"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
                  }}
                >
                  {(() => {
                    const slots: { v: number; imgIdx: number; offset: number }[] = []
                    for (let v = galleryIndex - 3; v <= galleryIndex + 3; v++) {
                      const imgIdx = ((v % images.length) + images.length) % images.length
                      const offset = v - galleryIndex
                      slots.push({ v, imgIdx, offset })
                    }
                    return slots.map(({ v, imgIdx, offset }) => {
                      const absOffset = Math.abs(offset)
                      const scale = absOffset === 0 ? 1.05 : absOffset === 1 ? 0.82 : absOffset === 2 ? 0.68 : 0.55
                      const itemOpacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.55 : absOffset === 2 ? 0.3 : 0
                      const zIndex = 10 - absOffset
                      const translateX = offset * 240
                      const img = images[imgIdx]
                      return (
                        <div
                          key={v}
                          className="absolute top-1/2 left-1/2 overflow-hidden rounded-lg"
                          style={{
                            transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                            opacity: itemOpacity,
                            zIndex,
                            transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                            width: '300px',
                            height: '200px',
                            cursor: "url('/images/Pointer_Final.png'), pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            openModal(imgIdx)
                          }}
                        >
                          {isVideo(img) ? (
                            <video src={img} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : isGif(img) ? (
                            <img src={img} alt={`${title} ${imgIdx + 1}`} className="w-full h-full object-cover" />
                          ) : (
                            <Image src={img} alt={`${title} ${imgIdx + 1}`} fill className="object-cover" />
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

              {/* Published Games */}
              {secondDescription && (
                <div>
                  <h4 className={`text-[23px] font-medium text-gray-300 ${lunarLocal.className}`}>Published games</h4>
                  <p className={`leading-5.5 text-gray-400 ${lunarLocal.className} text-[20px]`}>{secondDescription}</p>
                </div>
              )}
            </div>
            </div>

            {/* Close Button - bottom of modal with inset margin */}
            <div className="px-4 pb-4 pt-3 shrink-0">
              <button 
                onClick={closeProjectModal}
                className="w-full py-3 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10 hover:border-red-500/50"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220,38,38,0.6) 0%, rgba(185,28,28,0.4) 100%)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(220,38,38,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                <svg className="w-7 h-7 text-white/70 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Modal */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="relative max-w-4xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            {isVideo(images[currentImageIndex]) ? (
              <video
                src={images[currentImageIndex]}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : isGif(images[currentImageIndex]) ? (
              <img
                src={images[currentImageIndex]}
                alt={`${title} screenshot ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Image
                src={images[currentImageIndex]}
                alt={`${title} screenshot ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Hidden Audio Elements for sounds */}
      <audio ref={hoverSoundRef} preload="auto">
        <source src="/sounds/Hover.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={clickSoundRef} preload="auto">
        <source src="/sounds/Click1.mp3" type="audio/mpeg" />
      </audio>
    </>
  )
}

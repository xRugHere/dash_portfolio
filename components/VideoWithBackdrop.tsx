import Image from 'next/image'

interface VideoWithBackdropProps {
  imageSrc: string
  videoSrc: string
  imageAlt?: string
  className?: string
  videoOpacity?: number
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  backgroundColor?: string
}

export default function VideoWithBackdrop({
  imageSrc,
  videoSrc,
  imageAlt = "Background",
  className = "",
  videoOpacity = 100,
  autoPlay = true,
  loop = true,
  muted = true,
  backgroundColor = "#000000",
}: VideoWithBackdropProps) {
  return (
    <div className={`relative shadow-2xl/200 w-[270px] h-[150px] ${className}`}>
      {/* Video on top */}
      <video
        className="relative z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[315px] h-[150px] object-cover"
        style={{ imageRendering: 'pixelated', opacity: videoOpacity / 100 }}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Background Image - 10px below video */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-16 w-full h-[150px]"
        style={{  imageRendering: 'pixelated', backgroundColor }}
      >
      </div>
    </div>
  )
}

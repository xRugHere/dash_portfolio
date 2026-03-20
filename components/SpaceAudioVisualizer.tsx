"use client"

import { useEffect, useRef } from 'react'

export default function SpaceAudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  const initAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audioRef.current)

    analyser.fftSize = 128
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    audioContextRef.current = audioContext
    analyserRef.current = analyser
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
  }

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dataArray = dataArrayRef.current
    analyserRef.current.getByteFrequencyData(dataArray as any)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Use fewer bars for wider spacing, thicker lines
    const totalBars = 24
    const gap = canvas.width / totalBars
    const thickness = 1.5

    ctx.fillStyle = '#ffffff'

    for (let i = 0; i < totalBars; i++) {
      const dataIndex = Math.floor((i / totalBars) * dataArray.length)
      const barHeight = (dataArray[dataIndex] / 255) * canvas.height * 0.7
      const x = i * gap + (gap - thickness) / 2

      // Bars grow upward from the bottom (the line)
      ctx.fillRect(x, canvas.height - barHeight, thickness, barHeight)
    }

    animationRef.current = requestAnimationFrame(drawVisualizer)
  }

  const startAudio = async () => {
    if (!audioRef.current || startedRef.current) return

    try {
      initAudioContext()

      // Resume context if it was suspended (browser autoplay policy)
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      audioRef.current.volume = .3
      await audioRef.current.play()
      startedRef.current = true
      drawVisualizer()
    } catch {
      // Autoplay blocked — will retry on user interaction
    }
  }

  useEffect(() => {
    startAudio()

    const handleInteraction = () => {
      if (startedRef.current) {
        document.removeEventListener('click', handleInteraction)
        document.removeEventListener('keydown', handleInteraction)
        document.removeEventListener('mousedown', handleInteraction)
        document.removeEventListener('touchstart', handleInteraction)
        document.removeEventListener('scroll', handleInteraction)
        return
      }
      startAudio()
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)
    document.addEventListener('mousedown', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    document.addEventListener('scroll', handleInteraction, { once: true })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      document.removeEventListener('mousedown', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('scroll', handleInteraction)
    }
  }, [])

  return (
    <>
      {/* Tiny visualizer indicator in bottom right */}
      <div className="fixed z-50 bottom-2 right-4 pointer-events-none" style={{ transform: 'rotate(270deg)'}}>
        <canvas
          ref={canvasRef}
          width={80}
          height={80}
          className="opacity-100"
        />
        <div className="bg-white w-15 h-0.5 mt-1"></div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/music/space-ambience.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  )
}

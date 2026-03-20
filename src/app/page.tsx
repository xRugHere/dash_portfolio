"use client"

import Image from 'next/image'
import SocialLinks from '../../components/SocialLinks'
import PixelArtDisplay from '../../components/PixelArtDisplay'
import IntroCard from '../../components/IntroCard'
import ScrollFadeIn from '../../components/ScrollFadeIn'
import Parallax3DPixel from '../../components/Parallax3DPixel'
import localFont from 'next/font/local'
import ProjectCard from '../../components/ProjectCard'
import SequentialFadeIn from '../../components/SequentialFadeIn'
import { useTheme } from '../../components/ThemeContext'
import { useEffect } from 'react'

const lunarLocal = localFont({
  src: [
    {
      path: '../../public/fonts/PixelFont.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
})

function makePlaceholderLayer(color: string, size: number, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="monospace" font-size="14" fill="white">${label}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const PLACEHOLDER_LAYERS = [
  { src: makePlaceholderLayer('#1e293b', 200, 'Back'), alt: 'Back layer' },
  { src: makePlaceholderLayer('#334155', 200, 'Mid-Back'), alt: 'Mid-back layer' },
  { src: makePlaceholderLayer('#475569', 200, 'Middle'), alt: 'Middle layer' },
  { src: makePlaceholderLayer('#64748b', 200, 'Mid-Front'), alt: 'Mid-front layer' },
  { src: makePlaceholderLayer('#94a3b8', 200, 'Front'), alt: 'Front layer' },
]

export default function Home(){
  const { setScrollY } = useTheme()

  // Show navbar after mount
  // useEffect(() => {
  //   setShowNavbar(true)
  // }, [setShowNavbar])

  // Track scroll position and update theme context for space background parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollY])

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* FUTURISTIC SECTION - Top of page (no top transition since it's at the start) */}
        <div className="pt-24 pb-16">
          <ScrollFadeIn delay={500}>
            <IntroCard 
              imageSrc="/images/StudioCard2.png"
              imagePosition="left"
              imageSize={200}
              title="welcome!"
              description="I create custom pixel art, 3D models, and interactive experiences. Specializing in retro-inspired designs with a modern twist."
            />
          </ScrollFadeIn>
          
          {/* PROGRAMMING LANGUAGE ICONS */}
          <ScrollFadeIn delay={550}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px'}}>
              <PixelArtDisplay
                imageSrc="/images/cppLogo.png"
                imageScale={0.55}
                rotationAmount={2}
                rotationDuration={5.1}
                animationDelay={0}
                text="C++"
              />
              <PixelArtDisplay
                imageSrc="/images/javaLogo2.png"
                imageScale={0.55}
                rotationAmount={2}
                rotationDuration={5.3}
                animationDelay={0.2}
                text="Java"
              />
              <PixelArtDisplay
                imageSrc="/images/goLogo.png"
                imageScale={0.55}
                rotationAmount={2}
                rotationDuration={5.0}
                animationDelay={0.4}
                text="Go"
              />
              <PixelArtDisplay
                imageSrc="/images/pythonLogo.png"
                imageScale={0.55}
                rotationAmount={2}
                rotationDuration={5.2}
                animationDelay={0.6}
                text="Python"
              />
              <PixelArtDisplay
                imageSrc="/images/tsLogo.png"
                imageScale={0.55}
                rotationAmount={2}
                rotationDuration={5.4}
                animationDelay={0.8}
                text="TypeScript"
              />
              <PixelArtDisplay
                imageSrc="/images/jsLogo.png"
                imageScale={0.55}
                rotationAmount={2}
                rotationDuration={5.4}
                animationDelay={0.8}
                text="JavaScript"
              />
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={600}>
            <PixelArtDisplay 
              initialRotation={7}
              rotationAmount={4}
              rotationDuration={4}
              animationDelay={1}
              text='#TEST PIXEL ART#'
            />
          </ScrollFadeIn>

          <SequentialFadeIn staggerDelay={200} initialDelay={200}>
            <PixelArtDisplay 
              imageSrc="/images/Island.png"
              initialRotation={0}
              rotationAmount={2}
              rotationDuration={5.9}
              animationDelay={0}
              imageScale={1}
              text='Roblox'
              onClick={() => scrollToSection('roblox-section')}
            />
            <PixelArtDisplay 
              imageSrc="/images/linkedinlogo.png"
              initialRotation={0}
              rotationAmount={2}
              rotationDuration={6.2}
              animationDelay={0}
              imageScale={1}
              text='3D Modeling'
              onClick={() => scrollToSection('3d-modeling-section')}
            />
            <PixelArtDisplay 
              imageSrc="/images/githublogo.png"
              initialRotation={0}
              rotationAmount={2}
              rotationDuration={6.1}
              animationDelay={0}
              imageScale={1}
              text='Pixel Art'
              onClick={() => scrollToSection('pixel-art-section')}
            />
            <PixelArtDisplay 
              imageSrc="/images/lunarcrestlogo.png"
              initialRotation={0}
              rotationAmount={2}
              rotationDuration={6}
              animationDelay={0}
              text='Commissions'
              onClick={() => scrollToSection('commissions-section')}
            />
          </SequentialFadeIn>
        </div>

      {/* ROBLOX SECTION */}
      <section id="roblox-section" className="min-h-screen w-full py- flex flex-col items-center">
        <ScrollFadeIn>
          <h2 className={`text-2xl md:text-[40px] text-center mb-10 ${lunarLocal.className}`}>Roblox Projects</h2>
        </ScrollFadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[60%] px-4">
          <ScrollFadeIn delay={300}>
            <ProjectCard
              title="Advanced Status Effect System"
              thumbnail="/videos/FireStatus.mp4"
              description="A comprehensive OOP driven status effect framework for RPG games, enabling unique interactions between multiple custom effects. Includes over 40 built-in effects and 100+ synergies, with an easy-to-use API for developers to create and integrate their own effects seamlessly."
              secondDescription='Lunarcrest, Descent, SKIP - [all platforms], Cursefire II'
              images={['/images/statusEffect.png', '/videos/FireStatus.mp4', '/images/ModelsThumbnail.jpg', '/images/robloxPixelImage.png']}
              date="March 2025"
              features={['efficient data management', 'custom visual effects', 'over 40+ effects / 100+ effect synergies', 'dynamic UI', 'easy integration into existing projects', 'easy creation of custom effects/synergies']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <ProjectCard
              title="Multi-Platform Rock Skipping Minigame"
              thumbnail="/videos/MainMenuShowcase.mp4"
              description="A fun and engaging rock skipping minigame framework that works with PC, console, mobile, and VR. Features realistic physics, customizable rocks, multiple game modes, and an intuitive control system designed for all platforms. "
              secondDescription='SKIP - all platforms'
              images={['/images/RockCustomizer.png', '/images/codeThumbnail2.jpg', '/images/buildGIF1.gif', '/images/robloxPixelImage.png']}
              date='June 2025'
              features={['Available on all platforms (mobile, console, pc, vr)', 'Customizable rock decorations', 'Power and angle control', 'Explore and Race modes', 'Strict anti-cheat']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <ProjectCard
              title="Card Collection Module"
              thumbnail="/videos/CardViewerShowcase1.mp4"
              description="A combination of UI and backend systems that allow players to collect, view, and manage a collection of cards within a game. Features include dynamic card rendering, sorting/filtering options, and integration with in-game rewards."
              secondDescription='SKIP - all platforms'
              images={['/videos/CardVeiwerShowcase1.mp4', '/videos/CardGameShowcase.mp4', '/images/CardShopShowcase1.png', '/images/CardDisplay1.png']}
              date='June 2025'
              features={['Available on all platforms (mobile, console, pc, vr)', 'Customizable rock decorations', 'Power and angle control', 'Explore and Race modes', 'Strict anti-cheat']}
            />
          </ScrollFadeIn>
        </div>

        {/* Parallax 3D Pixel Test */}
        <ScrollFadeIn delay={200}>
          <div className="flex flex-col items-center mt-12">
            <h3 className={`text-xl mb-4 text-center ${lunarLocal.className}`}>3D Pixel Parallax Test</h3>
            <Parallax3DPixel
              layers={PLACEHOLDER_LAYERS}
              width={200}
              height={200}
              layerGap={6}
              maxOffsetX={30}
              maxOffsetY={20}
            />
          </div>
        </ScrollFadeIn>
      </section>

      {/* 3D MODELING SECTION */}
      <section id="3d-modeling-section" className="min-h-screen w-full py-16 flex flex-col items-center">
        <ScrollFadeIn>
          <h2 className={`text-2xl md:text-[40px] text-center mb-10 ${lunarLocal.className}`}>3D Modeling</h2>
        </ScrollFadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-2xl px-4">
          <ScrollFadeIn delay={200}>
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">3D modeling projects coming soon...</p>
              <p className="mt-2">Add your 3D models and renders here</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* PIXEL ART SECTION */}
      <section id="pixel-art-section" className="min-h-screen w-full py-16 flex flex-col items-center">
        <ScrollFadeIn>
          <h2 className={`text-2xl md:text-[40px] text-center mb-10 ${lunarLocal.className}`}>Pixel Art</h2>
        </ScrollFadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-2xl px-4">
          <ScrollFadeIn delay={200}>
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">Pixel art gallery coming soon...</p>
              <p className="mt-2">Add your pixel art creations here</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* COMMISSIONS SECTION */}
      <section id="commissions-section" className="min-h-screen w-full py-16 flex flex-col items-center">
        <ScrollFadeIn>
          <h2 className={`text-2xl md:text-[40px] text-center mb-10 ${lunarLocal.className}`}>Commissions</h2>
        </ScrollFadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-2xl px-4">
          <ScrollFadeIn delay={200}>
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">Commission information coming soon...</p>
              <p className="mt-2">Pricing, availability, and examples</p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* CONTACT SECTION - Bottom of page */}
      <section className="relative w-full py-16">
        <div className="relative z-10">
          <ScrollFadeIn delay={200}>
            <SocialLinks />
          </ScrollFadeIn>
        </div>
      </section>
    </>
  )
}
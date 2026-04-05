"use client"

import SocialLinks from '../../components/SocialLinks'
import PixelArtDisplay from '../../components/PixelArtDisplay'
import ScrollFadeIn from '../../components/ScrollFadeIn'
import localFont from 'next/font/local'
import ProjectCard from '../../components/ProjectCard'
import SequentialFadeIn from '../../components/SequentialFadeIn'
import { useTheme } from '../../components/ThemeContext'
import LiveStatsRibbon from '../../components/LiveStatsRibbon'
import ThemePage from '../../components/ThemePage'
import { useEffect } from 'react'
import SectionPage from '../../components/SectionPage'
import { useSection } from '../../components/SectionContext'

const lunarLocal = localFont({
  src: [{ path: '../../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

/* ════════════════════════════════════════════════════════════════════════
   SPACE THEME — dashboard, intro, language icons, nav, portal, socials
   ════════════════════════════════════════════════════════════════════ */
function SpaceThemeLayout() {
  const { switchSection } = useSection()
  const { setWarpXY, setWarpZ } = useTheme()

  return (
    <>
      <LiveStatsRibbon />

      <div className="pt-24 pb-16">
        {/* Programming language icons */}
        <ScrollFadeIn delay={550}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <PixelArtDisplay imageSrc="/images/cppLogo.png" imageScale={0.55} rotationAmount={2} rotationDuration={5.1} animationDelay={0} text="C++" />
            <PixelArtDisplay imageSrc="/images/javaLogo2.png" imageScale={0.55} rotationAmount={2} rotationDuration={5.3} animationDelay={0.2} text="Java" />
            <PixelArtDisplay imageSrc="/images/goLogo.png" imageScale={0.55} rotationAmount={2} rotationDuration={5.0} animationDelay={0.4} text="Go" />
            <PixelArtDisplay imageSrc="/images/pythonLogo.png" imageScale={0.55} rotationAmount={2} rotationDuration={5.2} animationDelay={0.6} text="Python" />
            <PixelArtDisplay imageSrc="/images/tsLogo.png" imageScale={0.55} rotationAmount={2} rotationDuration={5.4} animationDelay={0.8} text="TypeScript" />
            <PixelArtDisplay imageSrc="/images/jsLogo.png" imageScale={0.55} rotationAmount={2} rotationDuration={5.4} animationDelay={0.8} text="JavaScript" />
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay={600}>
          <PixelArtDisplay initialRotation={7} rotationAmount={4} rotationDuration={4} animationDelay={1} text="#TEST PIXEL ART#" />
        </ScrollFadeIn>

        {/* Navigation icons — clicking switches theme */}
        <SequentialFadeIn staggerDelay={200} initialDelay={200}>
          <PixelArtDisplay
            imageSrc="/images/Island.png"
            rotationAmount={2}
            rotationDuration={5.9}
            imageScale={1}
            text="Earth Theme" 
            onClick={() => {
              setWarpZ(65);
              setWarpXY(80, 20);
              switchSection('projects');
            }}
         />
          <PixelArtDisplay
            imageSrc="/images/Island.png"
            rotationAmount={2}
            rotationDuration={5.9}
            imageScale={1}
            text="Space Theme" 
            onClick={() => {
              switchSection('main');
              setWarpZ(0);
              setWarpXY(80, 20);
            }}
         />
        </SequentialFadeIn>
      </div>

      {/* Earth portal — rendered from parent to persist during cinematic */}
      <ScrollFadeIn delay={200}>
        <div className="flex flex-col items-center mt-12">
        </div>
      </ScrollFadeIn>

      {/* Socials */}
      <section className="relative w-full py-16">
        <ScrollFadeIn delay={200}>
          <SocialLinks />
        </ScrollFadeIn>
      </section>
    </>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   EARTH THEME — projects, commissions, 3D modeling, pixel art
   ════════════════════════════════════════════════════════════════════ */
function EarthThemeLayout() {
  const { switchTheme } = useTheme()

  return (
    <>
      {/* Roblox Projects */}
      <section className="w-full pt-24 pb-16 flex flex-col items-center">
        <ScrollFadeIn>
          <h2 className={`text-2xl md:text-[40px] text-center mb-10 ${lunarLocal.className}`}>Roblox Projects</h2>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[60%] px-4">
          <ScrollFadeIn delay={300}>
            <ProjectCard
              title="Advanced Status Effect System"
              thumbnail="/videos/FireStatus.mp4"
              description="A comprehensive OOP driven status effect framework for RPG games, enabling unique interactions between multiple custom effects. Includes over 40 built-in effects and 100+ synergies, with an easy-to-use API for developers to create and integrate their own effects seamlessly."
              secondDescription="Lunarcrest, Descent, SKIP - [all platforms], Cursefire II"
              images={['/images/statusEffect.png', '/videos/FireStatus.mp4', '/images/ModelsThumbnail.jpg', '/images/robloxPixelImage.png']}
              date="March 2025"
              features={['efficient data management', 'custom visual effects', 'over 40+ effects / 100+ effect synergies', 'dynamic UI', 'easy integration into existing projects', 'easy creation of custom effects/synergies']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <ProjectCard
              title="Multi-Platform Rock Skipping Minigame"
              thumbnail="/videos/MainMenuShowcase.mp4"
              description="A fun and engaging rock skipping minigame framework that works with PC, console, mobile, and VR. Features realistic physics, customizable rocks, multiple game modes, and an intuitive control system designed for all platforms."
              secondDescription="SKIP - all platforms"
              images={['/images/RockCustomizer.png', '/images/codeThumbnail2.jpg', '/images/buildGIF1.gif', '/images/robloxPixelImage.png']}
              date="June 2025"
              features={['Available on all platforms (mobile, console, pc, vr)', 'Customizable rock decorations', 'Power and angle control', 'Explore and Race modes', 'Strict anti-cheat']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <ProjectCard
              title="Card Collection Module"
              thumbnail="/videos/CardViewerShowcase1.mp4"
              description="A combination of UI and backend systems that allow players to collect, view, and manage a collection of cards within a game. Features include dynamic card rendering, sorting/filtering options, and integration with in-game rewards."
              secondDescription="SKIP - all platforms"
              images={['/videos/CardVeiwerShowcase1.mp4', '/videos/CardGameShowcase.mp4', '/images/CardShopShowcase1.png', '/images/CardDisplay1.png']}
              date="June 2025"
              features={['Available on all platforms (mobile, console, pc, vr)', 'Customizable rock decorations', 'Power and angle control', 'Explore and Race modes', 'Strict anti-cheat']}
            />
          </ScrollFadeIn>
        </div>
      </section>
    </>
  )
}

function ProjectViewLayout() {
  const { switchSection } = useSection()
  const { setWarpXY, setWarpZ } = useTheme()

  return (
    
      <SequentialFadeIn>
          <PixelArtDisplay
            imageSrc="/images/Island.png"
            rotationAmount={2}
            rotationDuration={5.9}
            imageScale={1}
            text="Space Theme" 
            onClick={() => {
              setWarpZ(0);
              setWarpXY(80, 20);
              switchSection('main');
            }}
         />
               <section className="w-full pt-24 pb-16 flex flex-col items-center">
        <ScrollFadeIn>
          <h2 className={`text-2xl md:text-[40px] text-center mb-10 ${lunarLocal.className}`}>Roblox Projects</h2>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[100%] px-4">
          <ScrollFadeIn delay={300}>
            <ProjectCard
              title="Advanced Status Effect System"
              thumbnail="/videos/FireStatus.mp4"
              description="A comprehensive OOP driven status effect framework for RPG games, enabling unique interactions between multiple custom effects. Includes over 40 built-in effects and 100+ synergies, with an easy-to-use API for developers to create and integrate their own effects seamlessly."
              secondDescription="Lunarcrest, Descent, SKIP - [all platforms], Cursefire II"
              images={['/images/statusEffect.png', '/videos/FireStatus.mp4', '/images/ModelsThumbnail.jpg', '/images/robloxPixelImage.png']}
              date="March 2025"
              features={['efficient data management', 'custom visual effects', 'over 40+ effects / 100+ effect synergies', 'dynamic UI', 'easy integration into existing projects', 'easy creation of custom effects/synergies']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <ProjectCard
              title="Multi-Platform Rock Skipping Minigame"
              thumbnail="/videos/MainMenuShowcase.mp4"
              description="A fun and engaging rock skipping minigame framework that works with PC, console, mobile, and VR. Features realistic physics, customizable rocks, multiple game modes, and an intuitive control system designed for all platforms."
              secondDescription="SKIP - all platforms"
              images={['/images/RockCustomizer.png', '/images/codeThumbnail2.jpg', '/images/buildGIF1.gif', '/images/robloxPixelImage.png']}
              date="June 2025"
              features={['Available on all platforms (mobile, console, pc, vr)', 'Customizable rock decorations', 'Power and angle control', 'Explore and Race modes', 'Strict anti-cheat']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={100}>
            <ProjectCard
              title="Card Collection Module"
              thumbnail="/videos/CardViewerShowcase1.mp4"
              description="A combination of UI and backend systems that allow players to collect, view, and manage a collection of cards within a game. Features include dynamic card rendering, sorting/filtering options, and integration with in-game rewards."
              secondDescription="SKIP - all platforms"
              images={['/videos/CardVeiwerShowcase1.mp4', '/videos/CardGameShowcase.mp4', '/images/CardShopShowcase1.png', '/images/CardDisplay1.png']}
              date="June 2025"
              features={['Available on all platforms (mobile, console, pc, vr)', 'Customizable rock decorations', 'Power and angle control', 'Explore and Race modes', 'Strict anti-cheat']}
            />
          </ScrollFadeIn>
          <ScrollFadeIn delay={300}>
            <ProjectCard
              title="Advanced Status Effect System"
              thumbnail="/videos/FireStatus.mp4"
              description="A comprehensive OOP driven status effect framework for RPG games, enabling unique interactions between multiple custom effects. Includes over 40 built-in effects and 100+ synergies, with an easy-to-use API for developers to create and integrate their own effects seamlessly."
              secondDescription="Lunarcrest, Descent, SKIP - [all platforms], Cursefire II"
              images={['/images/statusEffect.png', '/videos/FireStatus.mp4', '/images/ModelsThumbnail.jpg', '/images/robloxPixelImage.png']}
              date="March 2025"
              features={['efficient data management', 'custom visual effects', 'over 40+ effects / 100+ effect synergies', 'dynamic UI', 'easy integration into existing projects', 'easy creation of custom effects/synergies']}
            />
          </ScrollFadeIn>
        </div>
      </section>
      </SequentialFadeIn>
  
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Root page — wires up shared effects + renders the active theme
   ════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { setScrollY, setWarpZ } = useTheme()

  // Arrival warp: start "past" the layers and ease back to normal
  useEffect(() => {
    const start = performance.now()
    const duration = 2000
    let rafId: number
    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setWarpZ((1 - eased) * 100)
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => { setScrollY(window.scrollY) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollY])

  return (
    <>
      <SectionPage section="main">
        <SpaceThemeLayout />
      </SectionPage>

      <SectionPage section="projects">
        <ProjectViewLayout />
      </SectionPage>
    </>
  )
}
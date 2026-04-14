"use client"

import ParallaxBackground, {
  type LayerObjectDef,
  type ParticleConfig,
} from '../components/ParallaxBackground'

/* ════════════════════════════════════════════════════════════════════════
   Space-specific content
   ════════════════════════════════════════════════════════════════════ */

const PARTICLES: ParticleConfig = {
  src: '/images/spaceBackgroundObjects/star1.png',
  counts: [150, 80, 40],
  sizes: [[1, 2], [3, 5], [5, 10]],
  opacities: [[0.3, 0.2], [0.5, 0.3], [0.7, 0.3]],
  animationClass: 'animate-twinkle',
  
}

const OBJECTS: LayerObjectDef[] = [
  {
    id: 'planet5',
    src: '/images/spaceBackgroundObjects/Planet10_small.png',
    layer: 2,
    x: 80,
    y: 20,
    size: 7,
    opacity: 1,
    rotationAnimation: { minDegrees: -10, maxDegrees: 0, duration: 6 },
    zVariants: [
      { above: 33, src: '/images/spaceBackgroundObjects/Planet10_.png' },
      { above: 66, src: '/images/spaceBackgroundObjects/Planet10_large.png' },
    ],
  },
  {
    id: 'planet-redgreen',
    src: '/images/spaceBackgroundObjects/Planet_RedGreen_Final1.png',
    layer: 0,
    x: 93,
    y: 100,
    size: 10,
    opacity: 1,
    rotationAnimation: { minDegrees: -1, maxDegrees: 0, duration: 6 },
  },
  {
    id: 'moon1',
    src: '/images/spaceBackgroundObjects/Moon1.png',
    layer: 2,
    x: 84,
    y: 35,
    size: 2.5,
    opacity: 1,
    rotationAnimation: { minDegrees: 0, maxDegrees: 10, duration: 6 },
  },
  {
    id: 'planet7',
    src: '/images/spaceBackgroundObjects/Planet7.png',
    layer: 1,
    x: 10,
    y: 15,
    size: 7,
    opacity: 1,
    rotationAnimation: { minDegrees: 5, maxDegrees: 10, duration: 6 },
  },
  {
    id: 'spaceman',
    src: '/images/spaceBackgroundObjects/SpaceMan.png',
    layer: 2,
    x: -4,
    y: 60,
    size: 18,
    opacity: 1,
    rotationAnimation: { minDegrees: 2, maxDegrees: 4, duration: 6 },
  },
]

/* ════════════════════════════════════════════════════════════════════════
   Wrapper
   ════════════════════════════════════════════════════════════════════ */

export default function SpaceBackground({ visible = true }: { visible?: boolean }) {
  return (
    <ParallaxBackground
      bgColor="#010101"
      warpOpacities={[0, 0, 0]}
      particles={PARTICLES}
      objects={OBJECTS}
      visible={visible}
    />
  )
}
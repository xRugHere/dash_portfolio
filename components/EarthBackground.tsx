"use client"

import ParallaxBackground, {
  type LayerObjectDef,
  type ParticleConfig,
} from './ParallaxBackground'

/* ════════════════════════════════════════════════════════════════════════
   Earth-specific content — clouds, birds, etc.
   Populate these arrays with your earth/sky assets.
   ════════════════════════════════════════════════════════════════════ */

// Optional: floating dust motes, pollen, etc.
const PARTICLES: ParticleConfig = {
  src: '/images/dustMote.png',
  counts: [60, 30, 15],
  sizes: [[1, 3], [2, 5], [4, 8]],
  opacities: [[0.15, 0.1], [0.25, 0.15], [0.35, 0.2]],
}

const OBJECTS: LayerObjectDef[] = [
  // Far layer — slow, distant clouds
  {
    id: 'cloud-far-1',
    src: '/images/cloudbackground/cloud1.png',
    layer: 0,
    x: 100,
    y: 20,
    size: 12,
    opacity: 0.35,
    drift: { speed: 15, direction: 'left' },
  },
  {
    id: 'cloud-far-2',
    src: '/images/cloudbackground/cloud1.png',
    layer: 0,
    x: 60,
    y: 35,
    size: 10,
    opacity: 0.3,
    drift: { speed: 12, direction: 'left', delay: 4 },
  },
  // Mid layer — moderate drift
  {
    id: 'cloud-mid-1',
    src: '/images/cloudbackground/cloud1.png',
    layer: 1,
    x: 80,
    y: 45,
    size: 18,
    opacity: 0.55,
    drift: { speed: 25, direction: 'left', delay: 2 },
  },
  {
    id: 'cloud-mid-2',
    src: '/images/cloudbackground/cloud1.png',
    layer: 1,
    x: 30,
    y: 55,
    size: 15,
    opacity: 0.5,
    drift: { speed: 20, direction: 'left', delay: 6 },
  },
  // Close layer — faster, larger clouds
  {
    id: 'cloud-close-1',
    src: '/images/cloudbackground/cloud1.png',
    layer: 2,
    x: 110,
    y: 65,
    size: 28,
    opacity: 0.85,
    drift: { speed: 40, direction: 'left' },
  },
  {
    id: 'cloud-close-2',
    src: '/images/cloudbackground/cloud1.png',
    layer: 2,
    x: 50,
    y: 75,
    size: 22,
    opacity: 0.75,
    drift: { speed: 35, direction: 'left', delay: 5 },
  },
]

/* ════════════════════════════════════════════════════════════════════════
   Wrapper
   ════════════════════════════════════════════════════════════════════ */

export default function EarthBackground({ visible = false }: { visible?: boolean }) {
  return (
    <ParallaxBackground
      bgColor="#4a90c4"
      layerSpeeds={[0.1, 0.2, 0.4]}
      warpScales={[0.2, 1.0, 3.5]}
      warpOpacities={[1.0, 0.4, 0.0]}
      // particles={PARTICLES}
      objects={OBJECTS}
      visible={visible}
    />
  )
}

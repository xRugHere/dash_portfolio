"use client"

import SpaceBackground from './SpaceBackground'
import EarthBackground from './EarthBackground'
import { useTheme } from './ThemeContext'

export default function ThemedBackground() {
  const { activeBackground } = useTheme()

  return (
    <>
      {/* Both backgrounds mount once; visibility is toggled via opacity crossfade */}
      <SpaceBackground visible={activeBackground === 'space'} />
      <EarthBackground visible={activeBackground === 'earth'} />
    </>
  )
}

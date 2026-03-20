"use client"

import Link from 'next/link'
import Image from 'next/image'
import localFont from 'next/font/local'
import { useTheme } from './ThemeContext'

const lunarFont = localFont({
  src: [
    {
      path: '../public/fonts/PixelFont.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
})

export default function Navbar() {
  const { theme } = useTheme()
  const isLight = theme === 'futuristic'
  const isDark = theme === 'dark'

  // Theme-based styles
  const getNavBg = () => {
    if (isLight) return 'bg-[#F5F5F7]'
    if (isDark) return 'bg-[#0A0A0C]'
    return 'bg-[#1A1A1F]' // space
  }
  const getNavShadow = () => {
    if (isLight) return 'shadow-[0_4px_14px_-1px_rgba(0,0,0,0.15)]'
    return 'shadow-[0_4px_14px_-1px_rgba(0,0,0,0.5)]'
  }
  const getTextColor = () => {
    if (isLight) return 'text-gray-900'
    return 'text-white'
  }
  const getLinkBg = () => {
    if (isLight) return 'bg-[#F5F5F7]'
    if (isDark) return 'bg-[#0A0A0C]'
    return 'bg-[#1A1A1F]'
  }
  const getLinkHoverBg = () => {
    if (isLight) return 'hover:bg-[#E8E8EA]'
    if (isDark) return 'hover:bg-[#151518]'
    return 'hover:bg-[#2a2a2F]'
  }
  const getLinkShadow = () => {
    if (isLight) return 'hover:shadow-[0_6px_16px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.08)]'
    return 'hover:shadow-[0_6px_16px_rgba(0,0,0,0.5),0_3px_6px_rgba(0,0,0,0.4)]'
  }
  const getButtonBg = () => {
    if (isLight) return 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    if (isDark) return 'bg-gray-900 hover:bg-gray-800 text-white'
    return 'bg-gray-800 hover:bg-gray-700 text-white'
  }
  const logoFilter = isLight ? 'invert' : ''

  const navBg = getNavBg()
  const navShadow = getNavShadow()
  const textColor = getTextColor()
  const linkBg = getLinkBg()
  const linkHoverBg = getLinkHoverBg()
  const linkShadow = getLinkShadow()
  const buttonBg = getButtonBg()

  return (
    <nav aria-label="Primary" className={`w-full sticky top-0 z-50 ${navBg} ${navShadow}`}>
      <div className={`w-full px-6 flex items-center justify-between py-5 ${lunarFont.className}`}>
        {/* Left: Logo Placeholder */}
        <div className="flex items-center gap-3 flex-1">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/images/LunarcrestLogo.png" 
              alt="Lunarcrest Studios Logo" 
              width={40} 
              height={40} 
              className={`rounded ${logoFilter}`}
            />
            <span className={`hidden sm:inline text-md ${textColor}`}>LunarCrest studios</span>
          </Link>
        </div>

        {/* Center: navigation links (hidden on very small screens) */}
        <div className="flex-1 flex justify-center">
          <ul className="hidden sm:flex gap-4" role="menubar">
            <li role="none">
              <Link href="/" role="menuitem">
                <span className={`inline-block px-4 py-2 text-md ${textColor} rounded-xl ${linkBg} ${linkHoverBg} ${linkShadow} hover:-translate-y-1 transition-all duration-400`}>HOME</span>
              </Link>
            </li>
            <li role="none">
              <Link href="/projects" role="menuitem">
                <span className={`inline-block px-4 py-2 text-md ${textColor} rounded-xl ${linkBg} ${linkHoverBg} ${linkShadow} hover:-translate-y-1 transition-all duration-400`}>SHOWCASE</span>
              </Link>
            </li>
            <li role="none">
              <Link href="/about" role="menuitem">
                <span className={`inline-block px-4 py-2 text-md ${textColor} rounded-xl ${linkBg} ${linkHoverBg} ${linkShadow} hover:-translate-y-1 transition-all duration-400`}>ABOUT</span>
              </Link>
            </li>
            <li role="none">
              <Link href="/contact" role="menuitem">
                <span className={`inline-block px-4 py-2 text-md ${textColor} rounded-xl ${linkBg} ${linkHoverBg} ${linkShadow} hover:-translate-y-1 transition-all duration-400`}>CONTACT</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Right: placeholders / options */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <button
            type="button"
            className={`px-2 py-1 rounded-md ${buttonBg} text-xs`}
            aria-label="Placeholder option 1"
          >
            Opt 1
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded-md ${buttonBg} text-xs`}
            aria-label="Placeholder option 2"
          >
            Opt 2
          </button>
        </div>
      </div>
    </nav>
  )
}
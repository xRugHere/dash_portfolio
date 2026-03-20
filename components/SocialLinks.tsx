"use client"

import Image from 'next/image'
import Link from 'next/link'
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

interface SocialLink {
  name: string
  url: string
  logo: string
}

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com',
    logo: '/images/githubLogo.png',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    logo: '/images/linkedInLogo.png',
  },
]

export default function SocialLinks() {
  return (
    <section className={`py-12 ${lunarLocal.className}`}>
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-base md:text-md drop-shadow-[0_15px_8px_rgba(0,0,0,0.5)]">Connect</h2>
        <div className="flex items-center gap-8">
          {socialLinks.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group transition-all duration-300 hover:scale-110"
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14 drop-shadow-lg">
                <Image
                  src={link.logo}
                  alt={link.name}
                  fill
                  className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


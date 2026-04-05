"use client"

import { useEffect, useRef, useState } from 'react'
import DashboardSection from './DashboardSection'
import localFont from 'next/font/local'

const lunarLocal = localFont({
  src: [{ path: '../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

/* ─── types ────────────────────────────────────────────────────────── */
interface SpotifyData {
  isPlaying: boolean
  title?: string
  artist?: string
}

interface WakaData {
  totalSeconds?: number
}

interface GithubData {
  totalContributions?: number
  totalCommits?: number
  totalRepos?: number
}

/* ─── helpers ──────────────────────────────────────────────────────── */
function fmtSeconds(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function buildMarqueeText(
  spotify: SpotifyData | null,
  waka: WakaData | null,
  github: GithubData | null,
): string {
  const spotifyStr = spotify?.isPlaying && spotify.title
    ? `♪  ${spotify.title} — ${spotify.artist}`
    : `♪  Not currently playing`

  const wakaStr = waka?.totalSeconds != null
    ? `⌨  ${fmtSeconds(waka.totalSeconds)} coded this week`
    : `⌨  Loading coding time…`

  const ghStr = github?.totalContributions != null
    ? `◈  ${github.totalContributions} contributions  ·  ${github.totalCommits} commits  ·  ${github.totalRepos} repos`
    : `◈  Loading GitHub stats…`

  // spacer keeps the two copies visually separated
  return `${spotifyStr}     ${wakaStr}     ${ghStr}          `
}

/* ─── keyframe injection (runs once) ──────────────────────────────── */
const KEYFRAME_ID = 'live-ribbon-marquee-kf'
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAME_ID)) {
  const style = document.createElement('style')
  style.id = KEYFRAME_ID
  style.textContent = `
    @keyframes ribbon-marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
  `
  document.head.appendChild(style)
}

/* ─── component ────────────────────────────────────────────────────── */
export default function LiveStatsRibbon() {
  const [isOpen, setIsOpen] = useState(false)
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [waka, setWaka] = useState<WakaData | null>(null)
  const [github, setGithub] = useState<GithubData | null>(null)
  const expandedRef = useRef<HTMLDivElement>(null)

  // Fetch all three APIs once on mount for the marquee text
  useEffect(() => {
    fetch('/api/spotify/now-playing')
      .then(r => r.json())
      .then((d: SpotifyData) => setSpotify(d))
      .catch(() => setSpotify({ isPlaying: false }))

    fetch('/api/wakatime/stats')
      .then(r => r.json())
      .then((d: WakaData) => setWaka(d))
      .catch(() => setWaka({}))

    fetch('/api/github/stats')
      .then(r => r.json())
      .then((d: GithubData) => setGithub(d))
      .catch(() => setGithub({}))
  }, [])

  const marqueeText = buildMarqueeText(spotify, waka, github)
  // Scale duration by text length: ~14px per char, 80px/s scroll speed
  const charPx = marqueeText.length * 9
  const durationSec = Math.max(10, Math.round(charPx / 80))

  return (
    <div
      className="relative w-full"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* ── collapsed bar ─────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(o => !o)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsOpen(o => !o)}
        className="flex items-center w-full cursor-pointer select-none"
        style={{ height: '4rem', overflow: 'hidden' }}
      >
        {/* Left label */}
        <span
          className={`shrink-0 text-[10px] tracking-widest uppercase px-3 ${lunarLocal.className}`}
          style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}
        >
          live stats
        </span>

        {/* Divider */}
        <span
          className="shrink-0 self-stretch"
          style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '6px 0' }}
        />

        {/* Marquee area */}
        <div
          className={`flex-1 overflow-hidden ${lunarLocal.className}`}
          style={{ height: '100%', position: 'relative' }}
        >
          {/* The marquee container holds two copies of the text side-by-side.
              Animating translateX(0) → translateX(-50%) scrolls one full copy
              and lands exactly back at the start, giving a seamless loop. */}
          <div
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              width: 'max-content',
              animation: `ribbon-marquee ${durationSec}s linear infinite`,
              willChange: 'transform',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <span
              className="text-[11px]"
              style={{ color: 'rgba(255,255,255,0.55)', padding: '0 1rem' }}
            >
              {marqueeText}
            </span>
            {/* Second copy for seamless loop */}
            <span
              className="text-[11px]"
              style={{ color: 'rgba(255,255,255,0.55)', padding: '0 1rem' }}
              aria-hidden="true"
            >
              {marqueeText}
            </span>
          </div>
        </div>

        {/* Expand / collapse chevron */}
        <span
          className="shrink-0 px-3 text-[11px]"
          style={{
            color: 'rgba(255,255,255,0.35)',
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}
        >
          ▼
        </span>
      </div>

      {/* ── expanded panel ────────────────────────────────────────── */}
      {/*
        We measure the natural scrollHeight on open via a ref and drive
        max-height manually so the CSS transition has explicit endpoints.
      */}
      <div
        ref={expandedRef}
        style={{
          maxHeight: isOpen ? (expandedRef.current?.scrollHeight ?? 9999) + 'px' : '0px',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.45s ease, opacity 0.3s ease',
          borderTop: isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="py-6 px-4">
          <DashboardSection />
        </div>

        {/* Collapse button at the bottom of the expanded panel */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-[10px] tracking-widest uppercase px-4 py-1 rounded"
            style={{
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              cursor: 'pointer',
              letterSpacing: '0.15em',
            }}
          >
            collapse ▲
          </button>
        </div>
      </div>
    </div>
  )
}

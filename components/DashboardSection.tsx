"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import localFont from 'next/font/local'

const lunarLocal = localFont({
  src: [{ path: '../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpotifyData {
  isPlaying: boolean
  title?: string
  artist?: string
  albumArt?: string
  songUrl?: string
}

interface WakaLanguage {
  name: string
  percent: number
  totalSeconds: number
}

interface WakaData {
  totalSeconds: number
  languages: WakaLanguage[]
}

interface GithubLanguage {
  name: string
  count: number
}

interface ContributionDay {
  contributionCount: number
  date: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface GithubData {
  totalContributions: number
  totalCommits: number
  totalRepos: number
  topLanguages: GithubLanguage[]
  weeks: ContributionWeek[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatHours(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  'C++': '#f34b7d',
  C: '#888888',
  Go: '#00add8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C#': '#178600',
  Lua: '#6d6db0',
}

function getLangColor(name: string): string {
  return LANG_COLORS[name] ?? '#6366f1'
}

// ─── Shared card shell ───────────────────────────────────────────────────────

function CardShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm flex flex-col gap-3 ${className}`}>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <div className="h-24 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  )
}

// ─── Spotify Widget ──────────────────────────────────────────────────────────

function SpotifyWidget({ data }: { data: SpotifyData | null }) {
  return (
    <CardShell>
      {/* header */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span className={`text-xs text-white/60 ${lunarLocal.className}`}>spotify</span>
        {data?.isPlaying && (
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400/80">live</span>
          </span>
        )}
      </div>

      {/* body */}
      {!data ? (
        <Spinner />
      ) : data.isPlaying && data.albumArt && data.title && data.artist ? (
        <a
          href={data.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10">
            <Image src={data.albumArt} alt={data.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate group-hover:text-green-400 transition-colors">
              {data.title}
            </p>
            <p className="text-white/50 text-xs truncate">{data.artist}</p>
          </div>
        </a>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white/20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <div>
            <p className={`text-white/40 text-sm ${lunarLocal.className}`}>not playing</p>
            <p className="text-white/25 text-xs">nothing in the queue</p>
          </div>
        </div>
      )}
    </CardShell>
  )
}

// ─── WakaTime Widget ─────────────────────────────────────────────────────────

function WakaWidget({ data }: { data: WakaData | null }) {
  return (
    <CardShell>
      {/* header */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 2c4.971 0 9 4.029 9 9s-4.029 9-9 9-9-4.029-9-9 4.029-9 9-9zm.5 4.5V12h4l-5 5.5V12H8l4.5-5.5z" />
        </svg>
        <span className={`text-xs text-white/60 ${lunarLocal.className}`}>wakatime — last 7 days</span>
      </div>

      {!data ? (
        <Spinner />
      ) : (
        <>
          {/* total */}
          <div>
            <p className={`text-2xl text-white ${lunarLocal.className}`}>
              {formatHours(data.totalSeconds)}
            </p>
            <p className="text-xs text-white/40">coded this week</p>
          </div>

          {/* language bars */}
          <div className="flex flex-col gap-1.5">
            {data.languages.map((lang) => (
              <div key={lang.name}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span style={{ color: getLangColor(lang.name) }}>{lang.name}</span>
                  <span className="text-white/40">{lang.percent.toFixed(1)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${lang.percent}%`,
                      backgroundColor: getLangColor(lang.name),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </CardShell>
  )
}

// ─── GitHub Widget ───────────────────────────────────────────────────────────

function ContributionGrid({ weeks }: { weeks: ContributionWeek[] }) {
  const recent = weeks.slice(-20)
  const max = Math.max(
    ...recent.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)),
    1
  )

  function cellColor(count: number): string {
    if (count === 0) return 'rgba(255,255,255,0.05)'
    const t = count / max
    if (t < 0.25) return 'rgba(22,163,74,0.35)'
    if (t < 0.5) return 'rgba(22,163,74,0.55)'
    if (t < 0.75) return 'rgba(22,163,74,0.78)'
    return 'rgba(74,222,128,0.95)'
  }

  return (
    <div className="flex gap-0.5 overflow-hidden">
      {recent.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.contributionDays.map((day, di) => (
            <div
              key={di}
              title={`${day.date}: ${day.contributionCount}`}
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: cellColor(day.contributionCount) }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function GithubWidget({ data }: { data: GithubData | null }) {
  return (
    <CardShell>
      {/* header */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
        <span className={`text-xs text-white/60 ${lunarLocal.className}`}>github</span>
      </div>

      {!data ? (
        <Spinner />
      ) : (
        <>
          {/* stats row */}
          <div className="flex gap-6">
            <div>
              <p className={`text-xl text-white ${lunarLocal.className}`}>
                {data.totalContributions.toLocaleString()}
              </p>
              <p className="text-xs text-white/40">contributions</p>
            </div>
            <div>
              <p className={`text-xl text-white ${lunarLocal.className}`}>{data.totalRepos}</p>
              <p className="text-xs text-white/40">public repos</p>
            </div>
          </div>

          {/* contribution grid */}
          {data.weeks?.length > 0 && <ContributionGrid weeks={data.weeks} />}

          {/* top languages */}
          <div className="flex flex-wrap gap-1.5">
            {data.topLanguages.map((lang) => (
              <span
                key={lang.name}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: getLangColor(lang.name) + '33',
                  color: getLangColor(lang.name),
                  border: `1px solid ${getLangColor(lang.name)}55`,
                }}
              >
                {lang.name}
              </span>
            ))}
          </div>
        </>
      )}
    </CardShell>
  )
}

// ─── Root export ─────────────────────────────────────────────────────────────

export default function DashboardSection() {
  const [spotify, setSpotify] = useState<SpotifyData | null>(null)
  const [waka, setWaka] = useState<WakaData | null>(null)
  const [github, setGithub] = useState<GithubData | null>(null)

  useEffect(() => {
    const fetchSpotify = () =>
      fetch('/api/spotify/now-playing')
        .then((r) => r.json())
        .then(setSpotify)
        .catch(() => {})

    fetchSpotify()
    const interval = setInterval(fetchSpotify, 30_000)

    fetch('/api/wakatime/stats').then((r) => r.json()).then(setWaka).catch(() => {})
    fetch('/api/github/stats').then((r) => r.json()).then(setGithub).catch(() => {})

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-6">
      <h2 className={`text-xl md:text-2xl text-center mb-6 text-white/70 tracking-widest ${lunarLocal.className}`}>
        — live stats —
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SpotifyWidget data={spotify} />
        <WakaWidget data={waka} />
        <GithubWidget data={github} />
      </div>
    </section>
  )
}

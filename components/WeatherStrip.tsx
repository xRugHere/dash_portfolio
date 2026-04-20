'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import ScrollFadeIn from '../components/ScrollFadeIn'

interface HourlyPeriod {
  startTime: string
  temperature: number
  temperatureUnit: string
  shortForecast: string
  isDaytime: boolean
  windSpeed: string
  windDirection: string
  relativeHumidity: number | null
  probabilityOfPrecipitation: number | null
}

interface WeatherData {
  current: {
    temperature: number
    unit: string
    description: string
    windSpeed: string
    windDirection: string
    humidity: number | null
  } | null
  forecast: {
    name: string
    temperature: number
    unit: string
    shortForecast: string
    isDaytime: boolean
  }[]
  hourly: HourlyPeriod[]
  location: string
}

function getWeatherImage(shortForecast: string, isDaytime: boolean): string {
  const forecast = shortForecast.toLowerCase()

  if (forecast.includes('thunderstorm')) return '/images/weather/thunderstorm.png'
  if (forecast.includes('snow') || forecast.includes('blizzard')) return '/images/weather/snow.png'
  if (forecast.includes('sleet') || forecast.includes('freezing rain') || forecast.includes('ice')) return '/images/weather/sleet.png'
  if (forecast.includes('fog') || forecast.includes('haze') || forecast.includes('mist')) return '/images/weather/fog.png'
  if (forecast.includes('frost')) return '/images/weather/frost.png'
  if (forecast.includes('rain') || forecast.includes('drizzle') || forecast.includes('showers')) return '/images/weather/rain.png'
  if (forecast.includes('overcast')) return '/images/weather/overcast.png'
  if (forecast.includes('cloudy') || forecast.includes('partly sunny')) {
    return isDaytime ? '/images/weather/single_cloud_.png' : '/images/weather/partly-cloudy-night.png'
  }
  if (forecast.includes('mostly sunny') || forecast.includes('mostly clear')) {
    return isDaytime ? '/images/weather/mostly-sunny.png' : '/images/weather/mostly-clear-night.png'
  }
  if (forecast.includes('sunny') || forecast.includes('clear')) {
    return isDaytime ? '/images/weather/sunny___.png' : '/images/weather/clear-night.png'
  }
  if (forecast.includes('wind')) return '/images/weather/windy.png'

  return isDaytime ? '/images/weather/sunny___.png' : '/images/weather/clear-night.png'
}

function fToC(f: number): number {
  return Math.round((f - 32) * 5 / 9)
}

function formatHour(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
}

function getWeatherBackground(shortForecast: string, isDaytime: boolean): string {
  const forecast = shortForecast.toLowerCase()

  if (forecast.includes('thunderstorm')) return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)'
  if (forecast.includes('snow') || forecast.includes('blizzard')) return 'linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 50%, #71717a 100%)'
  if (forecast.includes('rain') || forecast.includes('drizzle') || forecast.includes('showers')) return 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
  if (forecast.includes('fog') || forecast.includes('haze') || forecast.includes('mist')) return 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)'
  if (forecast.includes('overcast') || forecast.includes('cloudy')) {
    return isDaytime
      ? 'linear-gradient(135deg, #64748b 0%, #94a3b8 50%, #cbd5e1 100%)'
      : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
  }
  if (forecast.includes('sunny') || forecast.includes('clear') || forecast.includes('mostly sunny') || forecast.includes('mostly clear')) {
    return isDaytime
      ? 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
  }

  return isDaytime
    ? 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #0ea5e9 100%)'
    : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
}

export default function WeatherStrip() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/weather')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setWeather)
      .catch(() => setError(true))
  }, [])

  if (error) return null
  if (!weather) {
    return (
      <div className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 animate-pulse">
        <div className="h-28 w-full rounded bg-white/10" />
      </div>
    )
  }

  const current = weather.current
  const nextPeriod = weather.forecast[0]
  const hours = weather.hourly.slice(0, 10)

  // Determine background from the current/first-hour weather
  const bgForecast = current?.description ?? hours[0]?.shortForecast ?? 'clear'
  const bgIsDaytime = hours[0]?.isDaytime ?? true
  const backgroundGradient = getWeatherBackground(bgForecast, bgIsDaytime)

  return (
    <div
      className="w-full h-full overflow-hidden relative"
      style={{
        background: backgroundGradient,
        boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 6px rgba(0,0,0,0.3)',
      }}
    >
      <ScrollFadeIn delay={300}>
        <div className="p-[80px]">
          <div
            className="rounded-xl overflow-hidden bg-[#0a0a0f] backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 16px rgba(0,0,0,.7), 0 8px 16px rgba(0,0,0,.2)',
            }}
          >

        {/* Hourly Forecast */}
        {hours.length > 0 && (
          <div className="grid grid-cols-10 gap-[5px] p-[5px]">
            {hours.map((hour, i) => (
              <div
                key={i}
                className="aspect-square flex flex-col items-center justify-center
                          transition-colors"
              >
                <span className="text-sm text-white/40 uppercase tracking-wide leading-none mb-1">
                  {formatHour(hour.startTime)}
                </span>
                <div className="w-17 h-20 relative flex-shrink-0 my-.7">
                  <Image
                    src={getWeatherImage(hour.shortForecast, hour.isDaytime)}
                    alt={hour.shortForecast}
                    fill
                    className="object-contain"
                    // style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <span className="text-md text-white leading-none mt-0.5">
                  {hour.temperature}°F
                </span>
                <span className="text-sm text-white/35 leading-none">
                  {fToC(hour.temperature)}°C
                </span>
              </div>
            ))}
          </div>
        )}

            <div className="px-4 py-2 flex items-center gap-4 flex-wrap text-sm">
              <span className="text-white/40 text-sm uppercase tracking-wider">
                {weather.location} 
              </span>

              {current ? (
                <>
                  <span className="text-lg text-white">
                    {current.temperature}°{current.unit}
                    <span className="text-sm text-white/40 ml-1">
                      / {fToC(current.temperature)}°C
                    </span>
                  </span>
                  <span className="text-white/60">{current.description}</span>
                  {current.windSpeed && (
                    <span className="text-white/40">
                      Wind {current.windDirection} {current.windSpeed}
                    </span>
                  )}
                  {current.humidity != null && (
                    <span className="text-white/40">{current.humidity}% humidity</span>
                  )}
                </>
              ) : nextPeriod ? (
                <>
                  <span className="text-lg font-semibold text-white">
                    {nextPeriod.temperature}°{nextPeriod.unit}
                  </span>
                  <span className="text-white/60">{nextPeriod.shortForecast}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  )
}

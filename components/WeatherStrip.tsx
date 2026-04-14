'use client'

import { useEffect, useState } from 'react'

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
  location: string
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
      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 animate-pulse">
        <div className="h-5 w-48 rounded bg-white/10" />
      </div>
    )
  }

  const current = weather.current
  const nextPeriod = weather.forecast[0]

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-4 flex-wrap text-sm">
      <span className="text-white/40 text-xs uppercase tracking-wider">
        {weather.location}
      </span>

      {current ? (
        <>
          <span className="text-lg font-semibold text-white">
            {current.temperature}°{current.unit}
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

      {nextPeriod && current && (
        <span className="ml-auto text-white/40 text-xs">
          {nextPeriod.name}: {nextPeriod.shortForecast}, {nextPeriod.temperature}°
          {nextPeriod.unit}
        </span>
      )}
    </div>
  )
}

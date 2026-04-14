import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const USER_AGENT = '(dashPortfolio, contact@dashportfolio.dev)'

interface WeatherCache {
  data: WeatherData | null
  timestamp: number
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
  location: string
}

let cache: WeatherCache = { data: null, timestamp: 0 }
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

async function fetchNWS(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json' },
  })
  if (!res.ok) throw new Error(`NWS API ${res.status}: ${res.statusText}`)
  return res.json()
}

export async function GET() {
  try {
    // Return cache if fresh
    if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data)
    }

    const lat = process.env.WEATHER_LAT
    const lon = process.env.WEATHER_LON
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Weather location not configured' }, { status: 500 })
    }

    // Step 1: Get grid point metadata
    const pointData = await fetchNWS(`https://api.weather.gov/points/${lat},${lon}`)
    const props = pointData.properties
    const gridId = props.gridId
    const gridX = props.gridX
    const gridY = props.gridY
    const locationName = props.relativeLocation?.properties
      ? `${props.relativeLocation.properties.city}, ${props.relativeLocation.properties.state}`
      : 'Unknown'

    // Step 2: Get forecast (next few periods)
    const forecastData = await fetchNWS(
      `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`
    )
    const periods = (forecastData.properties?.periods ?? []).slice(0, 4)

    // Step 3: Get current conditions from nearest station
    const stationsData = await fetchNWS(
      `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`
    )
    const stationUrl = stationsData.features?.[0]?.id
    let current: WeatherData['current'] = null

    if (stationUrl) {
      try {
        const obsData = await fetchNWS(`${stationUrl}/observations/latest`)
        const obs = obsData.properties
        const tempC = obs?.temperature?.value
        const tempF = tempC != null ? Math.round(tempC * 9 / 5 + 32) : null

        current = {
          temperature: tempF ?? 0,
          unit: 'F',
          description: obs?.textDescription ?? '',
          windSpeed: obs?.windSpeed?.value != null
            ? `${Math.round(obs.windSpeed.value * 0.621371)} mph`
            : '',
          windDirection: obs?.windDirection?.value != null
            ? degToCompass(obs.windDirection.value)
            : '',
          humidity: obs?.relativeHumidity?.value != null
            ? Math.round(obs.relativeHumidity.value)
            : null,
        }
      } catch {
        // Station observation failed, use forecast first period as fallback
      }
    }

    const result: WeatherData = {
      current,
      forecast: periods.map((p: Record<string, unknown>) => ({
        name: p.name as string,
        temperature: p.temperature as number,
        unit: (p.temperatureUnit as string) || 'F',
        shortForecast: p.shortForecast as string,
        isDaytime: p.isDaytime as boolean,
      })),
      location: locationName,
    }

    cache = { data: result, timestamp: Date.now() }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Weather API error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 502 }
    )
  }
}

function degToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

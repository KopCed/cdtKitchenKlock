import { useState, useEffect, useRef } from 'react'
import ClockView from './components/ClockView'
import WeatherView from './components/WeatherView'
import ConfigPage from './components/config/ConfigPage'
import LavaLamp from './components/LavaLamp'
import StarfieldBackground from './components/StarfieldBackground'
import { useConfig } from './hooks/useConfig'
import { useClock } from './hooks/useClock'
import { randomAccessibleColor } from './utils/colors'
import { ClockType, ViewMode, WeatherData, AppConfig, DigitalClockStyle, AnalogClockStyle, GlobeColor } from './types'
import { TranslationProvider, useTranslation } from './i18n/TranslationContext'
import { formatDate } from './utils/formatDate'
import { useVersionCheck } from './hooks/useVersionCheck'

function isDimTime(now: Date, start: string, end: string): boolean {
  const cur = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const s = sh * 60 + sm
  const e = eh * 60 + em
  return s > e
    ? cur >= s || cur < e   // korsar midnatt, t.ex. 22:00–07:00
    : cur >= s && cur < e   // samma dag
}

interface ContentProps {
  config: AppConfig
  loading: boolean
  saveConfig: (config: AppConfig) => Promise<AppConfig | null>
  fetchConfig: () => Promise<AppConfig | null>
}

function AppContent({ config, loading, saveConfig, fetchConfig }: ContentProps) {
  const { t } = useTranslation()
  const clock = useClock()
  useVersionCheck()

  // Time format (24h / 12h)
  const is12h = config?.timeFormat === '12h'
  const rawHour = parseInt(clock.hours, 10)
  const displayHours = is12h ? String(rawHour % 12 || 12).padStart(2, '0') : clock.hours
  const ampm = is12h ? (rawHour >= 12 ? 'PM' : 'AM') : undefined

  // Date format
  const formattedDate = formatDate(clock.date, config?.dateFormat ?? 'YYYY-MM-DD', t)

  const [viewMode, setViewMode] = useState<ViewMode>('clock')
  const [clockType, setClockType] = useState<ClockType>('digital')
  const [activeDigitalStyle, setActiveDigitalStyle] = useState<DigitalClockStyle>('default')
  const [activeAnalogStyle, setActiveAnalogStyle] = useState<AnalogClockStyle>('classic')
  const [clockColor, setClockColor] = useState('#FFFFFF')
  const [dateColor, setDateColor] = useState('#FFFFFF')
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [brightness, setBrightness] = useState(100)

  const viewTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const randomTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const colorTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Tracks currently shown style key
  const currentStyleRef = useRef<string>('digital-default')
  // Shuffle queue — each style appears exactly once per round before reshuffling
  const shuffleQueueRef = useRef<string[]>([])
  // Tracks previous view mode to detect weather→clock transitions
  const prevViewModeRef = useRef<ViewMode>('clock')

  // Apply a style key and update the ref
  function applyKey(key: string) {
    currentStyleRef.current = key
    const dash = key.indexOf('-')
    const type  = key.slice(0, dash) as ClockType
    const style = key.slice(dash + 1)
    setClockType(type)
    if (type === 'digital') setActiveDigitalStyle(style as DigitalClockStyle)
    else                    setActiveAnalogStyle(style as AnalogClockStyle)
  }

  // Check if we're on the config route
  const isConfigPage = window.location.pathname === '/config'

  // Show/hide cursor depending on page
  useEffect(() => {
    document.body.classList.toggle('config-page', isConfigPage)
  }, [isConfigPage])

  // Initialize active style from config
  useEffect(() => {
    if (!config) return
    const list = config.enabledClockStyles
    if (list.length === 0) return
    applyKey(list[Math.floor(Math.random() * list.length)])
  }, [JSON.stringify(config?.enabledClockStyles)])

  // Initialize colors from config
  useEffect(() => {
    if (!config) return
    setClockColor(config.randomClockColor
      ? randomAccessibleColor(config.backgroundColor)
      : config.clockColor)
    setDateColor(config.randomDateColor
      ? randomAccessibleColor(config.backgroundColor)
      : config.dateColor)
  }, [config])

  // Shuffle an array using Fisher-Yates, optionally ensuring the first element
  // isn't the same as `avoidFirst` (to prevent same style appearing twice at round boundary)
  function shuffled(arr: string[], avoidFirst?: string): string[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    // If the first element would repeat the last-shown style, swap it with another
    if (avoidFirst && a.length > 1 && a[0] === avoidFirst) {
      const swap = 1 + Math.floor(Math.random() * (a.length - 1));
      [a[0], a[swap]] = [a[swap], a[0]]
    }
    return a
  }

  // Advance to next style in the shuffle queue (shared by both trigger modes)
  function advanceStyle(list: string[]) {
    if (list.length <= 1) return
    if (shuffleQueueRef.current.length === 0) {
      shuffleQueueRef.current = shuffled(list, currentStyleRef.current)
    }
    applyKey(shuffleQueueRef.current.shift()!)
  }

  // Random switching timer — active only when clockSwitchTrigger === 'timed'
  useEffect(() => {
    if (!config) return
    if (config.clockSwitchTrigger === 'onWeatherReturn') return
    const list = config.enabledClockStyles
    if (list.length <= 1) return   // only one style → nothing to switch
    if (randomTimerRef.current) clearInterval(randomTimerRef.current)
    shuffleQueueRef.current = []   // reset queue on config change
    const ms = (config.randomSwitchMinutes || 1) * 60 * 1000
    randomTimerRef.current = setInterval(() => advanceStyle(list), ms)
    return () => { if (randomTimerRef.current) clearInterval(randomTimerRef.current) }
  }, [JSON.stringify(config?.enabledClockStyles), config?.randomSwitchMinutes, config?.clockSwitchTrigger])

  // Random color cycling — active only when clockSwitchTrigger === 'timed'
  useEffect(() => {
    if (!config) return
    if (config.clockSwitchTrigger === 'onWeatherReturn') return
    if (!config.randomClockColor && !config.randomDateColor) return
    if (colorTimerRef.current) clearInterval(colorTimerRef.current)
    const interval = (config.randomSwitchMinutes || 1) * 60 * 1000
    colorTimerRef.current = setInterval(() => {
      if (config.randomClockColor) setClockColor(randomAccessibleColor(config.backgroundColor))
      if (config.randomDateColor) setDateColor(randomAccessibleColor(config.backgroundColor))
    }, interval)
    return () => { if (colorTimerRef.current) clearInterval(colorTimerRef.current) }
  }, [config])

  // Advance style + colors on weather→clock transition (onWeatherReturn mode)
  useEffect(() => {
    if (!config) return
    if (config.clockSwitchTrigger !== 'onWeatherReturn') {
      prevViewModeRef.current = viewMode
      return
    }
    const wasWeather = prevViewModeRef.current === 'weather'
    prevViewModeRef.current = viewMode
    if (viewMode !== 'clock' || !wasWeather) return

    const list = config.enabledClockStyles
    advanceStyle(list)
    if (config.randomClockColor) setClockColor(randomAccessibleColor(config.backgroundColor))
    if (config.randomDateColor) setDateColor(randomAccessibleColor(config.backgroundColor))
  }, [viewMode, config?.clockSwitchTrigger])

  // View mode switching (clock ↔ weather)
  useEffect(() => {
    if (!config || !config.showWeather) return
    if (viewTimerRef.current) clearTimeout(viewTimerRef.current)

    const duration = viewMode === 'clock'
      ? config.clockDisplaySeconds * 1000
      : config.weatherDisplaySeconds * 1000

    viewTimerRef.current = setTimeout(() => {
      setViewMode(prev => prev === 'clock' ? 'weather' : 'clock')
    }, duration)

    return () => { if (viewTimerRef.current) clearTimeout(viewTimerRef.current) }
  }, [viewMode, config?.showWeather, config?.clockDisplaySeconds, config?.weatherDisplaySeconds])

  const lastBrightnessRef = useRef<number>(-1)

  // Screen dimming based on time — CSS filter + hardware DDC/CI via backend
  useEffect(() => {
    const applyBrightness = (level: number) => {
      if (level === lastBrightnessRef.current) return
      lastBrightnessRef.current = level
      setBrightness(level)
      fetch(`/api/dim?level=${level}`, { method: 'POST' }).catch(() => {})
    }
    if (!config?.dimEnabled) { applyBrightness(100); return }
    const check = () => applyBrightness(
      isDimTime(new Date(), config.dimStart, config.dimEnd) ? config.dimLevel : 100
    )
    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [config?.dimEnabled, config?.dimStart, config?.dimEnd, config?.dimLevel])

  // Fetch weather data periodically.
  // On failure: retry every 15 seconds until first success, then every 10 minutes.
  useEffect(() => {
    if (!config?.showWeather && !config?.showTemperature) return
    let mounted = true
    let retryId: ReturnType<typeof setTimeout> | null = null
    let refreshId: ReturnType<typeof setInterval> | null = null

    const load = async () => {
      try {
        const res = await fetch('/api/weather')
        if (!mounted) return
        if (res.ok) {
          const data: WeatherData = await res.json()
          if (!mounted) return
          setWeatherData(data)
          // First success: switch to normal 10-minute refresh interval
          if (retryId !== null) {
            clearTimeout(retryId)
            retryId = null
            refreshId = setInterval(load, 10 * 60 * 1000)
          }
        } else if (retryId !== null) {
          // Still failing: retry in 15 seconds
          retryId = setTimeout(load, 15_000)
        }
      } catch {
        if (mounted && retryId !== null) {
          retryId = setTimeout(load, 15_000)
        }
      }
    }

    // Start in retry-mode until first success
    retryId = setTimeout(load, 0)
    return () => {
      mounted = false
      if (retryId !== null) clearTimeout(retryId)
      if (refreshId !== null) clearInterval(refreshId)
    }
  }, [config?.showWeather, config?.showTemperature])

  if (loading) {
    return (
      <div style={{
        width: '100%', height: '100%', backgroundColor: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'monospace', fontSize: '2vw',
      }}>
        {t('app.loading')}
      </div>
    )
  }

  if (isConfigPage) {
    return <ConfigPage config={config} onSave={saveConfig} onRefresh={fetchConfig} />
  }

  const bg = config.backgroundStyle
  const isAnimatedBg = bg === 'lavaLamp' || bg === 'nightSky'
  // Animated backgrounds: force white text, semi-transparent dark clock face
  const effectiveClockColor = isAnimatedBg ? '#FFFFFF' : clockColor
  const effectiveDateColor  = isAnimatedBg ? '#FFFFFF' : dateColor
  const effectiveBgColor    = isAnimatedBg ? 'rgba(7,7,26,0.60)' : config.backgroundColor
  const baseBgColor         = isAnimatedBg ? '#00000A' : config.backgroundColor

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      backgroundColor: baseBgColor,
    }}>
      {/* Bakgrundslager — påverkas INTE av dimning */}
      {bg === 'lavaLamp'  && <LavaLamp />}
      {bg === 'nightSky'  && <StarfieldBackground starSize={config.starSize} />}

      {/* Innehållslager — dimmas vid behov, bakgrunden lämnas orörd */}
      <div style={{
        position: 'absolute', inset: 0,
        filter: brightness < 100 ? `brightness(${brightness}%)` : undefined,
        transition: 'filter 60s ease',
      }}>

      {/* Config link (subtle, top center) */}
      <a
        href="/config"
        style={{
          position: 'fixed', top: '8px', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.15)', fontSize: '11px', textDecoration: 'none',
          zIndex: 100, fontFamily: 'monospace',
        }}
        title={t('app.settings')}
      >
        {t('app.settingsLink')}
      </a>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {viewMode === 'clock' ? (
          <ClockView
            clockType={clockType}
            hours={displayHours}
            minutes={clock.minutes}
            seconds={clock.seconds}
            dateStr={formattedDate}
            clockColor={effectiveClockColor}
            dateColor={effectiveDateColor}
            backgroundColor={effectiveBgColor}
            showDate={config.showDate}
            showTemperature={config.showTemperature}
            temperaturePosition={config.temperaturePosition}
            temperature={weatherData?.temperature ?? null}
            temperatureUnit={config.temperatureUnit}
            digitalClockStyle={activeDigitalStyle}
            ledDimOpacity={config.ledDimOpacity}
            analogClockStyle={activeAnalogStyle}
            globeColor={config.globeColor as GlobeColor}
            ampm={ampm}
          />
        ) : (
          <WeatherView
            backgroundColor={effectiveBgColor}
            clockColor={effectiveClockColor}
            city={config.weatherCity}
            showWeatherTime={config.showWeatherTime}
            weatherTimePosition={config.weatherTimePosition}
            temperatureUnit={config.temperatureUnit}
            hours={displayHours}
            minutes={clock.minutes}
            seconds={clock.seconds}
            ampm={ampm}
            weatherData={weatherData}
          />
        )}
      </div>
      </div>{/* slut innehållslager */}
    </div>
  )
}

export default function App() {
  const { config, loading, saveConfig, fetchConfig } = useConfig()
  return (
    <TranslationProvider language={config?.language ?? 'sv'}>
      <AppContent
        config={config}
        loading={loading}
        saveConfig={saveConfig}
        fetchConfig={fetchConfig}
      />
    </TranslationProvider>
  )
}

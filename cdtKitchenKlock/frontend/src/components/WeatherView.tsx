import { WeatherData } from '../types'
import TimeCorner from './TimeCorner'
import { useTranslation } from '../i18n/TranslationContext'

interface Props {
  backgroundColor: string
  clockColor: string
  city: string
  showWeatherTime: boolean
  weatherTimePosition: 'top-left' | 'top-right' | 'bot-left' | 'bot-right'
  hours: string
  minutes: string
  seconds: string
  ampm?: string
  temperatureUnit: 'celsius' | 'fahrenheit'
  weatherData: WeatherData | null
}

function weatherEmoji(code: number): string {
  if (code === 1) return '☀️'
  if (code === 2 || code === 3) return '🌤️'
  if (code === 4 || code === 5 || code === 6) return '☁️'
  if (code === 7) return '🌫️'
  if (code >= 8 && code <= 10) return '🌧️'
  if (code === 11) return '⛈️'
  if (code >= 12 && code <= 14) return '🌨️'
  if (code >= 15 && code <= 17) return '❄️'
  if (code >= 18 && code <= 20) return '🌧️'
  if (code === 21) return '⛈️'
  if (code >= 22 && code <= 24) return '🌨️'
  if (code >= 25 && code <= 27) return '❄️'
  return '🌡️'
}

function toDisplay(celsius: number, unit: 'celsius' | 'fahrenheit') {
  return unit === 'fahrenheit' ? celsius * 9 / 5 + 32 : celsius
}

export default function WeatherView({ backgroundColor, clockColor, city, showWeatherTime, weatherTimePosition, hours, minutes, seconds, ampm, temperatureUnit, weatherData: weather }: Props) {
  const { t } = useTranslation()

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor,
      color: clockColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      padding: '4vw',
    }}>
      {showWeatherTime && (
        <TimeCorner
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          position={weatherTimePosition}
          color={clockColor}
          ampm={ampm}
        />
      )}
      {weather && (
        <>
          <div style={{ fontSize: 'clamp(14px, 4vw, 60px)', opacity: 0.8, marginBottom: '1vh' }}>
            {city}
          </div>
          <div style={{ fontSize: 'clamp(40px, 15vw, 200px)', lineHeight: 1 }}>
            {weatherEmoji(weather.weatherCode)}
          </div>
          <div style={{ fontSize: 'clamp(30px, 12vw, 180px)', fontWeight: 'bold', lineHeight: 1.1 }}>
            {toDisplay(weather.temperature, temperatureUnit) > 0 ? '+' : ''}{toDisplay(weather.temperature, temperatureUnit).toFixed(1)}{temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
          </div>
          <div style={{ fontSize: 'clamp(16px, 4vw, 60px)', marginTop: '1vh', opacity: 0.9 }}>
            {t(`weather.codes.${weather.weatherCode}`)}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2.5vw, 40px)', marginTop: '0.5vh', opacity: 0.7 }}>
            {t('weather.wind', { speed: weather.windSpeed.toFixed(1) })}
          </div>

          {/* Forecast */}
          {weather.forecast.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '3vw',
              marginTop: '4vh',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {weather.forecast.map((f, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  fontSize: 'clamp(11px, 2vw, 32px)',
                  opacity: 0.85,
                  border: `1px solid ${clockColor}`,
                  borderRadius: '8px',
                  padding: '1vh 1.5vw',
                  minWidth: '8vw',
                }}>
                  <div style={{ fontSize: '1.8em' }}>{weatherEmoji(f.code)}</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {toDisplay(f.temp, temperatureUnit) > 0 ? '+' : ''}{toDisplay(f.temp, temperatureUnit).toFixed(0)}{temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
                  </div>
                  <div style={{ opacity: 0.7 }}>{f.time.slice(11, 16)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {!weather && (
        <div style={{ fontSize: '3vw', opacity: 0.5 }}>{t('weather.loading')}</div>
      )}
    </div>
  )
}

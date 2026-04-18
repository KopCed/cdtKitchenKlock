export const DIGITAL_CLOCK_STYLES = ['default', 'led', 'scifi', 'flip', 'globe'] as const
export type DigitalClockStyle = typeof DIGITAL_CLOCK_STYLES[number]

export const ANALOG_CLOCK_STYLES = ['classic', 'pilot', 'vintage', 'cosmic'] as const
export type AnalogClockStyle = typeof ANALOG_CLOCK_STYLES[number]

export type GlobeColor = 'purple' | 'red' | 'green' | 'blue'

export interface AppConfig {
  enabledClockStyles: string[]
  backgroundColor: string
  clockColor: string
  dateColor: string
  randomSwitchMinutes: number
  clockSwitchTrigger: 'timed' | 'onWeatherReturn'
  randomClockColor: boolean
  randomDateColor: boolean
  showDate: boolean
  showWeather: boolean
  showTemperature: boolean
  temperaturePosition: 'top-left' | 'top-right' | 'bot-left' | 'bot-right'
  showWeatherTime: boolean
  weatherTimePosition: 'top-left' | 'top-right' | 'bot-left' | 'bot-right'
  clockDisplaySeconds: number
  weatherDisplaySeconds: number
  weatherService: 'smhi' | 'yr' | 'accuweather'
  weatherApiKey: string
  weatherRefreshMinutes: number
  weatherLat: number
  weatherLon: number
  weatherCity: string
  globeColor: GlobeColor
  ledDimOpacity: number
  backgroundStyle: 'solid' | 'lavaLamp' | 'nightSky'
  starSize: number
  dimEnabled: boolean
  dimStart: string
  dimEnd: string
  dimLevel: number
  language: string
  timeFormat: '24h' | '12h'
  dateFormat: string
  temperatureUnit: 'celsius' | 'fahrenheit'
}

export const defaultConfig: AppConfig = {
  enabledClockStyles: ['digital-default'],
  backgroundColor: '#000000',
  clockColor: '#FFFFFF',
  dateColor: '#FFFFFF',
  randomSwitchMinutes: 1,
  clockSwitchTrigger: 'timed',
  randomClockColor: false,
  randomDateColor: false,
  showDate: true,
  showWeather: false,
  showTemperature: true,
  temperaturePosition: 'top-right',
  showWeatherTime: true,
  weatherTimePosition: 'top-right',
  clockDisplaySeconds: 60,
  weatherDisplaySeconds: 30,
  weatherService: 'smhi',
  weatherApiKey: '',
  weatherRefreshMinutes: 30,
  weatherLat: 59.3293,
  weatherLon: 18.0686,
  weatherCity: 'Stockholm',
  globeColor: 'purple',
  ledDimOpacity: 5,
  backgroundStyle: 'solid',
  starSize: 1.5,
  dimEnabled: false,
  dimStart: '22:00',
  dimEnd: '07:00',
  dimLevel: 40,
  language: 'sv',
  timeFormat: '24h',
  dateFormat: 'YYYY-MM-DD',
  temperatureUnit: 'celsius',
}

export interface ForecastItem {
  time: string
  temp: number
  code: number
  description: string
}

export interface WeatherData {
  temperature: number
  weatherCode: number
  description: string
  windSpeed: number
  forecast: ForecastItem[]
}

export type ViewMode = 'clock' | 'weather'
export type ClockType = 'digital' | 'analog'

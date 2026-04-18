import DigitalClock from './DigitalClock'
import AnalogClock from './AnalogClock'
import TemperatureCorner from './TemperatureCorner'
import { ClockType, DigitalClockStyle, AnalogClockStyle, GlobeColor } from '../types'

interface Props {
  clockType: ClockType
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string
  dateColor: string
  backgroundColor: string
  showDate: boolean
  showTemperature: boolean
  temperaturePosition: 'top-left' | 'top-right' | 'bot-left' | 'bot-right'
  temperature: number | null
  temperatureUnit: 'celsius' | 'fahrenheit'
  digitalClockStyle: DigitalClockStyle
  ledDimOpacity: number
  analogClockStyle: AnalogClockStyle
  globeColor: GlobeColor
  ampm?: string
}

export default function ClockView({
  clockType, hours, minutes, seconds, dateStr,
  clockColor, dateColor, backgroundColor,
  showDate, showTemperature, temperaturePosition, temperature, temperatureUnit,
  digitalClockStyle, ledDimOpacity, analogClockStyle, globeColor, ampm,
}: Props) {
  const clockProps = { hours, minutes, seconds, dateStr, clockColor, dateColor, backgroundColor, showDate, digitalClockStyle, ledDimOpacity, analogClockStyle, globeColor, ampm }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {clockType === 'digital'
        ? <DigitalClock {...clockProps} />
        : <AnalogClock {...clockProps} />
      }
      {showTemperature && temperature !== null && (
        <TemperatureCorner
          temperature={temperature}
          position={temperaturePosition}
          color={clockColor}
          unit={temperatureUnit}
        />
      )}
    </div>
  )
}

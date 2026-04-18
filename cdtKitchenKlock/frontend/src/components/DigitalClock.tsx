import LedClock from './LedClock'
import SciFiClock from './SciFiClock'
import FlipClock from './FlipClock'
import GlobeClock from './GlobeClock'

import { DigitalClockStyle, GlobeColor } from '../types'

interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string
  dateColor: string
  backgroundColor: string
  showDate: boolean
  digitalClockStyle: DigitalClockStyle
  ledDimOpacity: number
  globeColor: GlobeColor
  ampm?: string
}

export default function DigitalClock({
  hours, minutes, seconds, dateStr,
  clockColor, dateColor, backgroundColor, showDate, digitalClockStyle, ledDimOpacity, globeColor, ampm,
}: Props) {
  if (digitalClockStyle === 'led') {
    return (
      <LedClock
        hours={hours} minutes={minutes} seconds={seconds} dateStr={dateStr}
        clockColor={clockColor} dateColor={dateColor}
        backgroundColor={backgroundColor} showDate={showDate}
        dimOpacity={ledDimOpacity} ampm={ampm}
      />
    )
  }
  if (digitalClockStyle === 'scifi') {
    return (
      <SciFiClock
        hours={hours} minutes={minutes} seconds={seconds} dateStr={dateStr}
        clockColor={clockColor} dateColor={dateColor}
        backgroundColor={backgroundColor} showDate={showDate}
        ampm={ampm}
      />
    )
  }
  if (digitalClockStyle === 'flip') {
    return (
      <FlipClock
        hours={hours} minutes={minutes} seconds={seconds} dateStr={dateStr}
        clockColor={clockColor} dateColor={dateColor}
        backgroundColor={backgroundColor} showDate={showDate}
        ampm={ampm}
      />
    )
  }
  if (digitalClockStyle === 'globe') {
    return (
      <GlobeClock
        hours={hours} minutes={minutes} seconds={seconds} dateStr={dateStr}
        dateColor={dateColor}
        showDate={showDate}
        globeColor={globeColor}
        ampm={ampm}
      />
    )
  }
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        color: clockColor,
        fontSize: 'clamp(40px, 19vw, 340px)',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        lineHeight: 1,
        userSelect: 'none',
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.15em',
      }}>
        <span>{hours}:{minutes}:{seconds}</span>
        {ampm && (
          <span style={{ fontSize: '0.38em', fontWeight: 'normal', letterSpacing: '0.05em' }}>
            {ampm}
          </span>
        )}
      </div>
      {showDate && (
        <div style={{
          color: dateColor,
          fontSize: 'clamp(20px, 7vw, 140px)',
          fontFamily: 'monospace',
          fontWeight: 'normal',
          letterSpacing: '0.08em',
          marginTop: '2vh',
          userSelect: 'none',
        }}>
          {dateStr}
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import ClockView from './ClockView'
import { ClockType, DigitalClockStyle, AnalogClockStyle, GlobeColor } from '../types'

interface Props {
  clockKey: string     // e.g. "digital-default" or "analog-classic"
  globeColor: GlobeColor
  ledDimOpacity: number
  clockColor: string
  backgroundColor: string
  dateColor: string
}

export default function ClockPreview({
  clockKey, globeColor, ledDimOpacity,
  clockColor, backgroundColor, dateColor,
}: Props) {
  const dash      = clockKey.indexOf('-')
  const clockType = clockKey.slice(0, dash) as ClockType
  const style     = clockKey.slice(dash + 1)

  const containerRef = useRef<HTMLDivElement>(null)
  // scale = previewWidth / actualViewportWidth so the clock fills the preview box
  const [scale, setScale] = useState(0.15)

  useEffect(() => {
    if (!containerRef.current) return
    // Use ResizeObserver to track the card's actual rendered width
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width
      if (w > 0) setScale(w / window.innerWidth)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width:        '100%',
        aspectRatio:  '16 / 9',
        overflow:     'hidden',
        position:     'relative',
        borderRadius: 6,
        backgroundColor: backgroundColor,
      }}
    >
      {/* Full-size clock, scaled down to fit the preview box */}
      <div style={{
        width:           '100vw',
        height:          '100vh',
        transform:       `scale(${scale})`,
        transformOrigin: 'top left',
        position:        'absolute',
        pointerEvents:   'none',
      }}>
        <ClockView
          clockType={clockType}
          digitalClockStyle={style as DigitalClockStyle}
          analogClockStyle={style as AnalogClockStyle}
          hours="10"
          minutes="10"
          seconds="30"
          dateStr="2026-04-16"
          clockColor={clockColor}
          dateColor={dateColor}
          backgroundColor={backgroundColor}
          showDate={true}
          showTemperature={false}
          temperaturePosition="top-right"
          temperature={null}
          temperatureUnit="celsius"
          ledDimOpacity={ledDimOpacity}
          globeColor={globeColor}
          ampm={undefined}
        />
      </div>
    </div>
  )
}

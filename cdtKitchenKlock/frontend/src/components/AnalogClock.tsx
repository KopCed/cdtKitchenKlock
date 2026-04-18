import { AnalogClockStyle } from '../types'
import PilotClock from './PilotClock'
import VintageClock from './VintageClock'
import CosmicClock from './CosmicClock'

interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string
  dateColor: string
  backgroundColor: string
  showDate: boolean
  analogClockStyle?: AnalogClockStyle
}

const SIZE = 500
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 220

export default function AnalogClock({
  hours, minutes, seconds,
  dateStr, clockColor, dateColor, backgroundColor, showDate,
  analogClockStyle = 'classic',
}: Props) {
  if (analogClockStyle === 'pilot') {
    return <PilotClock
      hours={hours} minutes={minutes} seconds={seconds}
      dateStr={dateStr} clockColor={clockColor} dateColor={dateColor}
      backgroundColor={backgroundColor} showDate={showDate}
    />
  }

  if (analogClockStyle === 'vintage') {
    return <VintageClock
      hours={hours} minutes={minutes} seconds={seconds}
      dateStr={dateStr} clockColor={clockColor} dateColor={dateColor}
      backgroundColor={backgroundColor} showDate={showDate}
    />
  }

  if (analogClockStyle === 'cosmic') {
    return <CosmicClock
      hours={hours} minutes={minutes} seconds={seconds}
      dateStr={dateStr} clockColor={clockColor} dateColor={dateColor}
      backgroundColor={backgroundColor} showDate={showDate}
    />
  }

  const h = parseInt(hours, 10) % 12
  const m = parseInt(minutes, 10)
  const s = parseInt(seconds, 10)

  // Angles in degrees (0 = 12 o'clock, clockwise)
  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

  function handX(deg: number, len: number) {
    return CX + len * Math.sin((deg * Math.PI) / 180)
  }
  function handY(deg: number, len: number) {
    return CY - len * Math.cos((deg * Math.PI) / 180)
  }

  // Number positions (1–12)
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1
    const angle = num * 30
    const r = RADIUS - 36
    return {
      num,
      x: CX + r * Math.sin((angle * Math.PI) / 180),
      y: CY - r * Math.cos((angle * Math.PI) / 180),
    }
  })

  // Tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = i * 6
    const isHour = i % 5 === 0
    const r1 = RADIUS
    const r2 = isHour ? RADIUS - 12 : RADIUS - 6
    return {
      x1: CX + r1 * Math.sin((angle * Math.PI) / 180),
      y1: CY - r1 * Math.cos((angle * Math.PI) / 180),
      x2: CX + r2 * Math.sin((angle * Math.PI) / 180),
      y2: CY - r2 * Math.cos((angle * Math.PI) / 180),
      isHour,
    }
  })

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
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: 'min(80vw, 80vh)', height: 'min(80vw, 80vh)' }}
      >
        {/* Clock face */}
        <circle cx={CX} cy={CY} r={RADIUS + 5} fill={backgroundColor} stroke={clockColor} strokeWidth={3} />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={clockColor}
            strokeWidth={t.isHour ? 3 : 1.5}
          />
        ))}

        {/* Hour numbers */}
        {numbers.map(({ num, x, y }) => (
          <text
            key={num}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={clockColor}
            fontSize={RADIUS * 0.19}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {num}
          </text>
        ))}

        {/* Hour hand */}
        <line
          x1={CX} y1={CY}
          x2={handX(hourDeg, RADIUS * 0.5)}
          y2={handY(hourDeg, RADIUS * 0.5)}
          stroke={clockColor}
          strokeWidth={10}
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1={CX} y1={CY}
          x2={handX(minDeg, RADIUS * 0.72)}
          y2={handY(minDeg, RADIUS * 0.72)}
          stroke={clockColor}
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1={handX(secDeg + 180, RADIUS * 0.15)}
          y1={handY(secDeg + 180, RADIUS * 0.15)}
          x2={handX(secDeg, RADIUS * 0.85)}
          y2={handY(secDeg, RADIUS * 0.85)}
          stroke="#FF4444"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={8} fill={clockColor} />
        <circle cx={CX} cy={CY} r={4} fill="#FF4444" />
      </svg>

      {showDate && (
        <div style={{
          color: dateColor,
          fontSize: 'clamp(16px, 4vw, 80px)',
          fontFamily: 'monospace',
          marginTop: '2vh',
          letterSpacing: '0.08em',
          userSelect: 'none',
        }}>
          {dateStr}
        </div>
      )}
    </div>
  )
}

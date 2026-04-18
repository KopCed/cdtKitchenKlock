
interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string
  dateColor: string
  backgroundColor: string
  showDate: boolean
}

const SIZE = 500
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER_R   = 235   // outer edge of clock circle
const BEZEL_R   = 205   // inner edge of bezel / outer edge of dial face
const INDEX_OUT = 205   // outer edge of rectangular hour indices
const INDEX_IN  = 181   // inner edge of rectangular hour indices
const INDEX_CTR = (INDEX_OUT + INDEX_IN) / 2   // = 193
const NUM_R     = 158   // radius of number centers

export default function PilotClock({
  hours, minutes, seconds,
  dateStr, clockColor, dateColor, backgroundColor, showDate,
}: Props) {
  const h = parseInt(hours, 10) % 12
  const m = parseInt(minutes, 10)
  const s = parseInt(seconds, 10)

  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

  // 120 bezel ticks — every 3°
  // i % 10 === 0 → hour position (every 30°)
  // i %  2 === 0 → minute position (every 6°)
  // else         → fine tick (every 3°)
  const ticks = Array.from({ length: 120 }, (_, i) => {
    const angle    = i * 3
    const isHour   = i % 10 === 0
    const isMinute = !isHour && i % 2 === 0
    const outerEdge = OUTER_R - 4
    const len = isHour ? 30 : isMinute ? 16 : 8
    const rad = (angle * Math.PI) / 180
    return {
      x1: CX + outerEdge * Math.sin(rad),
      y1: CY - outerEdge * Math.cos(rad),
      x2: CX + (outerEdge - len) * Math.sin(rad),
      y2: CY - (outerEdge - len) * Math.cos(rad),
      isHour,
      isMinute,
    }
  })

  // Rectangular indices at each hour position (0 = 12 o'clock, step 30°)
  const indices = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30
    const rad   = (angle * Math.PI) / 180
    return {
      angle,
      cx: CX + INDEX_CTR * Math.sin(rad),
      cy: CY - INDEX_CTR * Math.cos(rad),
    }
  })
  const indexHalfH = (INDEX_OUT - INDEX_IN) / 2   // 12
  const indexHalfW = 6

  // Numbers 1–12
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const num   = i + 1
    const angle = num * 30
    const rad   = (angle * Math.PI) / 180
    return {
      num,
      x: CX + NUM_R * Math.sin(rad),
      y: CY - NUM_R * Math.cos(rad),
    }
  })

  // Baton hand shapes — wide blade with pointed tip and short tail
  const HH = 115, HT = 24, HW = 14   // hour hand
  const MH = 182, MT = 26, MW = 10   // minute hand

  function batonPoints(fwd: number, tail: number, hw: number): string {
    return [
      `0,${-fwd}`,
      `${hw * 0.5},${-fwd + 12}`,
      `${hw},${-fwd + 35}`,
      `${hw * 0.85},${-fwd * 0.55}`,
      `${hw * 0.55},${-fwd * 0.18}`,
      `${hw * 0.3},0`,
      `0,${tail}`,
      `${-hw * 0.3},0`,
      `${-hw * 0.55},${-fwd * 0.18}`,
      `${-hw * 0.85},${-fwd * 0.55}`,
      `${-hw},${-fwd + 35}`,
      `${-hw * 0.5},${-fwd + 12}`,
    ].join(' ')
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
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: 'min(80vw, 80vh)', height: 'min(80vw, 80vh)' }}
      >
        {/* Outer bezel ring */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill={backgroundColor} stroke={clockColor} strokeWidth={7} />

        {/* Dense bezel tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={clockColor}
            strokeWidth={t.isHour ? 5 : t.isMinute ? 2.5 : 1.5}
            strokeLinecap="butt"
          />
        ))}

        {/* Inner dial separator ring */}
        <circle cx={CX} cy={CY} r={BEZEL_R} fill="none" stroke={clockColor} strokeWidth={2} />

        {/* Rectangular hour indices — radially aligned */}
        {indices.map(({ angle, cx, cy }) => (
          <rect
            key={angle}
            x={cx - indexHalfW}
            y={cy - indexHalfH}
            width={indexHalfW * 2}
            height={indexHalfH * 2}
            fill={clockColor}
            transform={`rotate(${angle}, ${cx}, ${cy})`}
          />
        ))}

        {/* Hour numbers 1–12 */}
        {numbers.map(({ num, x, y }) => (
          <text
            key={num}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={clockColor}
            fontSize={33}
            fontFamily="'Arial Black', 'Arial Bold', Arial, sans-serif"
            fontWeight="900"
          >
            {num}
          </text>
        ))}

        {/* Hour hand — baton with center groove */}
        <g transform={`translate(${CX},${CY}) rotate(${hourDeg})`}>
          <polygon points={batonPoints(HH, HT, HW)} fill={clockColor} />
          <line x1="0" y1={-HH + 5} x2="0" y2={HT - 5}
            stroke={backgroundColor} strokeWidth="3.5" strokeLinecap="butt" />
        </g>

        {/* Minute hand — baton with center groove */}
        <g transform={`translate(${CX},${CY}) rotate(${minDeg})`}>
          <polygon points={batonPoints(MH, MT, MW)} fill={clockColor} />
          <line x1="0" y1={-MH + 5} x2="0" y2={MT - 5}
            stroke={backgroundColor} strokeWidth="3" strokeLinecap="butt" />
        </g>

        {/* Second hand — thin needle with lollipop counterweight */}
        <g transform={`translate(${CX},${CY}) rotate(${secDeg})`}>
          <line x1={0} y1={38} x2={0} y2={-200}
            stroke="#FF4444" strokeWidth={2.5} strokeLinecap="butt" />
          <circle cx={0} cy={26} r={11} fill="#FF4444" />
          <circle cx={0} cy={26} r={5.5} fill={backgroundColor} />
        </g>

        {/* Center cap */}
        <circle cx={CX} cy={CY} r={10} fill={clockColor} />
        <circle cx={CX} cy={CY} r={4.5} fill="#FF4444" />
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

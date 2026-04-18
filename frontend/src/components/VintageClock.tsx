
interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string   // not used — vintage has a fixed palette
  dateColor: string
  backgroundColor: string
  showDate: boolean
}

const SIZE = 500
const CX   = SIZE / 2
const CY   = SIZE / 2

const OUTER_R = 236   // outer edge of dark bezel
const FACE_R  = 207   // inner edge of bezel / outer edge of parchment face
const RING1_R = 203   // outer decorative ring line
const RING2_R = 190   // inner decorative ring line
const NUM_R   = 168   // number centers

// Fixed vintage color palette
const BEZEL = '#1A0A02'   // dark brown/black outer ring
const FACE  = '#F0D898'   // warm parchment
const RING  = '#8B6E14'   // gold-brown decorative rings
const INK   = '#1A0A02'   // numbers and hands
const RED   = '#CC2200'   // second hand
const GOLD  = '#C8A500'   // center pivot

export default function VintageClock({
  hours, minutes, seconds, dateStr, dateColor, backgroundColor, showDate,
}: Props) {
  const h = parseInt(hours, 10) % 12
  const m = parseInt(minutes, 10)
  const s = parseInt(seconds, 10)

  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

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

  // 60 tick marks just inside RING2 — triangles at hour positions, lines at minutes
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle  = i * 6
    const isHour = i % 5 === 0
    const outerR = RING2_R - 2
    const len    = isHour ? 13 : 6
    const rad    = (angle * Math.PI) / 180
    const perpX  = Math.cos(rad)   // tangential direction x
    const perpY  = Math.sin(rad)   // tangential direction y
    return {
      isHour,
      outerX: CX + outerR * Math.sin(rad),
      outerY: CY - outerR * Math.cos(rad),
      innerX: CX + (outerR - len) * Math.sin(rad),
      innerY: CY - (outerR - len) * Math.cos(rad),
      perpX, perpY,
    }
  })

  // Ornate vintage hand — spade tip, narrow body (requires fwd > 50)
  function vintageHand(fwd: number, tail: number, sw: number, bw: number): string {
    return [
      `0,${-fwd}`,
      `${sw},${-fwd + 20}`,
      `${sw - 2},${-fwd + 32}`,
      `${bw + 1},${-fwd + 48}`,
      `${bw},${-58}`,
      `${bw - 1},${-18}`,
      `1.5,0`,
      `0,${tail}`,
      `-1.5,0`,
      `${-(bw - 1)},${-18}`,
      `${-bw},${-58}`,
      `${-(bw + 1)},${-fwd + 48}`,
      `${-(sw - 2)},${-fwd + 32}`,
      `${-sw},${-fwd + 20}`,
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
        {/* Dark outer bezel */}
        <circle cx={CX} cy={CY} r={OUTER_R} fill={BEZEL} />

        {/* Parchment dial face */}
        <circle cx={CX} cy={CY} r={FACE_R} fill={FACE} />

        {/* Outer decorative ring */}
        <circle cx={CX} cy={CY} r={RING1_R} fill="none" stroke={RING} strokeWidth={2} />

        {/* Inner decorative ring */}
        <circle cx={CX} cy={CY} r={RING2_R} fill="none" stroke={RING} strokeWidth={1.5} />

        {/* Tick marks */}
        {ticks.map((t, i) =>
          t.isHour ? (
            <polygon
              key={i}
              points={`
                ${t.outerX + t.perpX * 4.5},${t.outerY + t.perpY * 4.5}
                ${t.outerX - t.perpX * 4.5},${t.outerY - t.perpY * 4.5}
                ${t.innerX},${t.innerY}
              `}
              fill={INK}
            />
          ) : (
            <line
              key={i}
              x1={t.outerX} y1={t.outerY}
              x2={t.innerX} y2={t.innerY}
              stroke={INK}
              strokeWidth={1}
            />
          )
        )}

        {/* Hour numbers 1–12 — large serif */}
        {numbers.map(({ num, x, y }) => (
          <text
            key={num}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={INK}
            fontSize={50}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontWeight="bold"
          >
            {num}
          </text>
        ))}

        {/* Hour hand */}
        <g transform={`translate(${CX},${CY}) rotate(${hourDeg})`}>
          <polygon points={vintageHand(114, 22, 9, 4)} fill={INK} />
        </g>

        {/* Minute hand */}
        <g transform={`translate(${CX},${CY}) rotate(${minDeg})`}>
          <polygon points={vintageHand(174, 24, 7, 3)} fill={INK} />
        </g>

        {/* Second hand — thin red needle with lollipop */}
        <g transform={`translate(${CX},${CY}) rotate(${secDeg})`}>
          <line x1={0} y1={34} x2={0} y2={-196}
            stroke={RED} strokeWidth={2} strokeLinecap="butt" />
          <circle cx={0} cy={24} r={8} fill={RED} />
          <circle cx={0} cy={24} r={4} fill={FACE} />
        </g>

        {/* Center pivot — gold with dark dot */}
        <circle cx={CX} cy={CY} r={9} fill={GOLD} />
        <circle cx={CX} cy={CY} r={4} fill={INK} />
        <circle cx={CX} cy={CY} r={1.5} fill={GOLD} />
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

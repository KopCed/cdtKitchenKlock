
interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string   // not used — cosmic has a fixed palette
  dateColor: string
  backgroundColor: string
  showDate: boolean
}

const SIZE = 500
const CX = SIZE / 2
const CY = SIZE / 2
const FACE_R = 226

// Fixed cosmic palette
const GOLD        = '#C89A18'
const GOLD_BRIGHT = '#F0C840'
const SECOND_COL  = '#FF2233'

// Stars: [x, y, radius, isBright]
const STARS: [number, number, number, boolean][] = [
  // scattered small stars in the sky portion
  [148, 82,  1.5, false], [192, 68,  1.2, false], [232, 90,  1.5, false],
  [270, 72,  1.0, false], [308, 93,  1.5, false], [328, 77,  1.0, false],
  [364, 104, 1.5, false], [162, 120, 1.0, false], [385, 130, 1.2, false],
  [116, 148, 1.0, false], [400, 165, 1.5, false], [100, 180, 1.0, false],
  [414, 200, 1.0, false], [96,  224, 1.5, false], [408, 240, 1.0, false],
  [175, 104, 2.5, false], [344, 117, 2.0, false], [106, 144, 2.0, false],
  [392, 178, 2.0, false], [143, 193, 1.5, false], [374, 218, 1.5, false],
  [200, 135, 1.5, false], [300, 142, 1.8, false], [130, 250, 1.2, false],
  [390, 265, 1.2, false],
  // bright constellation cluster near upper center
  [243, 158, 3.5, true],
  [255, 190, 5.0, true],
  [265, 214, 3.2, true],
  [233, 204, 2.8, true],
  [278, 198, 3.0, true],
]

export default function CosmicClock({
  hours, minutes, seconds, dateStr, dateColor, backgroundColor, showDate,
}: Props) {
  const h = parseInt(hours, 10) % 12
  const m = parseInt(minutes, 10)
  const s = parseInt(seconds, 10)

  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

  const NUM_R = 174
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1
    const angle = num * 30
    const rad = (angle * Math.PI) / 180
    return {
      num,
      x: CX + NUM_R * Math.sin(rad),
      y: CY - NUM_R * Math.cos(rad),
    }
  })

  // Tapered leaf-shaped hand polygon
  function hand(tip: number, tail: number, hw: number): string {
    return [
      `0,${-tip}`,
      `${hw * 0.55},${-(tip * 0.55)}`,
      `${hw},${-(tip * 0.15)}`,
      `${hw * 0.45},${tail * 0.45}`,
      `0,${tail}`,
      `${-hw * 0.45},${tail * 0.45}`,
      `${-hw},${-(tip * 0.15)}`,
      `${-hw * 0.55},${-(tip * 0.55)}`,
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
        <defs>
          {/* Night sky radial gradient — lighter teal at center-top */}
          <radialGradient id="cosmoSky" cx="50%" cy="36%" r="68%">
            <stop offset="0%"   stopColor="#1C5C9C" />
            <stop offset="50%"  stopColor="#0D3068" />
            <stop offset="100%" stopColor="#03102A" />
          </radialGradient>

          {/* Sea/ocean gradient at bottom */}
          <radialGradient id="cosmoSea" cx="50%" cy="0%" r="100%">
            <stop offset="0%"   stopColor="#103050" />
            <stop offset="100%" stopColor="#05141E" />
          </radialGradient>

          {/* Gold glow for numerals and hands */}
          <filter id="cosmoGold" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cyan glow for bright stars */}
          <filter id="cosmoStar" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="cosmoClip">
            <circle cx={CX} cy={CY} r={FACE_R} />
          </clipPath>
        </defs>

        {/* Dark outer rim */}
        <circle cx={CX} cy={CY} r={FACE_R + 8} fill="#04091A" />

        {/* Night sky face */}
        <circle cx={CX} cy={CY} r={FACE_R} fill="url(#cosmoSky)" />

        {/* Ocean layer — lower portion */}
        <g clipPath="url(#cosmoClip)">
          <rect x={0} y={308} width={SIZE} height={SIZE - 308}
            fill="url(#cosmoSea)" opacity={0.9} />
        </g>

        {/* Rocky coastline silhouette */}
        <g clipPath="url(#cosmoClip)">
          <path
            d={[
              'M 22,408',
              'L 55,382', 'L 80,393', 'L 106,364', 'L 130,382',
              'L 153,360', 'L 176,374', 'L 198,353', 'L 220,368',
              'L 248,354', 'L 274,366', 'L 296,350', 'L 322,373',
              'L 344,358', 'L 370,376', 'L 394,361', 'L 418,380',
              'L 442,368', 'L 474,390',
              'L 478,500', 'L 22,500', 'Z',
            ].join(' ')}
            fill="#071422"
          />
        </g>

        {/* Thin gold bezel rings */}
        <circle cx={CX} cy={CY} r={FACE_R}      fill="none" stroke={GOLD} strokeWidth={2.5} opacity={0.55} />
        <circle cx={CX} cy={CY} r={FACE_R - 14} fill="none" stroke={GOLD} strokeWidth={1}   opacity={0.35} />

        {/* Stars — dim ones first, then bright with glow */}
        {STARS.filter(([,,,b]) => !b).map(([x, y, r], i) => (
          <circle key={`s${i}`} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.65} />
        ))}
        {STARS.filter(([,,,b]) => b).map(([x, y, r], i) => (
          <circle key={`b${i}`} cx={x} cy={y} r={r}
            fill="#7AEEFF" opacity={0.95} filter="url(#cosmoStar)" />
        ))}

        {/* Hour numbers — gold with glow */}
        {numbers.map(({ num, x, y }) => (
          <text
            key={num}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={GOLD_BRIGHT}
            fontSize={46}
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="bold"
            filter="url(#cosmoGold)"
          >
            {num}
          </text>
        ))}

        {/* Hour hand */}
        <g transform={`translate(${CX},${CY}) rotate(${hourDeg})`} filter="url(#cosmoGold)">
          <polygon points={hand(116, 20, 8)} fill={GOLD} />
          <line x1={0} y1={-116} x2={0} y2={20}
            stroke={GOLD_BRIGHT} strokeWidth={1.2} opacity={0.45} />
        </g>

        {/* Minute hand */}
        <g transform={`translate(${CX},${CY}) rotate(${minDeg})`} filter="url(#cosmoGold)">
          <polygon points={hand(166, 22, 6)} fill={GOLD} />
          <line x1={0} y1={-166} x2={0} y2={22}
            stroke={GOLD_BRIGHT} strokeWidth={1} opacity={0.45} />
        </g>

        {/* Second hand — thin red */}
        <g transform={`translate(${CX},${CY}) rotate(${secDeg})`}>
          <line x1={0} y1={28} x2={0} y2={-192}
            stroke={SECOND_COL} strokeWidth={1.5} strokeLinecap="round" />
          <circle cx={0} cy={0} r={4} fill={SECOND_COL} />
        </g>

        {/* Center pivot */}
        <circle cx={CX} cy={CY} r={9}   fill={GOLD} />
        <circle cx={CX} cy={CY} r={3.5} fill={SECOND_COL} />
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

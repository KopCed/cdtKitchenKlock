import type { CSSProperties } from 'react'

// Sci-Fi / Cyberpunk klocka
// Använder Orbitron 900 (sci-fi display-font) + blå metallic gradient
// Bakgrundsfärg ignoreras — SciFi-stilen är alltid blå metallisk.
// Om användaren valt en mättad non-vit färg används den som bas-hue.

const DIGIT_W = 78
const COLON_W = 32
const H       = 128
const GAP     = 9
const FONT    = "'Orbitron', 'Nimbus Sans', 'DejaVu Sans', sans-serif"
const FW      = 900

function charWidth(c: string) { return c === ':' ? COLON_W : DIGIT_W }

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '').padEnd(6, '0')
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 200,
  ]
}

function clamp(v: number) { return Math.max(0, Math.min(255, Math.round(v))) }

// Om clockColor är för ljus/grå → default till blå metallic
function ensureSaturated(hex: string): string {
  const [r, g, b] = parseHex(hex)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const maxC = Math.max(r, g, b)
  const sat  = maxC === 0 ? 0 : (maxC - Math.min(r, g, b)) / maxC
  if (lum > 0.72 || sat < 0.28) return '#1565C0'   // default blå
  return hex
}

function scaleC(hex: string, f: number): string {
  const [r, g, b] = parseHex(hex)
  if (f > 1) {
    const t = Math.min(f - 1, 1)
    return `rgb(${clamp(r + (255-r)*t)},${clamp(g + (255-g)*t)},${clamp(b + (255-b)*t)})`
  }
  return `rgb(${clamp(r*f)},${clamp(g*f)},${clamp(b*f)})`
}

interface RowProps {
  chars:  string[]
  color:  string
  style?: CSSProperties
}

function SciFiRow({ chars, color, style }: RowProps) {
  const base = ensureSaturated(color)
  const uid  = base.replace('#', '')

  let xPos = 0
  const items: { ch: string; x: number }[] = []
  for (const ch of chars) {
    items.push({ ch, x: xPos })
    xPos += charWidth(ch) + GAP
  }
  const totalW = xPos - GAP

  // Färgskala — ljust top → bas → mörkt botten
  const c0 = scaleC(base, 1.75)   // near-white topp
  const c1 = scaleC(base, 1.35)   // ljust
  const c2 = base                  // bas
  const c3 = scaleC(base, 0.42)   // mörkt
  const c4 = scaleC(base, 0.14)   // very dark
  const c5 = scaleC(base, 0.04)   // ultra dark (shadow)

  const mainG = `sfmain-${uid}`
  const silvG = `sfsilv-${uid}`

  // Textstorlek och baslinje
  const FS = H * 0.86
  const Y  = H * 0.90
  // Extra tjocklek via stroke (paint-order: stroke fill)
  const SW = 6

  const tp = {
    fontFamily: FONT,
    fontWeight: FW,
    fontSize:   FS,
    textAnchor: 'middle' as const,
  }

  return (
    <svg
      viewBox={`0 0 ${totalW} ${H}`}
      style={{
        display:  'block',
        overflow: 'visible',
        filter:   `drop-shadow(0 0 8px ${c2}) drop-shadow(0 0 24px ${c3})`,
        ...style,
      }}
    >
      <defs>
        {/* userSpaceOnUse → gradient täcker säkert texthöjden */}
        <linearGradient id={mainG} x1="0" y1="0" x2="0" y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={c0} />
          <stop offset="14%"  stopColor={c1} />
          <stop offset="42%"  stopColor={c2} />
          <stop offset="76%"  stopColor={c3} />
          <stop offset="100%" stopColor={c4} />
        </linearGradient>

        {/* Diagonal silverrand — sweepas tvärs hela displayen */}
        <linearGradient id={silvG} x1="0" y1="0" x2={totalW} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="white" stopOpacity={0.00} />
          <stop offset="33%"  stopColor="white" stopOpacity={0.00} />
          <stop offset="44%"  stopColor="white" stopOpacity={0.50} />
          <stop offset="50%"  stopColor="white" stopOpacity={0.75} />
          <stop offset="56%"  stopColor="white" stopOpacity={0.50} />
          <stop offset="67%"  stopColor="white" stopOpacity={0.00} />
          <stop offset="100%" stopColor="white" stopOpacity={0.00} />
        </linearGradient>
      </defs>

      {items.map(({ ch, x: cx }, i) => {
        // ─── kolon ───────────────────────────────────────
        if (ch === ':') {
          const dcx = cx + COLON_W / 2
          const r   = 12
          return (
            <g key={i}>
              {[H * 0.30, H * 0.66].map((dcy, j) => (
                <g key={j}>
                  {/* 3D skugga */}
                  <circle cx={dcx+5} cy={dcy+6} r={r} fill={c5} />
                  <circle cx={dcx+3} cy={dcy+4} r={r} fill={c4} />
                  <circle cx={dcx+1} cy={dcy+2} r={r} fill={c3} />
                  {/* Metallic yta */}
                  <circle cx={dcx} cy={dcy} r={r} fill={`url(#${mainG})`} />
                  {/* Silver glans */}
                  <circle cx={dcx} cy={dcy} r={r} fill={`url(#${silvG})`} />
                  {/* Liten highlight-punkt */}
                  <circle cx={dcx-3} cy={dcy-3} r={3} fill="white" opacity={0.55} />
                </g>
              ))}
            </g>
          )
        }

        // ─── siffra / tecken ─────────────────────────────
        const tx = cx + DIGIT_W / 2

        return (
          <g key={i}>
            {/* 3D-djup: tre skuggade kopior med ökande offset */}
            <text {...tp} x={tx+5} y={Y+6}
              fill={c5} stroke={c5} strokeWidth={SW}
              style={{ paintOrder: 'stroke fill' }}
            >{ch}</text>
            <text {...tp} x={tx+3} y={Y+4}
              fill={c4} stroke={c4} strokeWidth={SW}
              style={{ paintOrder: 'stroke fill' }}
            >{ch}</text>
            <text {...tp} x={tx+1} y={Y+2}
              fill={c3} stroke={c3} strokeWidth={SW}
              style={{ paintOrder: 'stroke fill' }}
            >{ch}</text>

            {/* Metallic yta med gradient */}
            <text {...tp} x={tx} y={Y}
              fill={`url(#${mainG})`}
              stroke={`url(#${mainG})`} strokeWidth={SW}
              style={{ paintOrder: 'stroke fill' }}
            >{ch}</text>

            {/* Diagonal silver-glans overlay */}
            <text {...tp} x={tx} y={Y}
              fill={`url(#${silvG})`}
              stroke={`url(#${silvG})`} strokeWidth={2}
              style={{ paintOrder: 'stroke fill' }}
            >{ch}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  hours:           string
  minutes:         string
  seconds:         string
  dateStr:         string
  clockColor:      string
  dateColor:       string
  backgroundColor: string
  showDate:        boolean
  ampm?:           string
}

export default function SciFiClock({
  hours, minutes, seconds, dateStr,
  clockColor, dateColor, backgroundColor, showDate, ampm,
}: Props) {
  return (
    <div style={{
      width: '100%', height: '100%', backgroundColor,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      userSelect: 'none',
    }}>
      <SciFiRow
        chars={[...hours, ':', ...minutes, ':', ...seconds]}
        color={clockColor}
        style={{ width: '88vw', maxWidth: '88vw' }}
      />
      {ampm && (
        <div style={{
          fontFamily: FONT,
          fontWeight: FW,
          fontSize: 'clamp(14px, 3vw, 56px)',
          color: ensureSaturated(clockColor),
          marginTop: '0.8vw',
          filter: `drop-shadow(0 0 8px ${ensureSaturated(clockColor)})`,
        }}>
          {ampm}
        </div>
      )}
      {showDate && (
        <SciFiRow
          chars={[...dateStr]}
          color={dateColor}
          style={{ width: '58vw', maxWidth: '58vw', marginTop: '2.5vw' }}
        />
      )}
    </div>
  )
}

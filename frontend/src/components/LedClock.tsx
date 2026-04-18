import type { CSSProperties } from 'react'

// 7-segment display – segment rectangles in a 50×90 coordinate space
//
//  ┌─ a ─┐
//  f     b
//  ├─ g ─┤
//  e     c
//  └─ d ─┘
//
const SEG: Record<string, [number, number, number, number]> = {
  //    x   y   w   h
  a: [  9,  0, 32,  9 ],  // top
  b: [ 41,  9,  9, 31 ],  // top-right
  c: [ 41, 49,  9, 32 ],  // bottom-right
  d: [  9, 81, 32,  9 ],  // bottom
  e: [  0, 49,  9, 32 ],  // bottom-left
  f: [  0,  9,  9, 31 ],  // top-left
  g: [  9, 40, 32,  9 ],  // middle
}

const DIGIT_ON: Record<string, string[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'd', 'e', 'g'],
  '3': ['a', 'b', 'c', 'd', 'g'],
  '4': ['b', 'c', 'f', 'g'],
  '5': ['a', 'c', 'd', 'f', 'g'],
  '6': ['a', 'c', 'd', 'e', 'f', 'g'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
}

const DIGIT_W = 50
const COLON_W = 28
const CHAR_H  = 90
const GAP     = 6

function charWidth(c: string) {
  return c === ':' ? COLON_W : DIGIT_W
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16) || 0
  const g = parseInt(hex.slice(3, 5), 16) || 0
  const b = parseInt(hex.slice(5, 7), 16) || 0
  return `rgba(${r},${g},${b},${alpha})`
}

interface LedRowProps {
  chars: string[]
  color: string
  dimOpacity: number
  style?: CSSProperties
}

function LedRow({ chars, color, dimOpacity, style }: LedRowProps) {
  const dim = hexToRgba(color, dimOpacity / 100)

  let x = 0
  const items: { char: string; x: number }[] = []
  for (const c of chars) {
    items.push({ char: c, x })
    x += charWidth(c) + GAP
  }
  const totalW = x - GAP

  return (
    <svg
      viewBox={`0 0 ${totalW} ${CHAR_H}`}
      style={{
        display: 'block',
        overflow: 'visible',
        filter: `drop-shadow(0 0 5px ${hexToRgba(color, 0.7)})`,
        ...style,
      }}
    >
      {items.map(({ char, x: cx }, i) => {
        if (char === ':') {
          return (
            <g key={i} transform={`translate(${cx},0)`}>
              <rect x={9} y={22} width={10} height={10} rx={2} fill={color} />
              <rect x={9} y={58} width={10} height={10} rx={2} fill={color} />
            </g>
          )
        }
        const on = DIGIT_ON[char] ?? []
        return (
          <g key={i} transform={`translate(${cx},0)`}>
            {Object.entries(SEG).map(([seg, [sx, sy, sw, sh]]) => (
              <rect
                key={seg}
                x={sx} y={sy} width={sw} height={sh}
                rx={2}
                fill={on.includes(seg) ? color : dim}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string
  dateColor: string
  backgroundColor: string
  showDate: boolean
  dimOpacity: number
  ampm?: string
}

export default function LedClock({
  hours, minutes, seconds, dateStr,
  clockColor, dateColor, backgroundColor, showDate, dimOpacity, ampm,
}: Props) {
  const timeChars = [...hours, ':', ...minutes, ':', ...seconds]
  const dateChars = [...dateStr]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none',
    }}>
      <LedRow
        chars={timeChars}
        color={clockColor}
        dimOpacity={dimOpacity}
        style={{ width: '88vw', maxWidth: '88vw' }}
      />
      {ampm && (
        <div style={{
          color: clockColor,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: 'clamp(14px, 3vw, 56px)',
          letterSpacing: '0.1em',
          marginTop: '0.8vw',
          userSelect: 'none',
        }}>
          {ampm}
        </div>
      )}
      {showDate && (
        <LedRow
          chars={dateChars}
          color={dateColor}
          dimOpacity={dimOpacity}
          style={{ width: '58vw', maxWidth: '58vw', marginTop: '2.5vw' }}
        />
      )}
    </div>
  )
}

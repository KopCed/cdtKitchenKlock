import type { CSSProperties } from 'react'

interface Props {
  temperature: number
  position: 'top-left' | 'top-right' | 'bot-left' | 'bot-right'
  color: string
  unit: 'celsius' | 'fahrenheit'
}

export default function TemperatureCorner({ temperature, position, color, unit }: Props) {
  const posStyle: CSSProperties = {
    position: 'absolute',
    fontSize: 'clamp(28px, 7vw, 110px)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color,
    padding: '1vw',
    userSelect: 'none',
  }

  if (position === 'top-left')    { posStyle.top = 0; posStyle.left = 0 }
  if (position === 'top-right')   { posStyle.top = 0; posStyle.right = 0 }
  if (position === 'bot-left')    { posStyle.bottom = 0; posStyle.left = 0 }
  if (position === 'bot-right')   { posStyle.bottom = 0; posStyle.right = 0 }

  const display = unit === 'fahrenheit' ? temperature * 9 / 5 + 32 : temperature
  const sign = display > 0 ? '+' : ''
  const label = unit === 'fahrenheit' ? '°F' : '°C'
  return (
    <div style={posStyle}>
      {sign}{display.toFixed(1)}{label}
    </div>
  )
}

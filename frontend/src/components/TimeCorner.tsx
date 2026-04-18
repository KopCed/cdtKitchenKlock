import type { CSSProperties } from 'react'

interface Props {
  hours: string
  minutes: string
  seconds: string
  position: 'top-left' | 'top-right' | 'bot-left' | 'bot-right'
  color: string
  ampm?: string
}

export default function TimeCorner({ hours, minutes, seconds, position, color, ampm }: Props) {
  const posStyle: CSSProperties = {
    position: 'absolute',
    fontSize: 'clamp(28px, 7vw, 110px)',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color,
    padding: '1vw',
    userSelect: 'none',
  }

  if (position === 'top-left')  { posStyle.top = 0; posStyle.left = 0 }
  if (position === 'top-right') { posStyle.top = 0; posStyle.right = 0 }
  if (position === 'bot-left')  { posStyle.bottom = 0; posStyle.left = 0 }
  if (position === 'bot-right') { posStyle.bottom = 0; posStyle.right = 0 }

  return (
    <div style={posStyle}>
      {hours}:{minutes}:{seconds}{ampm && ` ${ampm}`}
    </div>
  )
}

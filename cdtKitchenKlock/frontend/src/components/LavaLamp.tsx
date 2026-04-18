
import { useEffect } from 'react'

// 6 blobs — different colors, sizes, start positions and animation durations
const BLOBS = [
  { color: '#FF3D5A', w: 48, h: 42, x: 5,  y: 8,  dur: 22 },
  { color: '#FF8C00', w: 38, h: 44, x: 60, y: 50, dur: 27 },
  { color: '#FFD700', w: 32, h: 36, x: 40, y: 72, dur: 19 },
  { color: '#8A2BE2', w: 44, h: 38, x: 75, y: 5,  dur: 25 },
  { color: '#00CED1', w: 36, h: 40, x: 18, y: 55, dur: 23 },
  { color: '#FF1493', w: 30, h: 34, x: 52, y: 22, dur: 29 },
]

// Each blob gets its own keyframe path — offsets in vw/vh to stay within screen
const KEYFRAMES = `
  @keyframes ll0 {
    0%,100%{transform:translate(0,0)}
    20%{transform:translate(30vw,20vh)}
    45%{transform:translate(-5vw,45vh)}
    70%{transform:translate(22vw,-15vh)}
  }
  @keyframes ll1 {
    0%,100%{transform:translate(0,0)}
    25%{transform:translate(-35vw,15vh)}
    55%{transform:translate(15vw,-38vh)}
    80%{transform:translate(-18vw,28vh)}
  }
  @keyframes ll2 {
    0%,100%{transform:translate(0,0)}
    30%{transform:translate(-28vw,-30vh)}
    65%{transform:translate(32vw,12vh)}
  }
  @keyframes ll3 {
    0%,100%{transform:translate(0,0)}
    20%{transform:translate(-40vw,22vh)}
    50%{transform:translate(8vw,38vh)}
    75%{transform:translate(-22vw,-28vh)}
  }
  @keyframes ll4 {
    0%,100%{transform:translate(0,0)}
    35%{transform:translate(28vw,36vh)}
    70%{transform:translate(-18vw,-22vh)}
  }
  @keyframes ll5 {
    0%,100%{transform:translate(0,0)}
    25%{transform:translate(18vw,-30vh)}
    50%{transform:translate(-36vw,18vh)}
    80%{transform:translate(12vw,28vh)}
  }
`

export default function LavaLamp() {
  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'lava-lamp-kf'
    el.textContent = KEYFRAMES
    document.head.appendChild(el)
    return () => { document.getElementById('lava-lamp-kf')?.remove() }
  }, [])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#07071A',
      overflow: 'hidden',
    }}>
      {BLOBS.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${b.x}%`,
          top: `${b.y}%`,
          width: `${b.w}vw`,
          height: `${b.h}vh`,
          borderRadius: '50%',
          background: b.color,
          opacity: 0.72,
          filter: 'blur(75px)',
          animation: `ll${i} ${b.dur}s ease-in-out infinite`,
          willChange: 'transform',
        }} />
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { GlobeColor } from '../types'

// ─── CSS injection ─────────────────────────────────────────────────────────────
// Animationen simulerar Y-axelrotation via scaleX + translateX:
//   Gamla siffran glider ut åt vänster medan den kläms ihop (scaleX 1→0)
//   Nya siffran glider in från höger medan den expanderar (scaleX 0→1)
//   Båda körs simultant → båda synliga mitt i övergången

let _injected = false
function injectStyles() {
  if (_injected || typeof document === 'undefined') return
  _injected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes globe-exit {
      0%   { transform: translateX(0%)   scaleX(1);    opacity: 1;   }
      45%  { transform: translateX(-28%) scaleX(0.38); opacity: 0.7; }
      100% { transform: translateX(-62%) scaleX(0.02); opacity: 0;   }
    }
    @keyframes globe-enter {
      0%   { transform: translateX(62%)  scaleX(0.02); opacity: 0;   }
      55%  { transform: translateX(28%)  scaleX(0.38); opacity: 0.7; }
      100% { transform: translateX(0%)   scaleX(1);    opacity: 1;   }
    }
  `
  document.head.appendChild(s)
}

// ─── GlobeSphere ───────────────────────────────────────────────────────────────

interface SphereProps {
  value: string
  size: string
  globeColor: GlobeColor
  fontSize: string
  noAnim?: boolean
}

function GlobeSphere({ value, size, globeColor, fontSize, noAnim = false }: SphereProps) {
  const prevRef         = useRef(value)
  const [rolling, setRolling] = useState(false)
  const [prev,    setPrev]    = useState(value)
  const [curr,    setCurr]    = useState(value)

  useEffect(() => { injectStyles() }, [])

  useEffect(() => {
    if (noAnim) { prevRef.current = value; setCurr(value); return }
    if (value === prevRef.current) return
    setPrev(prevRef.current)
    setCurr(value)
    prevRef.current = value
    setRolling(true)
    const t = setTimeout(() => setRolling(false), 700)
    return () => clearTimeout(t)
  }, [value, noAnim])

  const textBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: '900',
    fontSize,
    letterSpacing: '0.02em',
    textShadow: [
      '0 0 18px rgba(255,255,255,0.85)',
      '0 0 6px rgba(255,255,255,0.60)',
      '0 2px 6px rgba(0,0,0,0.70)',
    ].join(', '),
    userSelect: 'none',
    transformOrigin: 'center center',
    willChange: 'transform',
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
      {/* Sfärbilden — klipps till cirkel, hörnen försvinner geometriskt */}
      <img
        src={`/spheres/${globeColor}.png`}
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Textlager — klippas till sfärens form, hanterar animation */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        overflow: 'hidden',
      }}>
        {rolling ? (
          <>
            <div style={{
              ...textBase,
              animation: 'globe-exit 0.65s cubic-bezier(0.4,0,0.6,1) both',
            }}>
              {prev}
            </div>
            <div style={{
              ...textBase,
              animation: 'globe-enter 0.65s cubic-bezier(0.4,0,0.6,1) both',
            }}>
              {curr}
            </div>
          </>
        ) : (
          <div style={textBase}>{curr}</div>
        )}
      </div>
    </div>
  )
}

// ─── Separatorprickar ─────────────────────────────────────────────────────────

function Separators({ globeColor, size }: { globeColor: GlobeColor; size: string }) {
  return (
    <div style={{
      flexShrink: 0,
      alignSelf: 'center',
      padding: `0 clamp(4px, 1.2vmin, 14px)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: size,
    }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          width: size, height: size, flexShrink: 0,
          borderRadius: '50%', overflow: 'hidden',
        }}>
          <img
            src={`/spheres/${globeColor}.png`}
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      ))}
    </div>
  )
}

// ─── GlobeClock ────────────────────────────────────────────────────────────────

interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  dateColor: string
  showDate: boolean
  ampm?: string
  globeColor: GlobeColor
}

export default function GlobeClock({
  hours, minutes, seconds, dateStr,
  dateColor, showDate, ampm, globeColor,
}: Props) {
  const mainSize  = 'clamp(80px, min(24vw, 36vh), 360px)'
  const colonSize = 'clamp(18px, min(4.5vw, 7vh), 65px)'
  const ampmSize  = 'clamp(36px, min(7.5vw, 10vh), 105px)'
  const mainFont  = 'clamp(26px, 8.5vmin, 124px)'
  const ampmFont  = 'clamp(10px, 2.2vmin, 30px)'

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 'clamp(6px, 1.8vh, 28px)',
    }}>
      {/* Klockrad */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        alignItems: 'flex-end',
      }}>
        <GlobeSphere value={hours}   size={mainSize} globeColor={globeColor} fontSize={mainFont} />
        <Separators globeColor={globeColor} size={colonSize} />
        <GlobeSphere value={minutes} size={mainSize} globeColor={globeColor} fontSize={mainFont} />
        <Separators globeColor={globeColor} size={colonSize} />
        <GlobeSphere value={seconds} size={mainSize} globeColor={globeColor} fontSize={mainFont} />

        {ampm && (
          <div style={{ marginLeft: 'clamp(4px, 1vmin, 12px)', alignSelf: 'flex-end' }}>
            <GlobeSphere value={ampm} size={ampmSize} globeColor={globeColor} fontSize={ampmFont} noAnim />
          </div>
        )}
      </div>

      {/* Datum */}
      {showDate && (
        <div style={{
          color: dateColor,
          fontSize: 'clamp(13px, 3.2vw, 56px)',
          fontFamily: 'monospace',
          letterSpacing: '0.08em',
          userSelect: 'none',
        }}>
          {dateStr}
        </div>
      )}
    </div>
  )
}

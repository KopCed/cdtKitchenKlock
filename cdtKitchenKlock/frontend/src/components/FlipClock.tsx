import { useState, useEffect, useRef, type CSSProperties } from 'react'

// ── CSS-keyframes injekteras en gång i document.head ─────────────────────────
let _injected = false
function injectStyles() {
  if (_injected || typeof document === 'undefined') return
  _injected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes flip-top-out {
      from { transform: perspective(700px) rotateX(0deg); }
      to   { transform: perspective(700px) rotateX(-90deg); }
    }
    @keyframes flip-bot-in {
      from { transform: perspective(700px) rotateX(90deg); }
      to   { transform: perspective(700px) rotateX(0deg); }
    }
  `
  document.head.appendChild(s)
}

// ── Ett blad med en halva (top eller bottom) av ett tal ───────────────────────
// Tekniken: inner wrapper är 200% av containerens höjd (= full korthöjd).
// Top half: inner top=0       → visar övre halvan av centerat tal.
// Bot half: inner top=-100%   → skjuter upp med H/2 → visar nedre halvan.
function renderHalf(
  which: 'top' | 'bottom',
  val: string,
  animation?: 'top-out' | 'bot-in'
): JSX.Element {
  const isTop = which === 'top'

  const outer: CSSProperties = {
    position: 'absolute',
    ...(isTop ? { top: 0 } : { bottom: 0 }),
    left: 0, right: 0,
    height: '50%',
    overflow: 'hidden',
    backgroundColor: isTop ? '#f4f4f4' : '#e6e6e6',
  }

  if (animation === 'top-out') {
    outer.transformOrigin = '50% 100%'             // vikpunkt = nederkant
    outer.animation       = 'flip-top-out 0.26s ease-in both'
    outer.zIndex          = 5
    // Lätt skugga mot nedre halvan ger djupkänsla när bladet faller
    outer.boxShadow       = '0 6px 12px rgba(0,0,0,0.35)'
  } else if (animation === 'bot-in') {
    outer.transformOrigin = '50% 0%'               // vikpunkt = överkant
    outer.animation       = 'flip-bot-in 0.26s ease-out 0.22s both'
    outer.zIndex          = 5
  }

  const inner: CSSProperties = {
    position: 'absolute',
    top: isTop ? 0 : '-100%',
    left: 0, right: 0,
    height: '200%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div key={animation ?? which} style={outer}>
      <div style={inner}>
        <span style={{
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(50px, 14vw, 250px)',
          color: '#111',
          lineHeight: 1,
          userSelect: 'none',
          letterSpacing: '-0.02em',
        }}>
          {val}
        </span>
      </div>
    </div>
  )
}

// ── Ett enskilt flipkort (HH, MM eller SS) ────────────────────────────────────
function FlipCard({ value, ampm }: { value: string; ampm?: string }) {
  const prevRef = useRef(value)
  const [flipping, setFlipping]   = useState(false)
  const [prev, setPrev]           = useState(value)
  const [curr, setCurr]           = useState(value)

  useEffect(() => { injectStyles() }, [])

  useEffect(() => {
    if (value === prevRef.current) return
    setPrev(prevRef.current)
    setCurr(value)
    prevRef.current = value
    setFlipping(true)
    const t = setTimeout(() => setFlipping(false), 620)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div style={{
      position: 'relative',
      width:  'clamp(90px, 22vw, 380px)',
      height: 'clamp(120px, 29vw, 500px)',
      borderRadius: '6px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.35)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Skiljelinje i mitten */}
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        height: '2px',
        backgroundColor: 'rgba(0,0,0,0.22)',
        zIndex: 20,
        transform: 'translateY(-1px)',
      }} />

      {/* Statiska halvor – visar alltid aktuellt värde */}
      {renderHalf('top',    curr)}
      {renderHalf('bottom', curr)}

      {/* Animerade blad */}
      {flipping && renderHalf('top',    prev, 'top-out')}
      {flipping && renderHalf('bottom', curr, 'bot-in')}

      {/* AM/PM i nedre vänstra hörnet av timkortet */}
      {ampm && (
        <div style={{
          position: 'absolute',
          bottom: 'clamp(4px, 1.2vw, 14px)',
          left:   'clamp(5px, 1.4vw, 16px)',
          zIndex: 25,
          fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(10px, 2.2vw, 36px)',
          color: '#111',
          lineHeight: 1,
          userSelect: 'none',
          letterSpacing: '0.03em',
        }}>
          {ampm}
        </div>
      )}
    </div>
  )
}

// ── Separator (två punkter som kolon) ─────────────────────────────────────────
function Separator({ color }: { color: string }) {
  const dot: CSSProperties = {
    width:  'clamp(5px, 1.4vw, 18px)',
    height: 'clamp(5px, 1.4vw, 18px)',
    borderRadius: '50%',
    backgroundColor: color,
  }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 'clamp(6px, 2vw, 28px)',
      padding: '0 clamp(4px, 1.5vw, 20px)',
      // Justera nedåt lite så prickarna hamnar vid kortens centrum
      marginBottom: 'clamp(6px, 2vw, 30px)',
    }}>
      <div style={dot} />
      <div style={dot} />
    </div>
  )
}

// ── Huvud-komponent ───────────────────────────────────────────────────────────
interface Props {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  clockColor: string
  dateColor: string
  backgroundColor: string
  showDate: boolean
  ampm?: string
}

export default function FlipClock({
  hours, minutes, seconds, dateStr,
  clockColor, dateColor, backgroundColor, showDate, ampm,
}: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FlipCard value={hours} ampm={ampm} />
        <Separator color={clockColor} />
        <FlipCard value={minutes} />
        <Separator color={clockColor} />
        <FlipCard value={seconds} />
      </div>

      {showDate && (
        <div style={{
          color: dateColor,
          fontFamily: 'monospace',
          fontWeight: 'normal',
          fontSize: 'clamp(16px, 4.5vw, 82px)',
          marginTop: 'clamp(10px, 3vh, 52px)',
          letterSpacing: '0.08em',
        }}>
          {dateStr}
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Star {
  x: number
  y: number
  r: number          // radius
  alpha: number      // base alpha
  color: string
  twinkle: boolean
  twSpeed: number    // radians/ms
  twPhase: number    // random phase offset
}

interface ShootingStar {
  x: number
  y: number
  angle: number
  speed: number      // px/ms
  len: number
  startTime: number
  duration: number   // ms
}

// ─── Constants ──────────────────────────────────────────────────────────────

const STAR_COUNT  = 300
const SCROLL_PX_MS = 2 / 1000   // 2 px/s → right-to-left (astronomically correct)

// Realistic star color distribution
const STAR_COLORS = [
  { c: '#cce8ff', w: 40 },   // blue-white   (O/B type)
  { c: '#ddeeff', w: 35 },   // near-white blue
  { c: '#ffffff', w: 20 },   // pure white   (A type)
  { c: '#fff8dc', w: 10 },   // yellow-white (F/G type)
  { c: '#ffcc88', w: 4  },   // orange       (K type)
  { c: '#ff9977', w: 1  },   // red-orange   (M type)
]
const COLOR_TOTAL = STAR_COLORS.reduce((s, c) => s + c.w, 0)

function randomStarColor(): string {
  let r = Math.random() * COLOR_TOTAL
  for (const { c, w } of STAR_COLORS) { r -= w; if (r <= 0) return c }
  return '#ffffff'
}

// ─── Constellation patterns ──────────────────────────────────────────────────
// [dx, dy] offsets in pixels from the constellation center.
// No connecting lines — just the star positions. "If you know, you know."

const CONSTELLATIONS: Array<[number, number][]> = [
  // Orion — hourglass/hunter
  [[-80,  60], [  0,  60], [ 80,  60],
   [-100,-20], [ 100,-20],
   [ -70, 130], [ 70, 130]],

  // Big Dipper — ladle
  [[-120, 20], [-60,-20], [0,-10], [60,10],
   [110, 40], [155, 20], [195,-10]],

  // Cassiopeia — W
  [[-120, 30], [-60,-40], [0, 30], [60,-40], [120, 30]],

  // Pleiades — tight cluster (7 sisters)
  [[0, 0], [30,-25], [60, 10], [20, 35],
   [-30, 20], [-50,-15], [15,-50]],

  // Leo — sickle + triangle
  [[-80,-40], [-50,-70], [0,-60], [40,-20], [20, 30], [70, 20]],

  // Cygnus — northern cross
  [[0,-80], [0,-30], [0, 20], [0, 70],
   [-60,-30], [60,-30]],

  // Scorpius — S-curve tail
  [[80,-60], [60,-30], [30,0], [0,20],
   [-20,50], [-30,80], [-10,110], [20,130]],

  // Gemini — twin parallel columns
  [[-50,-60], [-50,0], [-50,60],
   [ 50,-60], [ 50,0], [ 50,60]],

  // Perseus — gentle arc
  [[-80,30], [-40,0], [0,-20], [40,-10], [80,20], [110,60]],

  // Southern Cross — compact cross
  [[0,-50], [0,50], [-40,0], [40,0], [0,0]],
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function fishYates(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeStar(x: number, y: number, sizeMul: number, constellation = false): Star {
  return {
    x, y,
    r:       ((constellation ? 0.9 : 0.3) + Math.random() * (constellation ? 1.3 : 1.5)) * sizeMul,
    alpha:   (constellation ? 0.65 : 0.30) + Math.random() * 0.50,
    color:   randomStarColor(),
    twinkle: Math.random() < (constellation ? 0.5 : 0.25),
    twSpeed: (0.4 + Math.random() * 0.8) * Math.PI * 2 / 6000,
    twPhase: Math.random() * Math.PI * 2,
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  starSize?: number   // multiplikator 0.5–3.0, standard 1.5
}

export default function StarfieldBackground({ starSize = 1.5 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let W = canvas.offsetWidth  || window.innerWidth
    let H = canvas.offsetHeight || window.innerHeight
    const dpr = window.devicePixelRatio || 1

    function setSize() {
      W = canvas!.offsetWidth  || window.innerWidth
      H = canvas!.offsetHeight || window.innerHeight
      canvas!.width  = Math.round(W * dpr)
      canvas!.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ctx = canvas.getContext('2d')!
    setSize()

    // ── Background stars ──────────────────────────────────────────────────
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () =>
      makeStar(Math.random() * W, Math.random() * H, starSize)
    )

    // ── Constellation state ───────────────────────────────────────────────
    let cQueue: number[] = fishYates([...Array(CONSTELLATIONS.length).keys()])
    let activeC: Star[] | null = null
    let nextCTime = Date.now() + 30000 + Math.random() * 60000 // first: 30–90s

    function spawnConstellation() {
      if (cQueue.length === 0) cQueue = fishYates([...Array(CONSTELLATIONS.length).keys()])
      const pattern = CONSTELLATIONS[cQueue.shift()!]
      const cy = H * 0.15 + Math.random() * H * 0.70
      const cx = W + 220
      activeC = pattern.map(([dx, dy]) => makeStar(cx + dx, cy + dy, starSize, true))
    }

    // ── Shooting stars ────────────────────────────────────────────────────
    let shooters: ShootingStar[] = []
    let nextShootTime = Date.now() + 45000 + Math.random() * 75000

    function spawnShooter() {
      const angle = Math.PI + (Math.random() - 0.5) * 0.6  // mostly left, slight diagonal
      shooters.push({
        x:        W * 0.15 + Math.random() * W * 0.70,
        y:        H * 0.05 + Math.random() * H * 0.45,
        angle,
        speed:    (400 + Math.random() * 350) / 1000,  // px/ms
        len:      50 + Math.random() * 90,
        startTime: Date.now(),
        duration:  600 + Math.random() * 400,
      })
    }

    // ── Animation loop ────────────────────────────────────────────────────
    let lastTime = Date.now()
    let rafId: number

    function draw() {
      const now = Date.now()
      const dt  = Math.min(now - lastTime, 50)
      lastTime  = now

      // Background: near-black with a hint of deep blue
      ctx.fillStyle = '#00000A'
      ctx.fillRect(0, 0, W, H)

      // ── Background stars ────────────────────────────────────────────────
      for (const s of stars) {
        s.x -= SCROLL_PX_MS * dt
        if (s.x < -4) { s.x = W + 4; s.y = Math.random() * H }

        let a = s.alpha
        if (s.twinkle) {
          const v = Math.sin(now * s.twSpeed + s.twPhase)
          a *= 0.55 + 0.45 * (v * 0.5 + 0.5)
        }

        ctx.globalAlpha = a
        ctx.fillStyle   = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Constellation stars ──────────────────────────────────────────────
      if (activeC) {
        let allExited = true
        for (const s of activeC) {
          s.x -= SCROLL_PX_MS * dt
          if (s.x > -s.r - 5) allExited = false

          let a = s.alpha
          if (s.twinkle) {
            const v = Math.sin(now * s.twSpeed + s.twPhase)
            a *= 0.55 + 0.45 * (v * 0.5 + 0.5)
          }

          ctx.globalAlpha = a
          ctx.fillStyle   = s.color
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
        if (allExited) {
          activeC = null
          nextCTime = now + 60000 + Math.random() * 90000  // 1–2.5 min gap after exit
        }
      } else if (now >= nextCTime) {
        spawnConstellation()
      }

      // ── Shooting stars ───────────────────────────────────────────────────
      if (now >= nextShootTime) {
        spawnShooter()
        nextShootTime = now + 45000 + Math.random() * 75000
      }

      shooters = shooters.filter(ss => {
        const elapsed  = now - ss.startTime
        const progress = elapsed / ss.duration
        if (progress >= 1) return false

        const opacity  = Math.sin(progress * Math.PI) * 0.85
        const traveled = ss.speed * elapsed
        const hx = ss.x + Math.cos(ss.angle) * traveled
        const hy = ss.y + Math.sin(ss.angle) * traveled
        const tx = hx   - Math.cos(ss.angle) * ss.len
        const ty = hy   - Math.sin(ss.angle) * ss.len

        const grad = ctx.createLinearGradient(tx, ty, hx, hy)
        grad.addColorStop(0, 'rgba(255,255,255,0)')
        grad.addColorStop(1, `rgba(255,255,255,${opacity})`)

        ctx.globalAlpha = 1
        ctx.strokeStyle = grad
        ctx.lineWidth   = 1.5
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(hx, hy)
        ctx.stroke()

        return true
      })

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    const onResize = () => {
      setSize()
      // Redistribute stars into new bounds
      for (const s of stars) {
        if (s.y > H) s.y = Math.random() * H
      }
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  )
}

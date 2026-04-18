import { useState, useEffect } from 'react'

export interface ClockState {
  hours: string
  minutes: string
  seconds: string
  dateStr: string
  date: Date
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  return `${year}-${month}-${day}`
}

function getClockState(now: Date): ClockState {
  return {
    hours: pad(now.getHours()),
    minutes: pad(now.getMinutes()),
    seconds: pad(now.getSeconds()),
    dateStr: formatDate(now),
    date: now,
  }
}

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>(() => getClockState(new Date()))

  useEffect(() => {
    const id = setInterval(() => {
      setState(getClockState(new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return state
}

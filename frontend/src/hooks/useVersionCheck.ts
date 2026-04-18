import { useEffect, useRef } from 'react'

const POLL_INTERVAL_MS = 60_000

export function useVersionCheck() {
  const knownVersion = useRef<string | null>(null)
  const isConfigPage = window.location.pathname === '/config'

  useEffect(() => {
    if (isConfigPage) return

    const check = async () => {
      try {
        const res = await fetch('/api/version')
        if (!res.ok) return
        const { version } = await res.json()
        if (knownVersion.current === null) {
          knownVersion.current = version
        } else if (knownVersion.current !== version) {
          window.location.reload()
        }
      } catch {
      }
    }

    check()
    const id = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isConfigPage])
}

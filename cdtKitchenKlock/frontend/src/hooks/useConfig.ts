import { useState, useEffect, useCallback } from 'react'
import { AppConfig, defaultConfig } from '../types'

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async (): Promise<AppConfig | null> => {
    try {
      const res = await fetch('/api/config')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: AppConfig = await res.json()
      setConfig(prev =>
        JSON.stringify(prev) === JSON.stringify(data) ? prev : data
      )
      setError(null)
      return data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load config')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const saveConfig = useCallback(async (newConfig: AppConfig): Promise<AppConfig | null> => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved: AppConfig = await res.json()
      setConfig(saved)
      return saved
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save config')
      return null
    }
  }, [])

  useEffect(() => {
    fetchConfig()
    const id = setInterval(fetchConfig, 10_000)
    return () => clearInterval(id)
  }, [fetchConfig])

  return { config, loading, error, saveConfig, fetchConfig }
}

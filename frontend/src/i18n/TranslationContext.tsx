import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Translations = Record<string, unknown>

interface TranslationContextValue {
  t: (key: string, vars?: Record<string, string | number>) => string
  availableLocales: string[]
}

const TranslationContext = createContext<TranslationContextValue>({
  t: (key) => key,
  availableLocales: [],
})

function resolve(obj: unknown, key: string): string {
  const parts = key.split('.')
  let cur: unknown = obj
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return key
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === 'string' ? cur : key
}

function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`))
}

interface Props {
  language: string
  children: ReactNode
}

export function TranslationProvider({ language, children }: Props) {
  const [translations, setTranslations] = useState<Translations>({})
  const [availableLocales, setAvailableLocales] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/locales')
      .then(r => r.json())
      .then((langs: string[]) => setAvailableLocales(langs))
      .catch(() => setAvailableLocales(['sv']))
  }, [])

  useEffect(() => {
    if (!language) return
    fetch(`/api/locales/${language}`)
      .then(r => r.json())
      .then((data: Translations) => setTranslations(data))
      .catch(() => {})
  }, [language])

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const str = resolve(translations, key)
    return vars ? interpolate(str, vars) : str
  }

  return (
    <TranslationContext.Provider value={{ t, availableLocales }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}

'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { dictionaries, LOCALES, type Locale } from './dictionaries'

const STORAGE_KEY = 'oman-gold-locale'

type I18nContextValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  /** Translate a dot-path key, e.g. t('nav.home'). Falls back to English, then the key. */
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function resolve(dict: unknown, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), dict)
  return typeof value === 'string' ? value : undefined
}

function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as string[]).includes(value)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  // Load the saved locale after mount (avoids hydration mismatch).
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (isLocale(saved)) {
      setLocaleState(saved)
    }
  }, [])

  const dir: 'ltr' | 'rtl' = locale === 'ar' ? 'rtl' : 'ltr'

  // Keep <html> lang/dir in sync so RTL and fonts work globally.
  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = dir
  }, [locale, dir])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, vars?: Record<string, string | number>) => {
      let text = resolve(dictionaries[locale], key) ?? resolve(dictionaries.en, key) ?? key
      if (vars) {
        for (const [name, val] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(val))
        }
      }
      return text
    }

    return {
      locale,
      dir,
      setLocale,
      toggleLocale: () => setLocale(locale === 'en' ? 'ar' : 'en'),
      t,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, dir])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within a LanguageProvider')
  }
  return ctx
}

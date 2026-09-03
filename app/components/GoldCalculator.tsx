'use client'

import { useState, useEffect, useRef } from 'react'
import BoldSvg from './BoldSvg'
import { useI18n } from '@/lib/i18n/LanguageProvider'

const KARATS = [
  { value: '24k', labelKey: 'calculator.karat24' },
  { value: '22k', labelKey: 'calculator.karat22' },
  { value: '21k', labelKey: 'calculator.karat21' },
  { value: '18k', labelKey: 'calculator.karat18' },
] as const

const QUICK_AMOUNTS = ['1', '5', '10', '50', '100'] as const

function useAnimatedValue(target: number, duration = 450, enabled = true) {
  const [display, setDisplay] = useState(target)
  const prevTarget = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setDisplay(target)
      prevTarget.current = target
      return
    }
    if (target === prevTarget.current) return
    const start = prevTarget.current
    prevTarget.current = target

    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - t) * (1 - t)
      setDisplay(Number((start + (target - start) * eased).toFixed(3)))
      if (t >= 1) prevTarget.current = target
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, enabled])

  return display
}

export default function GoldCalculator() {
  const { t } = useI18n()
  const [grams, setGrams] = useState('10')
  const [karat, setKarat] = useState('22k')
  const [total, setTotal] = useState<number>(0)
  const [pricePerGram, setPricePerGram] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const animatedTotal = useAnimatedValue(total, 450, hasFetched)

  useEffect(() => {
    const numGrams = parseFloat(grams)
    if (!numGrams || numGrams <= 0) {
      setTotal(0)
      setPricePerGram(0)
      setError(null)
      setHasFetched(false)
      return
    }

    const params = new URLSearchParams({ grams: grams.trim(), karat })
    setLoading(true)
    setError(null)
    fetch(`/api/v1/gold/calc?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
          setTotal(0)
          setPricePerGram(0)
          return
        }
        setTotal(data.total_price ?? 0)
        setPricePerGram(data.price_per_gram ?? 0)
        setHasFetched(true)
      })
      .catch(() => {
        setError(t('calculator.failed'))
        setTotal(0)
        setPricePerGram(0)
      })
      .finally(() => setLoading(false))
  }, [grams, karat])

  const showValue = !loading && total > 0

  return (
    <section className="relative w-full max-w-xl mx-auto">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 flex justify-center" aria-hidden>
        <div className="h-64 w-64 rounded-full bg-[#F5BE27]/20 blur-[110px]" />
      </div>

      <div className="text-center mb-8">
        <div className="mb-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/gold.svg" alt="" className="h-9 w-auto" aria-hidden />
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
          {t('calculator.title')}
        </h2>
        <p className="text-[#5c5c5c] text-sm mt-2">{t('calculator.subtitle')}</p>
      </div>

      <div className="relative bg-white rounded-3xl border border-[#e8e4df] shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#F5BE27] to-[#B8860B]" />
        <div className="p-6 sm:p-8 space-y-7">
          {/* Weight */}
          <div>
            <label htmlFor="calc-grams" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              {t('calculator.weight')}
            </label>
            <div className="relative">
              <input
                id="calc-grams"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="w-full rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/40 px-4 py-3.5 pe-10 text-lg font-semibold tabular-nums text-[#1a1a1a] placeholder:font-normal placeholder:text-[#888] transition-all focus:border-[#F5BE27] focus:outline-none focus:ring-2 focus:ring-[#F5BE27]/50"
                placeholder={t('calculator.weightPlaceholder')}
              />
              <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#8a8178]">
                {t('common.g')}
              </span>
            </div>
            {/* Quick amounts */}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => {
                const active = grams === amount
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setGrams(amount)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-[#F5BE27] bg-[#F5BE27]/15 text-[#8b6f2a]'
                        : 'border-[#e8e4df] bg-white text-[#777] hover:border-[#F5BE27]/60'
                    }`}
                  >
                    {amount} {t('common.g')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Karat — segmented control */}
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">{t('calculator.karat')}</label>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label={t('calculator.karat')}>
              {KARATS.map((k) => {
                const active = karat === k.value
                return (
                  <button
                    key={k.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setKarat(k.value)}
                    className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                      active
                        ? 'border-[#F5BE27] bg-[#F5BE27]/15 text-[#1a1a1a] shadow-sm'
                        : 'border-[#e8e4df] bg-white text-[#5c5c5c] hover:border-[#F5BE27]/50'
                    }`}
                  >
                    {k.value}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result panel */}
          <div className="rounded-2xl border border-[#ecdcae] bg-gradient-to-br from-[#FBF3DC] to-[#F5BE27]/15 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8b6f2a]">
              {t('calculator.estimatedValue')}
            </p>

            {error ? (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : (
              <>
                <div className="mt-2 flex items-baseline gap-2 min-h-[3.25rem]">
                  {loading ? (
                    <span className="text-3xl font-semibold tabular-nums text-[#b3a48a]">…</span>
                  ) : (
                    <span className="text-4xl sm:text-5xl font-semibold tabular-nums text-[#1a1a1a]">
                      {total > 0 ? animatedTotal.toFixed(3) : '—'}
                    </span>
                  )}
                  {showValue && (
                    <span className="flex items-center gap-1 text-lg text-[#8a8178]">
                      <BoldSvg className="w-7 h-auto shrink-0" fill="#B8860B" />
                      <span className="sr-only">{t('common.omr')}</span>
                    </span>
                  )}
                </div>

                {showValue && pricePerGram > 0 && (
                  <p className="mt-1 text-xs text-[#9a8e72]">
                    {t('calculator.breakdown', {
                      grams: Number(grams).toLocaleString('en-US'),
                      price: pricePerGram.toFixed(3),
                    })}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

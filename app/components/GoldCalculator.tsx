'use client'

import { useState, useEffect, useRef } from 'react'
import BoldSvg from './BoldSvg'

const KARATS = [
  { value: '24k', label: '24 Karat' },
  { value: '22k', label: '22 Karat' },
  { value: '21k', label: '21 Karat' },
  { value: '18k', label: '18 Karat' },
] as const

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
    fetch(`/api/gold/calc?${params}`)
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
        setError('Failed to calculate')
        setTotal(0)
        setPricePerGram(0)
      })
      .finally(() => setLoading(false))
  }, [grams, karat])

  return (
    <section className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
          Calculate value
        </h2>
        <p className="text-[#5c5c5c] text-sm mt-2">
          Based on latest gold price per gram
        </p>
      </div>

      <div className="relative bg-white rounded-2xl border border-[#e8e4df] shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5BE27] to-[#B8860B]" />
        <div className="p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="calc-grams" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Weight (grams)
              </label>
              <input
                id="calc-grams"
                type="number"
                min="0"
                step="0.1"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/40 text-[#1a1a1a] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#F5BE27]/50 focus:border-[#F5BE27] transition-all"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label htmlFor="calc-karat" className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Karat
              </label>
              <select
                id="calc-karat"
                value={karat}
                onChange={(e) => setKarat(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/40 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F5BE27]/50 focus:border-[#F5BE27] transition-all appearance-none cursor-pointer bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%235c5c5c\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', paddingRight: '2.5rem' }}
              >
                {KARATS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#e8e4df]">
            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}
            <p className="text-sm text-[#5c5c5c] mb-1">Estimated value</p>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-2 min-h-[3rem]">
                {loading ? (
                  <span className="text-2xl sm:text-3xl font-semibold text-[#888] tabular-nums">
                    …
                  </span>
                ) : (
                  <span className="text-3xl sm:text-4xl font-semibold text-[#1a1a1a] tabular-nums">
                    {total > 0 ? animatedTotal.toFixed(3) : '—'}
                  </span>
                )}
                {!loading && total > 0 && (
                  <span className="flex items-center gap-1 text-lg text-[#5c5c5c]">
                    <BoldSvg className="w-6 h-auto shrink-0" fill="#F5BE27" />
                    <span className="sr-only">OMR</span>
                  </span>
                )}
              </div>
              {pricePerGram > 0 && (
                <p className="text-xs text-[#888]">
                  {pricePerGram.toFixed(3)} per gram
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'

const KARATS = [
  { value: '24k', label: '24 Karat' },
  { value: '22k', label: '22 Karat' },
  { value: '21k', label: '21 Karat' },
  { value: '18k', label: '18 Karat' },
] as const

// Placeholder price per gram (22k) for design
const PLACEHOLDER_PRICE_PER_GRAM = 56.835

export default function GoldCalculator() {
  const [grams, setGrams] = useState<string>('10')
  const [karat, setKarat] = useState<string>('22k')

  const numGrams = parseFloat(grams) || 0
  const total = numGrams > 0 ? numGrams * PLACEHOLDER_PRICE_PER_GRAM : 0

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-1 tracking-tight">
        Calculate value
      </h2>
      <p className="text-[#5c5c5c] text-sm mb-8">Estimate based on weight and purity (design)</p>
      <div className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm p-6 md:p-8 max-w-xl">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="grams" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Weight (grams)
            </label>
            <input
              id="grams"
              type="number"
              min="0"
              step="0.1"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/30 text-[#1a1a1a] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#F5BE27]/50 focus:border-[#F5BE27] transition-all"
              placeholder="e.g. 10"
            />
          </div>
          <div>
            <label htmlFor="karat" className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Karat
            </label>
            <select
              id="karat"
              value={karat}
              onChange={(e) => setKarat(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/30 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F5BE27]/50 focus:border-[#F5BE27] transition-all"
            >
              {KARATS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[#e8e4df]">
          <p className="text-sm text-[#5c5c5c]">Estimated value</p>
          <p className="text-3xl font-semibold text-[#1a1a1a] mt-1 tabular-nums">
            {total > 0 ? total.toFixed(3) : '—'} <span className="text-lg font-normal text-[#5c5c5c]">OMR</span>
          </p>
        </div>
      </div>
    </section>
  )
}

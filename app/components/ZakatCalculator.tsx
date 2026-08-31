'use client'

import { useEffect, useMemo, useState } from 'react'
import BoldSvg from './BoldSvg'
import {
  calculateHawl,
  calculateZakatScenario,
  HIJRI_YEAR_DAYS,
  pureGoldWeight,
  ZAKAT_NISAB_GRAMS,
  ZAKAT_RATE,
  type ZakatHolding,
  type ZakatKarat,
} from '@/lib/zakat-calculations'

type ZakatItem = {
  id: number
  grams: string
  karat: ZakatKarat
  personalUse: boolean
}

const KARATS: ZakatKarat[] = [24, 22, 21, 18]

function formatNumber(value: number, digits = 3) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function ResultCard({
  title,
  scenario,
  pricePerGram,
}: {
  title: string
  scenario: ReturnType<typeof calculateZakatScenario>
  pricePerGram: number
}) {
  return (
    <div className="rounded-lg border border-[#e8e4df] bg-[#F0EBE6]/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">{title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            scenario.nisab_met
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {scenario.nisab_met ? 'Zakat is currently due' : 'Zakat is not currently due'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-[#777]">Pure gold</p>
          <p className="mt-1 font-semibold text-[#1a1a1a]">{formatNumber(scenario.pure_weight_grams)} g</p>
        </div>
        <div>
          <p className="text-[#777]">Rate</p>
          <p className="mt-1 font-semibold text-[#1a1a1a]">{(ZAKAT_RATE * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[#777]">Zakat gold</p>
          <p className="mt-1 font-semibold text-[#1a1a1a]">{formatNumber(scenario.zakat_grams)} g</p>
        </div>
        <div>
          <p className="text-[#777]">Zakat cash</p>
          <p className="mt-1 font-semibold text-[#1a1a1a]">{formatNumber(scenario.zakat_amount)} OMR</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#777]">
        Cash value uses {formatNumber(pricePerGram)} OMR per gram for 24k gold.
      </p>
    </div>
  )
}

export default function ZakatCalculator() {
  const [items, setItems] = useState<ZakatItem[]>([
    { id: 1, grams: '100', karat: 21, personalUse: false },
  ])
  const [dbPrice, setDbPrice] = useState<number | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [acquiredDate, setAcquiredDate] = useState('')

  useEffect(() => {
    fetch('/api/v1/gold/latest')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setPriceError(data.error)
          return
        }

        const price = Number(data.prices?.['24k'])
        if (!Number.isFinite(price) || price <= 0) {
          setPriceError('Latest 24k price is unavailable')
          return
        }

        setDbPrice(price)
        setPriceInput(String(price))
        setUpdatedAt(data.updated_at ?? null)
      })
      .catch(() => setPriceError('Failed to load the latest stored 24k price'))
  }, [])

  const pricePerGram = Number(priceInput)
  const validPrice = Number.isFinite(pricePerGram) && pricePerGram > 0

  const holdings = useMemo<ZakatHolding[]>(() => {
    return items
      .map((item) => ({
        grams: Number(item.grams),
        karat: item.karat,
        personalUse: item.personalUse,
      }))
      .filter((item) => Number.isFinite(item.grams) && item.grams > 0)
  }, [items])

  const includingAll = useMemo(
    () => calculateZakatScenario(holdings, validPrice ? pricePerGram : 0),
    [holdings, pricePerGram, validPrice]
  )
  const exemptingPersonalUse = useMemo(
    () => calculateZakatScenario(holdings.filter((item) => !item.personalUse), validPrice ? pricePerGram : 0),
    [holdings, pricePerGram, validPrice]
  )
  const hasPersonalUse = holdings.some((item) => item.personalUse)
  const totalWeight = holdings.reduce((sum, item) => sum + item.grams, 0)
  const hawl = acquiredDate ? calculateHawl(acquiredDate) : null

  function updateItem(id: number, patch: Partial<ZakatItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { id: Date.now(), grams: '', karat: 21, personalUse: false },
    ])
  }

  function removeItem(id: number) {
    setItems((current) => (current.length === 1 ? current : current.filter((item) => item.id !== id)))
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <BoldSvg className="h-auto w-28 sm:w-36" fill="#F5BE27" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a] sm:text-3xl">
          Gold Zakat Calculator
        </h1>
        <p className="mt-2 text-sm text-[#5c5c5c]">
          Estimate zakat on gold using the latest stored 24k OMR price per gram.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-lg">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#F5BE27] to-[#B8860B]" />
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Your gold holdings</h2>
              <button
                type="button"
                onClick={addItem}
                className="rounded-lg bg-[#1a1a1a] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3a3022]"
              >
                Add item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => {
                const grams = Number(item.grams)
                const pureWeight = Number.isFinite(grams) && grams > 0
                  ? pureGoldWeight(grams, item.karat)
                  : 0

                return (
                  <div key={item.id} className="rounded-lg border border-[#e8e4df] bg-[#F0EBE6]/30 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#1a1a1a]">Item {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="text-sm font-medium text-[#8b6f2a] disabled:cursor-not-allowed disabled:text-[#b9b1a8]"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`zakat-grams-${item.id}`} className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                          Weight (grams)
                        </label>
                        <input
                          id={`zakat-grams-${item.id}`}
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.grams}
                          onChange={(event) => updateItem(item.id, { grams: event.target.value })}
                          className="w-full rounded-xl border border-[#e8e4df] bg-white px-4 py-3 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                          placeholder="e.g. 100"
                        />
                      </div>

                      <div>
                        <label htmlFor={`zakat-karat-${item.id}`} className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                          Karat
                        </label>
                        <select
                          id={`zakat-karat-${item.id}`}
                          value={item.karat}
                          onChange={(event) => updateItem(item.id, { karat: Number(event.target.value) as ZakatKarat })}
                          className="w-full rounded-xl border border-[#e8e4df] bg-white px-4 py-3 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                        >
                          {KARATS.map((karat) => (
                            <option key={karat} value={karat}>{karat}k</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="mt-4 flex items-start gap-3 text-sm text-[#4d4d4d]">
                      <input
                        type="checkbox"
                        checked={item.personalUse}
                        onChange={(event) => updateItem(item.id, { personalUse: event.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-[#d2cbc4] text-[#B8860B] focus:ring-[#F5BE27]"
                      />
                      <span>This gold is worn jewelry for personal daily use</span>
                    </label>

                    <p className="mt-3 text-xs text-[#777]">
                      Pure 24k equivalent: {formatNumber(pureWeight)} g
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-4 border-t border-[#e8e4df] pt-5 sm:grid-cols-2">
              <div>
                <label htmlFor="zakat-price" className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                  24k price on payment day (OMR/g)
                </label>
                <input
                  id="zakat-price"
                  type="number"
                  min="0"
                  step="0.001"
                  value={priceInput}
                  onChange={(event) => setPriceInput(event.target.value)}
                  className="w-full rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/40 px-4 py-3 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                />
                <p className="mt-2 text-xs text-[#777]">
                  Default is the latest stored DB price{updatedAt ? ` from ${new Date(updatedAt).toLocaleString('en-US')}` : ''}.
                </p>
                {dbPrice && priceInput !== String(dbPrice) && (
                  <button
                    type="button"
                    onClick={() => setPriceInput(String(dbPrice))}
                    className="mt-2 text-xs font-semibold text-[#8b6f2a]"
                  >
                    Reset to latest stored price
                  </button>
                )}
                {priceError && <p className="mt-2 text-sm text-red-600">{priceError}</p>}
                {!validPrice && <p className="mt-2 text-sm text-red-600">Enter a positive 24k price.</p>}
              </div>

              <div>
                <label htmlFor="zakat-date" className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                  Date you acquired the gold
                </label>
                <input
                  id="zakat-date"
                  type="date"
                  value={acquiredDate}
                  onChange={(event) => setAcquiredDate(event.target.value)}
                  className="w-full rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/40 px-4 py-3 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                />
                <p className="mt-2 text-xs text-[#777]">
                  Hawl is estimated as one lunar year, about {HIJRI_YEAR_DAYS} days.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#e8e4df] bg-white p-5 shadow-lg sm:p-6">
            <div className="mb-5">
              <p className="text-sm text-[#777]">Total entered weight</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-[#1a1a1a]">
                {formatNumber(totalWeight)} g
              </p>
            </div>

            <ResultCard title="Including all gold" scenario={includingAll} pricePerGram={validPrice ? pricePerGram : 0} />

            {hasPersonalUse && (
              <div className="mt-4 space-y-3">
                <ResultCard
                  title="Exempting personal daily-use jewelry"
                  scenario={exemptingPersonalUse}
                  pricePerGram={validPrice ? pricePerGram : 0}
                />
                <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-[#6d5520]">
                  Personally worn jewelry is a point of scholarly difference. This calculator shows both treatments so you can compare them and consult Oman&apos;s official calculator or a qualified scholar.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-lg border border-[#e8e4df] p-4 text-sm text-[#5c5c5c]">
              <p>
                Nisab is {ZAKAT_NISAB_GRAMS}g of pure 24k gold. Non-24k gold is converted with weight x karat / 24.
              </p>
              <p className="mt-2">
                Example: 100g of 21k gold is 100 x 21 / 24 = 87.5g pure gold, so it reaches nisab.
              </p>
            </div>

            {hawl && (
              <div className="mt-5 rounded-lg border border-[#e8e4df] bg-[#F0EBE6]/35 p-4 text-sm">
                <p className="font-semibold text-[#1a1a1a]">
                  {hawl.hawl_completed ? 'Hawl appears completed' : 'Hawl is not completed yet'}
                </p>
                <p className="mt-1 text-[#5c5c5c]">
                  Elapsed: {formatNumber(hawl.elapsed_days, 1)} days. Approximate completion date: {hawl.hawl_completion_date}.
                </p>
                <p className="mt-2 text-xs text-[#777]">
                  Cash zakat should use the 24k price on the day you pay or discharge zakat.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e8e4df] bg-white p-5 text-sm leading-6 text-[#5c5c5c] shadow-lg sm:p-6">
            <h2 className="mb-2 text-base font-semibold text-[#1a1a1a]">How it works</h2>
            <p>
              Zakat on gold is due at 2.5%, or one fortieth, when the aggregated pure gold weight reaches 85 grams and a full Hijri year has passed while owning the nisab.
            </p>
            <p className="mt-3">
              This is an estimate for guidance only. Zakat rulings can vary by scholar and circumstance. For an official calculation, use Oman&apos;s smart Zakat calculator at https://zakah.om/ar/Public/Calculator or consult the relevant authorities.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { LuCoins } from 'react-icons/lu'
import BoldSvg from './BoldSvg'
import { useI18n } from '@/lib/i18n/LanguageProvider'

const KARATS = [
  { key: '24k' as const, purityKey: 'prices.purity24' },
  { key: '22k' as const, purityKey: 'prices.purity22' },
  { key: '21k' as const, purityKey: 'prices.purity21' },
  { key: '18k' as const, purityKey: 'prices.purity18' },
]

type LatestPrices = {
  currency: string
  prices: { '24k': number; '22k': number; '21k': number; '18k': number }
  updated_at: string
  source: string
} | null

export default function GoldPriceCards() {
  const { t } = useI18n()
  const [data, setData] = useState<LatestPrices>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/gold/latest')
      .then((res) => {
        if (!res.ok) throw new Error(`API ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (json.error) {
          setError(json.error)
          return
        }
        setData({
          currency: json.currency ?? 'OMR',
          prices: json.prices ?? { '24k': 0, '22k': 0, '21k': 0, '18k': 0 },
          updated_at: json.updated_at ?? '',
          source: json.source ?? 'goldapi.io',
        })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KARATS.map(({ key }) => (
          <div key={key} className="animate-pulse overflow-hidden rounded-2xl border border-[#e8e4df] bg-white">
            <div className="h-1.5 bg-[#eee6d5]" />
            <div className="p-6">
              <div className="mb-6 h-6 w-16 rounded-full bg-[#efe8dc]" />
              <div className="h-9 w-28 rounded bg-[#efe8dc]" />
              <div className="mt-4 h-3 w-20 rounded bg-[#efe8dc]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-8 text-center">
        <p className="text-[#5c5c5c]">{error ?? t('prices.noData')}</p>
        <p className="mt-2 text-sm text-[#8a8178]">{t('prices.noStored')}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KARATS.map(({ key, purityKey }) => {
          const price = data.prices[key] ?? 0
          const featured = key === '24k'
          return (
            <div
              key={key}
              className={`group overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                featured
                  ? 'border-[#e6cf8c] bg-gradient-to-br from-[#FBF3DC] to-[#F5BE27]/15'
                  : 'border-[#e8e4df] bg-white hover:border-[#F5BE27]/50'
              }`}
            >
              <div className="h-1.5 bg-gradient-to-r from-[#F5BE27] to-[#B8860B]" />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-[#F5BE27]/20 px-3 py-1 text-sm font-bold uppercase text-[#8b6f2a]">
                    {key}
                  </span>
                  <LuCoins className="h-5 w-5 text-[#c9a94a] transition-transform group-hover:scale-110" aria-hidden />
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  {price > 0 ? (
                    <>
                      <span className="text-3xl font-semibold tabular-nums text-[#1a1a1a]">
                        {price.toFixed(3)}
                      </span>
                      <span className="sr-only">{data.currency}</span>
                      <BoldSvg className="h-auto w-6 shrink-0" fill="#B8860B" />
                    </>
                  ) : (
                    <span className="text-3xl font-semibold text-[#b3a48a]">—</span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                  <span className="text-xs text-[#8a8178]">{t('prices.perGram')}</span>
                  <span className="text-xs font-medium text-[#9a8e72]">{t(purityKey)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {data.updated_at && (
        <p className="mt-6 text-center text-xs text-[#9a8e72]">
          {t('prices.updated')} {new Date(data.updated_at).toLocaleString()}
        </p>
      )}
    </div>
  )
}

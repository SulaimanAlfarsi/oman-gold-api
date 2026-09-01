'use client'

import { useEffect, useState } from 'react'
import { AiFillGold } from 'react-icons/ai'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
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
      <section className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {KARATS.map(({ key }) => (
            <Card key={key} className="rounded-3xl border border-border bg-card p-8 animate-pulse">
              <div className="h-16 w-16 rounded-full bg-muted mb-6" />
              <div className="h-4 w-20 bg-muted rounded mb-4" />
              <div className="h-8 w-28 bg-muted rounded" />
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="w-full max-w-5xl mx-auto">
        <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/50 p-8 text-center">
          <p className="text-muted-foreground">{error ?? t('prices.noData')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('prices.noStored')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KARATS.map(({ key, purityKey }) => {
          const price = data.prices[key] ?? 0
          const purity = t(purityKey)
          return (
            <Card
              key={key}
              style={{ ['--accent-color']: '#F5BE27' } as React.CSSProperties}
              className={cn(
                'rounded-3xl overflow-hidden border-2 border-border transition-all duration-300',
                'hover:scale-[1.02] hover:shadow-xl hover:border-[#F5BE27]/50'
              )}
            >
              <CardHeader className="p-8 pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16 rounded-full ring-2 ring-[#F5BE27] ring-offset-4 ring-offset-card shrink-0">
                    <AvatarFallback className="bg-[#F5BE27]/20 text-[#B8860B] text-xl font-semibold">
                      <AiFillGold className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{key}</p>
                    <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
                      {purity}
                    </CardDescription>
                  </div>
                </div>
                <CardTitle className="flex items-center gap-2 flex-wrap text-2xl font-semibold tabular-nums text-card-foreground pt-1">
                  {price > 0 ? (
                    <>
                      {price.toFixed(3)}
                      <span className="sr-only">{data.currency}</span>
                      <BoldSvg className="w-8 h-auto shrink-0" fill="#F5BE27" />
                    </>
                  ) : (
                    '—'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <p className="text-sm text-muted-foreground">{t('prices.perGram')}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {data.updated_at && (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          {t('prices.updated')} {new Date(data.updated_at).toLocaleString()}
        </p>
      )}
    </section>
  )
}

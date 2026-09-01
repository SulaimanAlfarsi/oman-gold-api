'use client'

import { useEffect, useMemo, useState } from 'react'
import BoldSvg from './BoldSvg'
import { useI18n } from '@/lib/i18n/LanguageProvider'
import {
  calculateHawl,
  calculateZakatScenario,
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

function formatNumber(value: number, digits = 2) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** A big, plain-language result banner: is zakat due, and how much. */
function ResultBanner({
  title,
  scenario,
}: {
  title: string
  scenario: ReturnType<typeof calculateZakatScenario>
}) {
  const { t } = useI18n()
  const due = scenario.nisab_met

  return (
    <div
      className={`rounded-2xl border p-5 ${
        due ? 'border-emerald-200 bg-emerald-50/70' : 'border-[#e8e4df] bg-[#F0EBE6]/45'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[#8a8178]">{title}</p>
      <p
        className={`mt-1 text-lg font-semibold ${
          due ? 'text-emerald-800' : 'text-[#5c5c5c]'
        }`}
      >
        {due ? t('zakat.zakatDue') : t('zakat.zakatNotDue')}
      </p>

      {due && (
        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <p className="text-xs text-[#777]">{t('zakat.youPay')}</p>
            <p className="mt-0.5 text-3xl font-semibold tabular-nums text-[#1a1a1a]">
              {formatNumber(scenario.zakat_amount, 3)}{' '}
              <span className="text-base font-medium text-[#8a8178]">{t('common.omr')}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-[#777]">{t('zakat.orInGold')}</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#1a1a1a]">
              {formatNumber(scenario.zakat_grams, 2)}{' '}
              <span className="text-sm font-medium text-[#8a8178]">{t('common.g')}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/** One glossary row inside the collapsible explainer. */
function GlossaryRow({ term, body }: { term: string; body: string }) {
  return (
    <div className="rounded-lg bg-white/70 p-3">
      <p className="text-sm font-semibold text-[#1a1a1a]">{term}</p>
      <p className="mt-1 text-xs leading-5 text-[#5c5c5c]">{body}</p>
    </div>
  )
}

export default function ZakatCalculator() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<ZakatItem[]>([
    { id: 1, grams: '100', karat: 21, personalUse: false },
  ])
  const [dbPrice, setDbPrice] = useState<number | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [priceError, setPriceError] = useState<string | null>(null)
  const [priceLoading, setPriceLoading] = useState(true)
  const [acquiredDate, setAcquiredDate] = useState('')
  const [showGlossary, setShowGlossary] = useState(false)

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
          setPriceError(t('zakat.priceUnavailable'))
          return
        }

        setDbPrice(price)
        setUpdatedAt(data.updated_at ?? null)
      })
      .catch(() => setPriceError(t('zakat.priceLoadFailed')))
      .finally(() => setPriceLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The 24k price is fixed to the latest saved value — not user-editable.
  const pricePerGram = dbPrice ?? 0
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

  const pureWeight = includingAll.pure_weight_grams
  const nisabPct = Math.min(100, (pureWeight / ZAKAT_NISAB_GRAMS) * 100)

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
          <BoldSvg className="h-auto w-24 sm:w-28" fill="#F5BE27" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a] sm:text-3xl">
          {t('zakat.title')}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#5c5c5c]">{t('zakat.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---------------- LEFT: input steps ---------------- */}
        <div className="space-y-6">
          {/* Step 1 — gold holdings */}
          <div className="relative overflow-hidden rounded-2xl border border-[#e8e4df] bg-white shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F5BE27] to-[#B8860B]" />
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-base font-semibold text-[#1a1a1a]">{t('zakat.step1Title')}</h2>
                <p className="mt-1 text-xs text-[#777]">{t('zakat.step1Hint')}</p>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => {
                  const grams = Number(item.grams)
                  const pieceWeight =
                    Number.isFinite(grams) && grams > 0 ? pureGoldWeight(grams, item.karat) : 0

                  return (
                    <div key={item.id} className="rounded-xl border border-[#e8e4df] bg-[#F0EBE6]/30 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#1a1a1a]">
                          {t('zakat.item')} {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-xs font-medium text-[#8b6f2a] disabled:cursor-not-allowed disabled:text-[#b9b1a8]"
                        >
                          {t('zakat.remove')}
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`zakat-grams-${item.id}`}
                            className="mb-1.5 block text-xs font-medium text-[#4d4d4d]"
                          >
                            {t('zakat.weight')}
                          </label>
                          <input
                            id={`zakat-grams-${item.id}`}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.1"
                            value={item.grams}
                            onChange={(event) => updateItem(item.id, { grams: event.target.value })}
                            className="w-full rounded-lg border border-[#e8e4df] bg-white px-3 py-2.5 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                            placeholder={t('zakat.weightPlaceholder')}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`zakat-karat-${item.id}`}
                            className="mb-1.5 block text-xs font-medium text-[#4d4d4d]"
                          >
                            {t('zakat.karat')}
                          </label>
                          <select
                            id={`zakat-karat-${item.id}`}
                            value={item.karat}
                            onChange={(event) =>
                              updateItem(item.id, { karat: Number(event.target.value) as ZakatKarat })
                            }
                            className="w-full rounded-lg border border-[#e8e4df] bg-white px-3 py-2.5 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                          >
                            {KARATS.map((karat) => (
                              <option key={karat} value={karat}>
                                {karat}k
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <label className="mt-3 flex items-start gap-2.5 text-xs text-[#4d4d4d]">
                        <input
                          type="checkbox"
                          checked={item.personalUse}
                          onChange={(event) => updateItem(item.id, { personalUse: event.target.checked })}
                          className="mt-0.5 h-4 w-4 rounded border-[#d2cbc4] text-[#B8860B] focus:ring-[#F5BE27]"
                        />
                        <span>
                          <span className="font-medium text-[#1a1a1a]">{t('zakat.personalUse')}</span>
                          <span className="mt-0.5 block text-[#888]">{t('zakat.personalUseHint')}</span>
                        </span>
                      </label>

                      {pieceWeight > 0 && (
                        <p className="mt-2 text-xs text-[#8a8178]">
                          {t('zakat.pureEquivalent')}: {formatNumber(pieceWeight)} {t('common.g')}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="w-full rounded-lg border border-dashed border-[#c9b98a] bg-[#F5BE27]/10 py-2.5 text-sm font-semibold text-[#8b6f2a] transition-colors hover:bg-[#F5BE27]/20"
              >
                + {t('zakat.addItem')}
              </button>
            </div>
          </div>

          {/* Step 2 — price & date */}
          <div className="rounded-2xl border border-[#e8e4df] bg-white p-5 shadow-lg sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#1a1a1a]">{t('zakat.step2Title')}</h2>
              <p className="mt-1 text-xs text-[#777]">{t('zakat.step2Hint')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Static, read-only 24k price card */}
              <div className="rounded-xl border border-[#e8d9a8] bg-gradient-to-br from-[#FBF3DC] to-[#F5BE27]/15 p-4">
                <div className="flex items-center gap-2">
                  <BoldSvg className="h-auto w-5 shrink-0" fill="#B8860B" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8b6f2a]">
                    {t('zakat.priceCardTitle')}
                  </p>
                </div>

                {priceLoading ? (
                  <p className="mt-3 text-sm text-[#8a8178]">{t('zakat.priceLoading')}</p>
                ) : priceError ? (
                  <p className="mt-3 text-sm text-red-600">{priceError}</p>
                ) : (
                  <>
                    <p className="mt-2 text-3xl font-semibold tabular-nums text-[#1a1a1a]">
                      {formatNumber(pricePerGram, 3)}
                    </p>
                    <p className="text-xs font-medium text-[#8a8178]">{t('zakat.priceCardUnit')}</p>
                    {updatedAt && (
                      <p className="mt-2 text-xs text-[#a59a86]">
                        {t('zakat.priceCardUpdated')} {new Date(updatedAt).toLocaleDateString(locale)}
                      </p>
                    )}
                  </>
                )}

                <p className="mt-3 text-xs leading-5 text-[#9a8e72]">{t('zakat.priceCardHint')}</p>
              </div>

              <div>
                <label htmlFor="zakat-date" className="mb-1.5 block text-xs font-medium text-[#4d4d4d]">
                  {t('zakat.dateLabel')}
                </label>
                <input
                  id="zakat-date"
                  type="date"
                  value={acquiredDate}
                  onChange={(event) => setAcquiredDate(event.target.value)}
                  className="w-full rounded-lg border border-[#e8e4df] bg-[#F0EBE6]/40 px-3 py-2.5 text-[#1a1a1a] outline-none transition-all focus:border-[#F5BE27] focus:ring-2 focus:ring-[#F5BE27]/50"
                />
                <p className="mt-1.5 text-xs text-[#888]">{t('zakat.dateHint')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT: result ---------------- */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[#e8e4df] bg-white p-5 shadow-lg sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-[#1a1a1a]">{t('zakat.step3Title')}</h2>

            {/* Nisab progress */}
            <div className="mb-5">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-[#777]">{t('zakat.pureGold')}</p>
                  <p className="text-2xl font-semibold tabular-nums text-[#1a1a1a]">
                    {formatNumber(pureWeight)}{' '}
                    <span className="text-sm font-medium text-[#8a8178]">{t('common.g')}</span>
                  </p>
                </div>
                <p className="text-xs text-[#888]">
                  {t('zakat.nisabProgress')}: {ZAKAT_NISAB_GRAMS} {t('common.g')}
                </p>
              </div>

              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#efe8df]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    includingAll.nisab_met
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      : 'bg-gradient-to-r from-[#F5BE27] to-[#B8860B]'
                  }`}
                  style={{ width: `${nisabPct}%` }}
                />
              </div>
              <p
                className={`mt-1.5 text-xs font-medium ${
                  includingAll.nisab_met ? 'text-emerald-700' : 'text-[#8a8178]'
                }`}
              >
                {includingAll.nisab_met ? t('zakat.nisabReached') : t('zakat.nisabNotReached')}
              </p>
            </div>

            <ResultBanner title={t('zakat.scenarioAll')} scenario={includingAll} />

            {hasPersonalUse && (
              <div className="mt-4 space-y-3">
                <ResultBanner title={t('zakat.scenarioExempt')} scenario={exemptingPersonalUse} />
                <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-[#6d5520]">
                  {t('zakat.personalUseNote')}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-lg bg-[#F0EBE6]/45 px-4 py-3 text-sm">
              <span className="text-[#777]">{t('zakat.totalWeight')}</span>
              <span className="font-semibold tabular-nums text-[#1a1a1a]">
                {formatNumber(totalWeight)} {t('common.g')} · {t('zakat.rate')} {(ZAKAT_RATE * 100).toFixed(1)}%
              </span>
            </div>

            {validPrice && (
              <p className="mt-3 text-xs text-[#888]">
                {t('zakat.cashNote', { price: formatNumber(pricePerGram, 3) })}
              </p>
            )}

            {hawl && (
              <div className="mt-4 rounded-lg border border-[#e8e4df] bg-[#F0EBE6]/35 p-4 text-sm">
                <p className="font-semibold text-[#1a1a1a]">
                  {hawl.hawl_completed ? t('zakat.hawlDone') : t('zakat.hawlNotDone')}
                </p>
                <p className="mt-1 text-xs text-[#5c5c5c]">
                  {t('zakat.hawlElapsed')} {formatNumber(hawl.elapsed_days, 0)} {t('zakat.hawlDays')} ·{' '}
                  {t('zakat.hawlCompletionDate')} {hawl.hawl_completion_date}
                </p>
                <p className="mt-2 text-xs text-[#888]">{t('zakat.hawlPayNote')}</p>
              </div>
            )}
          </div>

          {/* Collapsible glossary */}
          <div className="rounded-2xl border border-[#e8e4df] bg-white shadow-lg">
            <button
              type="button"
              onClick={() => setShowGlossary((value) => !value)}
              className="flex w-full items-center justify-between p-5 text-start sm:p-6"
              aria-expanded={showGlossary}
            >
              <span className="text-base font-semibold text-[#1a1a1a]">
                {t('zakat.simpleExplainerTitle')}
              </span>
              <span className="text-lg text-[#8b6f2a]">{showGlossary ? '−' : '+'}</span>
            </button>
            {showGlossary && (
              <div className="space-y-2.5 px-5 pb-5 sm:px-6 sm:pb-6">
                <GlossaryRow term={t('zakat.nisabWord')} body={t('zakat.nisabWordBody')} />
                <GlossaryRow term={t('zakat.hawlWord')} body={t('zakat.hawlWordBody')} />
                <GlossaryRow term={t('zakat.rateWord')} body={t('zakat.rateWordBody')} />
                <GlossaryRow term={t('zakat.purityWord')} body={t('zakat.purityWordBody')} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e8e4df] bg-white p-5 text-sm leading-6 text-[#5c5c5c] shadow-lg sm:p-6">
            <h2 className="mb-2 text-base font-semibold text-[#1a1a1a]">{t('zakat.disclaimerTitle')}</h2>
            <p>{t('zakat.disclaimerBody')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

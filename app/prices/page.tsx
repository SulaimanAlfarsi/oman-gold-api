'use client'

import GoldPriceCards from '../components/GoldPriceCards'
import { useI18n } from '@/lib/i18n/LanguageProvider'

export default function PricesPage() {
  const { t } = useI18n()
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F0EBE6] px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-16 flex justify-center" aria-hidden>
        <div className="h-[26rem] w-[26rem] rounded-full bg-[#F5BE27]/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl space-y-12">
        {/* Header */}
        <section className="text-center">
          <div className="mb-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gold.svg" alt="" className="h-10 w-auto" aria-hidden />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#1a1a1a] sm:text-4xl">
            {t('prices.title')}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[#5c5c5c]">{t('prices.description')}</p>
          <p className="mt-4 text-xs text-[#9a8e72]">{t('prices.dataNote')}</p>
        </section>

        {/* Price cards grid */}
        <GoldPriceCards />
      </div>
    </main>
  )
}

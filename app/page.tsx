'use client'

import { Link } from 'next-transition-router'
import { LuCoins, LuCalculator, LuHandCoins } from 'react-icons/lu'
import AnimatedGoldPath from './components/AnimatedGoldPath'
import HeroGoldChart from './components/HeroGoldChart'
import { useI18n } from '@/lib/i18n/LanguageProvider'

export default function Home() {
  const { t } = useI18n()
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F0EBE6]">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[#F5BE27]/20 blur-[120px]" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-[#B8860B]/15 blur-[120px]" />
        <div className="absolute left-[-6rem] top-1/3 h-[22rem] w-[22rem] rounded-full bg-[#F5BE27]/10 blur-[110px]" />
      </div>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-2 pb-2 pt-20 sm:px-3 sm:pb-4 sm:pt-24 md:px-4 md:pb-6 md:pt-28">
        <AnimatedGoldPath />

        <div className="relative z-10 mx-auto w-[calc(100vw-1rem)] min-w-0 max-w-2xl px-0 text-center sm:w-full">
          <h1 className="px-1 text-3xl font-semibold leading-tight tracking-tight text-[#1a1a1a] sm:text-5xl md:text-6xl lg:text-7xl">
            {t('home.titleLine1')}
            <br />
            <span className="bg-gradient-to-r from-[#F5BE27] via-[#D4A017] to-[#B8860B] bg-clip-text text-transparent">
              {t('home.titleLine2')}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-md px-4 text-sm text-[#5c5c5c] sm:mt-5 sm:px-0 sm:text-lg">
            {t('home.subtitle')}
          </p>

          {/* Call-to-action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-7 sm:gap-3">
            <Link
              href="/prices"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[#2a2a2a]"
            >
              <LuCoins className="h-4 w-4" aria-hidden />
              {t('home.ctaPrices')}
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9cfa8] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#5c4d1f] shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#F5BE27] hover:bg-white"
            >
              <LuCalculator className="h-4 w-4" aria-hidden />
              {t('home.ctaCalculator')}
            </Link>
            <Link
              href="/zakat"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9cfa8] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#5c4d1f] shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#F5BE27] hover:bg-white"
            >
              <LuHandCoins className="h-4 w-4" aria-hidden />
              {t('home.ctaZakat')}
            </Link>
          </div>

          <HeroGoldChart />
        </div>
      </section>
    </main>
  )
}

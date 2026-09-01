'use client'

import AnimatedGoldPath from './components/AnimatedGoldPath'
import HeroGoldChart from './components/HeroGoldChart'
import { useI18n } from '@/lib/i18n/LanguageProvider'

export default function Home() {
  const { t } = useI18n()
  return (
    <main className="min-h-screen bg-[#F0EBE6]">
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-2 px-2 sm:pt-24 sm:pb-4 sm:px-3 md:pt-28 md:pb-6 md:px-4">
        <AnimatedGoldPath />
        <div className="relative z-10 mx-auto w-[calc(100vw-1rem)] min-w-0 max-w-2xl px-0 text-center sm:w-full">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1a1a1a] tracking-tight leading-tight px-1">
            {t('home.titleLine1')}
            <br />
            <span className="text-[#B8860B]">{t('home.titleLine2')}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md px-4 text-sm text-[#5c5c5c] sm:mt-4 sm:px-0 sm:text-lg md:mt-6">
            {t('home.subtitle')}
          </p>
          <HeroGoldChart />
        </div>
      </section>
    </main>
  )
}

'use client'

import { Link } from 'next-transition-router'
import {
  LuCoins,
  LuCalculator,
  LuHandCoins,
  LuChartLine,
  LuLanguages,
} from 'react-icons/lu'
import type { IconType } from 'react-icons'
import BoldSvg from '../components/BoldSvg'
import { useI18n } from '@/lib/i18n/LanguageProvider'

type Feature = {
  icon: IconType
  titleKey: string
  bodyKey: string
  href?: string
}

const FEATURES: Feature[] = [
  { icon: LuCoins, titleKey: 'about.featPricesTitle', bodyKey: 'about.featPricesBody', href: '/prices' },
  { icon: LuCalculator, titleKey: 'about.featCalcTitle', bodyKey: 'about.featCalcBody', href: '/calculator' },
  { icon: LuHandCoins, titleKey: 'about.featZakatTitle', bodyKey: 'about.featZakatBody', href: '/zakat' },
  { icon: LuChartLine, titleKey: 'about.featChartTitle', bodyKey: 'about.featChartBody', href: '/' },
  { icon: LuLanguages, titleKey: 'about.featLangTitle', bodyKey: 'about.featLangBody' },
]

function FeatureCard({ feature }: { feature: Feature }) {
  const { t } = useI18n()
  const Icon = feature.icon

  const inner = (
    <>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5BE27]/20 text-[#B8860B]">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold text-[#1a1a1a]">{t(feature.titleKey)}</h3>
      <p className="mt-1.5 text-sm leading-6 text-[#5c5c5c]">{t(feature.bodyKey)}</p>
      {feature.href && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#8b6f2a]">
          {t('about.open')}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
            →
          </span>
        </span>
      )}
    </>
  )

  const baseClass =
    'group block rounded-2xl border border-[#e8e4df] bg-white p-5 shadow-sm transition-all'

  if (feature.href) {
    return (
      <Link href={feature.href} className={`${baseClass} hover:-translate-y-0.5 hover:border-[#F5BE27]/50 hover:shadow-md`}>
        {inner}
      </Link>
    )
  }

  return <div className={baseClass}>{inner}</div>
}

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <main className="min-h-screen bg-[#F0EBE6] pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <BoldSvg className="w-24 h-auto opacity-80" fill="#F5BE27" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
            {t('about.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[#5c5c5c]">{t('about.subtitle')}</p>
        </div>

        {/* Features grid */}
        <section className="mt-14">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a]">{t('about.featuresTitle')}</h2>
            <p className="mt-2 text-sm text-[#777]">{t('about.featuresIntro')}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.titleKey} feature={feature} />
            ))}
          </div>
        </section>

        {/* Written sections */}
        <div className="mt-16 space-y-10 text-[#1a1a1a]">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">{t('about.goldInOmanTitle')}</h2>
            <p className="text-[#4a4a4a] leading-relaxed">{t('about.goldInOmanBody')}</p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">{t('about.apiTitle')}</h2>
            <p className="text-[#4a4a4a] leading-relaxed">{t('about.apiBody')}</p>
          </section>

          <section className="rounded-2xl border border-[#e8e4df] bg-white p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-4">{t('about.karatGuideTitle')}</h2>
            <ul className="grid gap-2 text-[#4a4a4a] sm:grid-cols-2">
              <li><strong className="text-[#1a1a1a]">24k</strong> — {t('about.karat24')}</li>
              <li><strong className="text-[#1a1a1a]">22k</strong> — {t('about.karat22')}</li>
              <li><strong className="text-[#1a1a1a]">21k</strong> — {t('about.karat21')}</li>
              <li><strong className="text-[#1a1a1a]">18k</strong> — {t('about.karat18')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">{t('about.dataTitle')}</h2>
            <p className="text-[#4a4a4a] leading-relaxed">{t('about.dataBody')}</p>
          </section>
        </div>
      </div>
    </main>
  )
}

'use client'

import BoldSvg from './BoldSvg'

const PLACEHOLDER_PRICES = [
  { karat: '24k', label: '24 Karat', price: 62.047, purity: '99.9%' },
  { karat: '22k', label: '22 Karat', price: 56.835, purity: '91.6%' },
  { karat: '21k', label: '21 Karat', price: 54.291, purity: '87.5%' },
  { karat: '18k', label: '18 Karat', price: 46.535, purity: '75%' },
] as const

export default function GoldPriceCards() {
  return (
    <section className="w-full max-w-5xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] mb-1 tracking-tight">
        Price per gram
      </h2>
      <p className="text-[#5c5c5c] text-sm mb-8">Live gold rates in OMR (design)</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLACEHOLDER_PRICES.map((item) => (
          <article
            key={item.karat}
            className="bg-white rounded-2xl border border-[#e8e4df] shadow-sm overflow-hidden hover:shadow-md hover:border-[#F5BE27]/30 transition-all duration-300"
          >
            <div className="h-1.5 bg-[#F5BE27]" aria-hidden />
            <div className="p-5">
              <p className="text-xs font-medium text-[#5c5c5c] uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] mt-1 tabular-nums flex items-center gap-2 flex-wrap">
                {item.price.toFixed(3)}{' '}
                <span className="sr-only">OMR</span>
                <BoldSvg className="w-8 h-auto shrink-0" fill="#F5BE27" />
              </p>
              <p className="text-xs text-[#888] mt-2">{item.purity} gold</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

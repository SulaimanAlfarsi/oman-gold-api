import BoldSvg from '../components/BoldSvg'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F0EBE6] pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <BoldSvg className="w-24 h-auto opacity-80" fill="#F5BE27" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] tracking-tight text-center">
          About Oman Gold
        </h1>
        <p className="mt-4 text-[#5c5c5c] text-center">
          Understanding gold in Oman and how we provide live rates.
        </p>

        <div className="mt-14 space-y-10 text-[#1a1a1a]">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">Gold in Oman</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Gold has a long-standing place in Omani culture, from traditional jewellery to investment and savings. 
              Prices are quoted in Omani Rials (OMR) per gram, and purity is commonly expressed in karats: 24k (pure gold), 
              22k, 21k, and 18k—each representing a different gold-to-alloy ratio used in local and regional markets.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">What This API Does</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Oman Gold API fetches live international gold prices and converts them to OMR per gram for 24k, 22k, 21k, 
              and 18k. You can read the latest rate, see historical snapshots, and calculate the value of a given weight 
              and karat—useful for jewellery, trading, or simple price tracking.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">Karat Guide</h2>
            <ul className="space-y-2 text-[#4a4a4a]">
              <li><strong className="text-[#1a1a1a]">24k</strong> — 99.9% gold (pure)</li>
              <li><strong className="text-[#1a1a1a]">22k</strong> — 91.6% gold (common for jewellery)</li>
              <li><strong className="text-[#1a1a1a]">21k</strong> — 87.5% gold</li>
              <li><strong className="text-[#1a1a1a]">18k</strong> — 75% gold</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold text-[#B8860B] mb-3">Data & Updates</h2>
            <p className="text-[#4a4a4a] leading-relaxed">
              Prices are sourced from goldapi.io and stored periodically so you get both live and historical data. 
              Rates are updated when the price changes, keeping the database clean while still reflecting market movements.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

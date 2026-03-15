import GoldPriceCards from '../components/GoldPriceCards'
import BoldSvg from '../components/BoldSvg'

export default function PricesPage() {
  return (
    <main className="min-h-screen bg-[#F0EBE6] pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
      <div className="w-full max-w-5xl mx-auto">
        {/* Bold.svg - gold bar graphic in Price per gram section */}
        <div className="flex justify-center mb-10">
          <BoldSvg className="w-full max-w-[280px] h-auto" fill="#F5BE27" />
        </div>
        <GoldPriceCards />
      </div>
    </main>
  )
}

import GoldPriceCards from '../components/GoldPriceCards'
import BoldSvg from '../components/BoldSvg'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function PricesPage() {
  return (
    <main className="min-h-screen bg-[#F0EBE6] pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Section header card */}
        <Card className="rounded-3xl border-2 border-[#F5BE27]/30 bg-white/80 shadow-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#F5BE27] to-[#B8860B]" aria-hidden />
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <BoldSvg className="w-32 sm:w-40 h-auto" fill="#F5BE27" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a]">
              Price per gram
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Live gold rates in OMR · 24k, 22k, 21k & 18k
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 pt-0 text-center">
            <p className="text-sm text-muted-foreground">
              Data from goldapi.io · Stored in database when price changes
            </p>
          </CardContent>
        </Card>

        {/* Price cards grid */}
        <section>
          <GoldPriceCards />
        </section>
      </div>
    </main>
  )
}

import AnimatedGoldPath from './components/AnimatedGoldPath'
import HeroGoldChart from './components/HeroGoldChart'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F0EBE6]">
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-2 px-2 sm:pt-24 sm:pb-4 sm:px-3 md:pt-28 md:pb-6 md:px-4">
        <AnimatedGoldPath />
        <div className="relative z-10 text-center w-full max-w-2xl mx-auto px-0">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1a1a1a] tracking-tight leading-tight px-1">
            Gold prices
            <br />
            <span className="text-[#B8860B]">in Oman</span>
          </h1>
          <p className="mt-3 sm:mt-4 md:mt-6 text-[#5c5c5c] text-base sm:text-lg max-w-md mx-auto">
            Live rates per gram in OMR. 24k, 22k, 21k & 18k.
          </p>
          <HeroGoldChart />
        </div>
      </section>
    </main>
  )
}

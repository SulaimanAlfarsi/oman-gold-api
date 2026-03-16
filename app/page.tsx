import AnimatedGoldPath from './components/AnimatedGoldPath'
import HeroGoldChart from './components/HeroGoldChart'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F0EBE6]">
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-4 sm:px-6">
        <AnimatedGoldPath />
        <div className="relative z-10 text-center w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1a1a1a] tracking-tight leading-tight max-w-2xl mx-auto px-1">
            Gold prices
            <br />
            <span className="text-[#B8860B]">in Oman</span>
          </h1>
          <p className="mt-6 text-[#5c5c5c] text-lg max-w-md mx-auto">
            Live rates per gram in OMR. 24k, 22k, 21k & 18k.
          </p>
          <HeroGoldChart />
        </div>
      </section>
    </main>
  )
}

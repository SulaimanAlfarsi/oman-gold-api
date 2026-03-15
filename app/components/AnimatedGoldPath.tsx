'use client'

export default function AnimatedGoldPath() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <svg
        className="w-full h-full scale-110"
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          className="gold-path"
          d="M-50 200 Q 200 80 400 200 T 850 200"
          stroke="#F5BE27"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          className="gold-path gold-path-delay-1"
          d="M-30 220 Q 220 100 420 220 T 870 220"
          stroke="rgba(245, 190, 39, 0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

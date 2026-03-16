'use client'

import { TransitionRouter } from 'next-transition-router'
import React, { useEffect, useRef, ReactNode } from 'react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(DrawSVGPlugin)

const BREAKPOINT = 768

function getDurations() {
  if (typeof window === 'undefined') return { fade: 0.5, path: 1.5 }
  const isResponsive = window.innerWidth < BREAKPOINT
  return isResponsive ? { fade: 0.8, path: 2.5 } : { fade: 0.5, path: 1.5 }
}

function setLeaveCompleteState(overlay: HTMLDivElement | null, path: SVGPathElement | null) {
  if (overlay) gsap.set(overlay, { opacity: 1 })
  if (path) gsap.set(path, { drawSVG: '100%', strokeWidth: 300 })
}

function setEnterCompleteState(path: SVGPathElement | null) {
  if (path) gsap.set(path, { drawSVG: '0%', strokeWidth: 2 })
}

type TransitionWrapperProps = {
  children: ReactNode
}

export default function TransitionWrapper({ children }: TransitionWrapperProps) {
  const transitionOverlayRef = useRef<HTMLDivElement | null>(null)
  const svgPathRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    if (svgPathRef.current) {
      gsap.set(svgPathRef.current, {
        drawSVG: '0%',
        strokeWidth: 2,
      })
    }
  }, [])

    return ( 
        <TransitionRouter auto
        
        leave={(next)=>{
            const overlay = transitionOverlayRef.current
            const path = svgPathRef.current
            if (!overlay || !path) {
              next()
              return () => {}
            }
            const { fade, path: pathDur } = getDurations()
            const tl = gsap.timeline({ onComplete: next })

            tl.set(overlay, { pointerEvents: 'auto' }, 0)
            .to(overlay, {
                opacity: 1,
                duration: fade,
                ease: 'power2.inOut',
            }, 0)
            .to(path, {
                drawSVG: '100%',
                strokeWidth: 300,
                duration: pathDur,
                ease: 'power2.inOut',
            }, 0)

            return () => {
              tl.kill()
              setLeaveCompleteState(overlay, path)
              gsap.set(overlay, { pointerEvents: 'auto' })
            }
        }}

        enter={(next)=>{
            const overlay = transitionOverlayRef.current
            const path = svgPathRef.current
            if (!overlay || !path) {
              next()
              return () => {}
            }
            setLeaveCompleteState(overlay, path)
            const { fade, path: pathDur } = getDurations()
            const tl = gsap.timeline({
              onComplete: () => {
                setEnterCompleteState(path)
                gsap.set(overlay, { pointerEvents: 'none' })
                next()
              },
            })

            tl.to(path, {
                drawSVG: '100% 100%',
                strokeWidth: 2,
                duration: pathDur,
                ease: 'power2.inOut',
            }, 0)
            .to(overlay, {
                opacity: 0,
                duration: fade,
                ease: 'power2.inOut',
            }, pathDur)

            return () => {
              tl.kill()
              setEnterCompleteState(path)
              gsap.set(overlay, { opacity: 0, pointerEvents: 'none' })
            }
        }}
        
        >

            <div ref={transitionOverlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center opacity-0" style={{ pointerEvents: 'none' }} aria-hidden="true">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1316 664"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full scale-130 h-full"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <path
                        ref={svgPathRef}
                        d="M13.4746 291.27C13.4746 291.27 100.646 -18.6724 255.617 16.8418C410.588 52.356 61.0296 431.197 233.017 546.326C431.659 679.299 444.494 21.0125 652.73 100.784C860.967 180.556 468.663 430.709 617.216 546.326C765.769 661.944 819.097 48.2722 988.501 120.156C1174.21 198.957 809.424 543.841 988.501 636.726C1189.37 740.915 1301.67 149.213 1301.67 149.213"
                        stroke="#F5BE27"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {children}
        </TransitionRouter>
    )
}
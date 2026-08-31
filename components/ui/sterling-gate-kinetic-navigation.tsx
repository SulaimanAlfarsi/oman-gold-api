'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { Link } from 'next-transition-router'
import { usePathname } from 'next/navigation'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase)
}

const navItems = [
  { href: '/', label: 'Home', kicker: 'Latest overview' },
  { href: '/prices', label: 'Price per gram', kicker: '24k, 22k, 21k, 18k' },
  { href: '/calculator', label: 'Calculator', kicker: 'Gold value in OMR' },
  { href: '/zakat', label: 'Zakat', kicker: 'Gold zakat estimate' },
  { href: '/about', label: 'About', kicker: 'Project details' },
] as const

export function SterlingGateKineticNavigation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasMountedRef = useRef(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!containerRef.current) return

    try {
      if (!gsap.parseEase('main')) {
        CustomEase.create('main', '0.65, 0.01, 0.05, 0.99')
      }
      gsap.defaults({ ease: 'main', duration: 0.7 })
    } catch {
      gsap.defaults({ ease: 'power2.out', duration: 0.7 })
    }

    const cleanupHandlers: Array<() => void> = []
    const ctx = gsap.context(() => {
      const navWrap = containerRef.current?.querySelector('.nav-overlay-wrapper')
      const menu = containerRef.current?.querySelector('.menu-content')
      const overlay = containerRef.current?.querySelector('.overlay')
      const bgPanels = containerRef.current?.querySelectorAll('.backdrop-layer')
      const menuLinks = containerRef.current?.querySelectorAll('.nav-link')
      const fadeTargets = containerRef.current?.querySelectorAll('[data-menu-fade]')
      const menuButton = containerRef.current?.querySelector('.nav-close-btn')
      const menuButtonTexts = menuButton?.querySelectorAll('p')
      const menuButtonIcon = menuButton?.querySelector('.menu-button-icon')
      const menuItems = containerRef.current?.querySelectorAll('.menu-list-item[data-shape]')
      const shapesContainer = containerRef.current?.querySelector('.ambient-background-shapes')

      gsap.set(navWrap ?? [], { display: 'none' })
      gsap.set(menu ?? [], { xPercent: 120 })
      gsap.set(overlay ?? [], { autoAlpha: 0 })
      gsap.set(bgPanels ?? [], { xPercent: 101 })
      gsap.set(menuLinks ?? [], { yPercent: 140, rotate: 10 })
      gsap.set(fadeTargets ?? [], { autoAlpha: 0, yPercent: 50 })
      gsap.set(menuButtonTexts ?? [], { yPercent: 0 })
      gsap.set(menuButtonIcon ?? [], { rotate: 0 })

      menuItems?.forEach((item) => {
        const shapeIndex = item.getAttribute('data-shape')
        const shape = shapesContainer?.querySelector(`.bg-shape-${shapeIndex}`)

        if (!shape) return

        const shapeEls = shape.querySelectorAll('.shape-element')

        const onEnter = () => {
          shapesContainer?.querySelectorAll('.bg-shape').forEach((shapeNode) => {
            shapeNode.classList.remove('active')
          })
          shape.classList.add('active')

          gsap.fromTo(
            shapeEls,
            { scale: 0.5, opacity: 0, rotation: -10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)', overwrite: 'auto' }
          )
        }

        const onLeave = () => {
          gsap.to(shapeEls, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            overwrite: 'auto',
            onComplete: () => shape.classList.remove('active'),
          })
        }

        item.addEventListener('mouseenter', onEnter)
        item.addEventListener('mouseleave', onLeave)
        cleanupHandlers.push(() => {
          item.removeEventListener('mouseenter', onEnter)
          item.removeEventListener('mouseleave', onLeave)
        })
      })
    }, containerRef)

    return () => {
      cleanupHandlers.forEach((cleanup) => cleanup())
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    const navWrap = containerRef.current.querySelector('.nav-overlay-wrapper')
    const menu = containerRef.current.querySelector('.menu-content')
    const overlay = containerRef.current.querySelector('.overlay')
    const bgPanels = containerRef.current.querySelectorAll('.backdrop-layer')
    const menuLinks = containerRef.current.querySelectorAll('.nav-link')
    const fadeTargets = containerRef.current.querySelectorAll('[data-menu-fade]')
    const menuButton = containerRef.current.querySelector('.nav-close-btn')
    const menuButtonTexts = menuButton?.querySelectorAll('p')
    const menuButtonIcon = menuButton?.querySelector('.menu-button-icon')

    gsap.killTweensOf([
      navWrap,
      menu,
      overlay,
      ...Array.from(bgPanels),
      ...Array.from(menuLinks),
      ...Array.from(fadeTargets),
      ...(menuButtonTexts ? Array.from(menuButtonTexts) : []),
      menuButtonIcon,
    ].filter(Boolean))

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline()

      if (isMenuOpen) {
        navWrap?.setAttribute('data-nav', 'open')
        document.body.style.overflow = 'hidden'

        timeline
          .set(navWrap ?? [], { display: 'block' })
          .set(menu ?? [], { xPercent: 0 }, '<')
          .fromTo(menuButtonTexts ?? [], { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
          .fromTo(menuButtonIcon ?? [], { rotate: 0 }, { rotate: 315 }, '<')
          .fromTo(overlay ?? [], { autoAlpha: 0 }, { autoAlpha: 1 }, '<')
          .fromTo(bgPanels ?? [], { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, '<')
          .fromTo(menuLinks ?? [], { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, '<+=0.35')

        if (fadeTargets?.length) {
          timeline.fromTo(fadeTargets, { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: 'all' }, '<+=0.2')
        }
      } else {
        navWrap?.setAttribute('data-nav', 'closed')
        document.body.style.overflow = ''

        timeline
          .to(overlay ?? [], { autoAlpha: 0 })
          .to(menu ?? [], { xPercent: 120 }, '<')
          .to(menuButtonTexts ?? [], { yPercent: 0 }, '<')
          .to(menuButtonIcon ?? [], { rotate: 0 }, '<')
          .set(navWrap ?? [], { display: 'none' })
      }
    }, containerRef)

    return () => {
      ctx.kill()
    }
  }, [isMenuOpen])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <div ref={containerRef} className="sterling-nav-root">
      <div className="site-header-wrapper">
        <header className="header">
          <div className="container is--full">
            <nav className="nav-row" aria-label="Main navigation">
              <Link href="/" aria-label="Oman Gold API home" className="nav-logo-row">
                <span className="nav-logo-mark" aria-hidden />
                <span className="nav-logo-text">Oman Gold API</span>
              </Link>
              <div className="nav-row__right">
                <div className="nav-toggle-label" onClick={() => setIsMenuOpen((value) => !value)}>
                  <span className="toggle-text">click me</span>
                </div>

                <button
                  type="button"
                  className="nav-close-btn"
                  onClick={() => setIsMenuOpen((value) => !value)}
                  aria-expanded={isMenuOpen}
                  aria-controls="kinetic-menu"
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  <div className="menu-button-text" aria-hidden>
                    <p className="p-large">Menu</p>
                    <p className="p-large">Close</p>
                  </div>
                  <div className="icon-wrap" aria-hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" className="menu-button-icon">
                      <path d="M7.33333 16L7.33333 0L8.66667 0L8.66667 16L7.33333 16Z" fill="currentColor" />
                      <path d="M16 8.66667L0 8.66667L0 7.33333L16 7.33333L16 8.66667Z" fill="currentColor" />
                      <path d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z" fill="currentColor" />
                      <path d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z" fill="currentColor" />
                      <path d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z" fill="currentColor" />
                      <path d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z" fill="currentColor" />
                    </svg>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      <section className="fullscreen-menu-container" id="kinetic-menu">
        <div data-nav="closed" className="nav-overlay-wrapper">
          <div className="overlay" onClick={closeMenu} />
          <nav className="menu-content" aria-label="Expanded navigation">
            <div className="menu-bg">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />

              <div className="ambient-background-shapes" aria-hidden>
                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                  <circle className="shape-element" cx="82" cy="118" r="44" fill="rgba(245,190,39,0.20)" />
                  <circle className="shape-element" cx="302" cy="82" r="62" fill="rgba(184,134,11,0.16)" />
                  <circle className="shape-element" cx="202" cy="302" r="84" fill="rgba(26,26,26,0.08)" />
                </svg>
                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                  <path className="shape-element" d="M0 200 Q100 100, 200 200 T400 200" stroke="rgba(245,190,39,0.20)" strokeWidth="60" fill="none" />
                  <path className="shape-element" d="M0 280 Q100 180, 200 280 T400 280" stroke="rgba(184,134,11,0.16)" strokeWidth="40" fill="none" />
                </svg>
                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <circle
                      key={index}
                      className="shape-element"
                      cx={70 + (index % 4) * 86}
                      cy={70 + Math.floor(index / 4) * 112}
                      r={index % 2 === 0 ? 9 : 13}
                      fill={index % 3 === 0 ? 'rgba(245,190,39,0.30)' : 'rgba(184,134,11,0.24)'}
                    />
                  ))}
                </svg>
                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                  <path className="shape-element" d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100" fill="rgba(245,190,39,0.17)" />
                  <path className="shape-element" d="M250 200 Q310 150, 360 210 Q385 270, 330 315 Q270 350, 228 298 Q190 250, 250 200" fill="rgba(184,134,11,0.13)" />
                </svg>
                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                  <line className="shape-element" x1="0" y1="100" x2="300" y2="400" stroke="rgba(245,190,39,0.18)" strokeWidth="30" />
                  <line className="shape-element" x1="100" y1="0" x2="400" y2="300" stroke="rgba(184,134,11,0.14)" strokeWidth="25" />
                  <line className="shape-element" x1="210" y1="0" x2="400" y2="190" stroke="rgba(26,26,26,0.09)" strokeWidth="20" />
                </svg>
              </div>
            </div>

            <div className="menu-content-wrapper">
              <ul className="menu-list">
                {navItems.map((item, index) => (
                  <li className="menu-list-item" data-shape={index + 1} key={item.href}>
                    <Link
                      href={item.href}
                      className={`nav-link ${pathname === item.href ? 'is-active' : ''}`}
                      onClick={closeMenu}
                    >
                      <span className="nav-link-kicker" data-menu-fade>{item.kicker}</span>
                      <span className="nav-link-text">{item.label}</span>
                      <span className="nav-link-hover-bg" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </section>
    </div>
  )
}

export function Component() {
  return <SterlingGateKineticNavigation />
}

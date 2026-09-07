'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { Link } from 'next-transition-router'
import { usePathname } from 'next/navigation'
import { LuLanguages } from 'react-icons/lu'
import { useI18n } from '@/lib/i18n/LanguageProvider'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase)
}

const navItemKeys = [
  { href: '/', label: 'nav.home', kicker: 'nav.homeKicker' },
  { href: '/prices', label: 'nav.prices', kicker: 'nav.pricesKicker' },
  { href: '/calculator', label: 'nav.calculator', kicker: 'nav.calculatorKicker' },
  { href: '/zakat', label: 'nav.zakat', kicker: 'nav.zakatKicker' },
  { href: '/about', label: 'nav.about', kicker: 'nav.aboutKicker' },
] as const

export function SterlingGateKineticNavigation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasMountedRef = useRef(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { t, locale, toggleLocale } = useI18n()
  const navItems = navItemKeys.map((item) => ({
    href: item.href,
    label: t(item.label),
    kicker: t(item.kicker),
  }))

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
            <nav className="nav-row" aria-label={t('nav.mainNav')}>
              <Link href="/" aria-label={t('nav.brand')} className="nav-logo-row">
                <span className="nav-logo-mark" aria-hidden />
                <span className="nav-logo-text">{t('nav.brand')}</span>
              </Link>
              <div className="nav-row__right">
                <button
                  type="button"
                  className="nav-lang-btn"
                  onClick={toggleLocale}
                  aria-label={t('nav.language')}
                  title={locale === 'en' ? t('nav.switchToArabic') : t('nav.switchToEnglish')}
                >
                  <LuLanguages className="nav-lang-icon" aria-hidden />
                  <span className="nav-lang-code">{locale === 'en' ? 'ع' : 'EN'}</span>
                </button>

                <button
                  type="button"
                  className="nav-close-btn"
                  onClick={() => setIsMenuOpen((value) => !value)}
                  aria-expanded={isMenuOpen}
                  aria-controls="kinetic-menu"
                  aria-label={isMenuOpen ? t('nav.close') : t('nav.menu')}
                >
                  <div className="menu-button-text" aria-hidden>
                    <p className="p-large">{t('nav.menu')}</p>
                    <p className="p-large">{t('nav.close')}</p>
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
          <nav className="menu-content" aria-label={t('nav.expandedNav')}>
            <div className="menu-bg">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />

              <div className="ambient-background-shapes" aria-hidden>
                {/* Home */}
                <svg className="bg-shape bg-shape-1" viewBox="0 0 400 400" fill="none">
                  <g className="shape-element">
                    <g transform="translate(40 40) scale(13.3)" stroke="rgba(184,134,11,0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </g>
                  </g>
                </svg>
                {/* Prices */}
                <svg className="bg-shape bg-shape-2" viewBox="0 0 400 400" fill="none">
                  <g className="shape-element">
                    <g transform="translate(40 40) scale(13.3)" stroke="rgba(184,134,11,0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 7h6v6" />
                      <path d="m22 7-8.5 8.5-5-5L2 17" />
                    </g>
                  </g>
                </svg>
                {/* Calculator */}
                <svg className="bg-shape bg-shape-3" viewBox="0 0 400 400" fill="none">
                  <g className="shape-element">
                    <g transform="translate(40 40) scale(13.3)" stroke="rgba(184,134,11,0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="16" height="20" x="4" y="2" rx="2" />
                      <line x1="8" x2="16" y1="6" y2="6" />
                      <line x1="16" x2="16" y1="14" y2="18" />
                      <path d="M16 10h.01" />
                      <path d="M12 10h.01" />
                      <path d="M8 10h.01" />
                      <path d="M12 14h.01" />
                      <path d="M8 14h.01" />
                      <path d="M12 18h.01" />
                      <path d="M8 18h.01" />
                    </g>
                  </g>
                </svg>
                {/* Zakat */}
                <svg className="bg-shape bg-shape-4" viewBox="0 0 400 400" fill="none">
                  <g className="shape-element">
                    <g transform="translate(40 40) scale(13.3)" stroke="rgba(184,134,11,0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
                      <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
                      <path d="m2 16 6 6" />
                      <circle cx="16" cy="9" r="2.9" />
                      <circle cx="6" cy="5" r="3" />
                    </g>
                  </g>
                </svg>
                {/* About */}
                <svg className="bg-shape bg-shape-5" viewBox="0 0 400 400" fill="none">
                  <g className="shape-element">
                    <g transform="translate(40 40) scale(13.3)" stroke="rgba(184,134,11,0.4)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </g>
                  </g>
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

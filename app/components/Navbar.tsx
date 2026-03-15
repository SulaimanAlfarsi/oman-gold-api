'use client'

import { Fragment, useState, useRef, useEffect } from 'react'
import { Link } from 'next-transition-router'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/prices', label: 'Price per gram' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/about', label: 'About' },
] as const

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block w-6 h-5">
      <span
        className={`absolute left-0 right-0 top-0 h-0.5 w-full bg-current rounded-full transition-all duration-200 origin-center ${
          open ? 'top-1/2 -translate-y-1/2 rotate-45' : ''
        }`}
      />
      <span
        className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-current rounded-full transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
      />
      <span
        className={`absolute left-0 right-0 bottom-0 h-0.5 w-full bg-current rounded-full transition-all duration-200 origin-center ${
          open ? 'top-1/2 -translate-y-1/2 -rotate-45' : ''
        }`}
      />
    </span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        ref={menuRef}
        className="mx-3 mt-3 sm:mx-4 sm:mt-4 md:mx-6 md:mt-6 flex flex-col md:flex-row md:items-center md:justify-center"
      >
        <div className="flex items-center justify-between md:justify-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 md:py-2.5 shadow-sm w-full md:w-auto md:min-w-0">
          <span className="md:hidden text-sm font-semibold text-[#1a1a1a] tracking-tight">Oman Gold</span>
          {/* Desktop: all links in a row */}
          <div className="hidden md:flex items-center gap-2 flex-wrap justify-center">
            {navItems.map(({ href, label }, i) => (
              <Fragment key={href}>
                {i > 0 && <span className="w-px h-4 bg-gray-300 shrink-0" aria-hidden />}
                <Link
                  href={href}
                  className={`text-sm font-medium tracking-tight transition-colors px-1 ${
                    pathname === href ? 'text-[#B8860B]' : 'text-gray-700 hover:text-[#B8860B]'
                  }`}
                >
                  {label}
                </Link>
              </Fragment>
            ))}
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
            className="md:hidden p-1 -m-1 rounded-lg text-gray-700 hover:text-[#B8860B] hover:bg-gray-100 transition-colors"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <MenuIcon open={open} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          id="nav-menu"
          className={`md:hidden mt-2 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-200 ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible h-0 mt-0 overflow-hidden'
          }`}
        >
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-4 py-3 text-sm font-medium border-b border-gray-100 last:border-0 transition-colors ${
                pathname === href ? 'text-[#B8860B] bg-amber-50/50' : 'text-gray-700 hover:bg-gray-50 hover:text-[#B8860B]'
              }`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

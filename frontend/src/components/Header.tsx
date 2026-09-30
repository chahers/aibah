import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { BagIcon, ChevronDown, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './Icons'
import SearchPanel from './SearchPanel'

const primary = [
  { to: '/', label: 'Home.', end: true },
  { to: '/shop', label: 'Shop.', end: false },
  { to: '/about', label: 'About AIBAH.', end: true },
]

export const moreLinks = [
  { to: '/faq', label: 'FAQ.' },
  { to: '/contact', label: 'Contact Us.' },
  { to: '/track-order', label: 'Track Your Order.' },
  { to: '/care', label: 'Products Care Instructions' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-base font-medium transition-colors md:text-lg ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`

export default function Header({ overlay = false }: { overlay?: boolean }) {
  const { count, openCart } = useCart()
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMoreOpen(false)
    setMobileOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!moreOpen) return
    const onPointer = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMoreOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  const moreActive = moreLinks.some((l) => pathname.startsWith(l.to))

  return (
    <header
      className={`z-30 text-white ${overlay ? 'absolute inset-x-0 top-0' : 'relative border-b border-white/20 bg-black'}`}
    >
      <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-8 lg:px-14">
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {primary.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 text-lg font-medium transition-colors ${moreActive || moreOpen ? 'text-white' : 'text-white/70 hover:text-white'}`}
            >
              More
              <ChevronDown
                width={16}
                height={16}
                className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {moreOpen && (
              <ul className="absolute left-0 top-full z-40 mt-3 w-60 bg-black py-2 shadow-xl ring-1 ring-white/15">
                {moreLinks.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="block px-5 py-2.5 text-base text-white/80 hover:bg-white/10 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className="flex items-center gap-5 md:gap-7">
          <button type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <Link to="/account" aria-label="Account">
            <UserIcon />
          </Link>
          <button type="button" aria-label={`Open cart, ${count} items`} onClick={openCart} className="relative">
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-semibold text-black">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Mobile" className="border-t border-white/20 bg-black px-5 pb-6 pt-3 md:hidden">
          <ul className="space-y-1">
            {[...primary, ...moreLinks].map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end className={({ isActive }) => `block py-2.5 text-lg ${isActive ? 'text-white' : 'text-white/70'}`}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

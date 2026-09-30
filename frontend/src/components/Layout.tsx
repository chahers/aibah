import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AnnouncementBar from './AnnouncementBar'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'

export default function Layout({ children, overlayHeader = false }: { children: ReactNode; overlayHeader?: boolean }) {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    // Pages with a #hash (e.g. /faq#size-chart) handle their own scrolling
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <div className="relative">
        <Header overlay={overlayHeader} />
        <main id="main">{children}</main>
      </div>
      <Footer />
      <CartDrawer />
    </>
  )
}

import { Link } from 'react-router-dom'
import Newsletter from './Newsletter'

const helpful = [
  { to: '/about', label: 'About Us.' },
  { to: '/faq', label: 'FAQ.' },
  { to: '/contact', label: 'Contact Us.' },
  { to: '/track-order', label: 'Track Your Order.' },
  { to: '/care', label: 'Products Care Instructions' },
]

export default function Footer() {
  return (
    <footer>
      <div className="bg-ash px-5 py-14 md:px-8 lg:px-14">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="display-tight mb-8 max-w-lg text-5xl font-extrabold uppercase md:text-6xl">
              Be the first to know what's next.
            </h2>
            <Newsletter />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold">Helpful Links</h2>
            <ul className="mt-6 space-y-3.5 text-lg">
              {helpful.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="relative flex items-center bg-black px-5 py-6 text-sm text-white md:px-8 lg:px-14">
        <span>© 2026 AIBAH</span>
        <Link to="/terms" className="absolute left-1/2 -translate-x-1/2 hover:underline">
          Terms and Policies
        </Link>
      </div>
    </footer>
  )
}

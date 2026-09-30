import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, productPath, products } from '../data/products'
import { CloseIcon, SearchIcon } from './Icons'

export default function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? products.filter((p) => p.title.toLowerCase().includes(q)) : []
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={onClose}>
      <div className="bg-white p-5 text-black md:px-14 md:py-8" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 border-b border-black pb-3">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-xl outline-none placeholder:text-black/40"
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <CloseIcon />
          </button>
        </div>
        {query.trim() && (
          <ul className="mt-4 space-y-3">
            {results.length === 0 && <li className="text-black/60">No products match “{query.trim()}”.</li>}
            {results.map((p) => (
              <li key={p.handle}>
                <Link to={productPath(p)} className="flex items-center gap-4 hover:underline">
                  <img src={p.cardImage} alt="" className="h-16 w-14 object-cover" />
                  <span>
                    <span className="block font-medium">{p.title}</span>
                    <span className="font-serif text-sm italic">{formatPrice(p.price)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

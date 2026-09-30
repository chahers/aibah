import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getProduct, type SizeLabel } from '../data/products'

export interface CartLine {
  handle: string
  size: SizeLabel
  quantity: number
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addLine: (line: CartLine) => void
  setQuantity: (handle: string, size: SizeLabel, quantity: number) => void
  removeLine: (handle: string, size: SizeLabel) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.handle === line.handle && l.size === line.size)
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, quantity: l.quantity + line.quantity } : l))
      }
      return [...prev, line]
    })
    setIsOpen(true)
  }, [])

  const setQuantity = useCallback((handle: string, size: SizeLabel, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.handle === handle && l.size === size ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    )
  }, [])

  const removeLine = useCallback((handle: string, size: SizeLabel) => {
    setLines((prev) => prev.filter((l) => !(l.handle === handle && l.size === size)))
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0)
    const subtotal = lines.reduce((sum, l) => sum + (getProduct(l.handle)?.price ?? 0) * l.quantity, 0)
    return {
      lines,
      count,
      subtotal,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      setQuantity,
      removeLine,
    }
  }, [lines, isOpen, addLine, setQuantity, removeLine])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

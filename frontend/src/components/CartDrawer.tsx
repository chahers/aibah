import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, getProduct, productPath } from '../data/products'
import { CloseIcon, MinusIcon, PlusIcon } from './Icons'

export default function CartDrawer() {
  const { isOpen, closeCart, lines, subtotal, setQuantity, removeLine } = useCart()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onMouseDown={closeCart}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className="flex h-full w-full max-w-md flex-col bg-white p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Cart</h2>
          <button type="button" onClick={closeCart} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="mt-10 flex-1">
            <p className="text-lg">Your cart is empty.</p>
            <Link to="/shop" onClick={closeCart} className="mt-4 inline-block rounded-full bg-black px-6 py-3 text-white">
              Shop Collection 00
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 flex-1 space-y-6 overflow-y-auto">
              {lines.map((line) => {
                const product = getProduct(line.handle)
                if (!product) return null
                return (
                  <li key={`${line.handle}-${line.size}`} className="flex gap-4">
                    <img src={product.cardImage} alt="" className="h-28 w-24 object-cover" />
                    <div className="flex-1">
                      <Link to={productPath(product)} onClick={closeCart} className="font-medium hover:underline">
                        {product.title}
                      </Link>
                      <p className="text-sm text-black/60">Size {line.size}</p>
                      <p className="font-serif text-sm italic">{formatPrice(product.price)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-black">
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center"
                            aria-label="Decrease quantity"
                            onClick={() => setQuantity(line.handle, line.size, line.quantity - 1)}
                          >
                            <MinusIcon width={14} height={14} />
                          </button>
                          <span className="w-6 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            className="grid h-9 w-9 place-items-center"
                            aria-label="Increase quantity"
                            onClick={() => setQuantity(line.handle, line.size, line.quantity + 1)}
                          >
                            <PlusIcon width={14} height={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="text-sm underline"
                          onClick={() => removeLine(line.handle, line.size)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-black pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-black/60">Taxes included. Delivery across Malaysia is complimentary.</p>
              <button type="button" className="mt-4 w-full rounded-full bg-black py-3.5 text-white">
                Check out
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

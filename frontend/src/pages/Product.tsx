import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AccordionItem } from '../components/Accordion'
import { ChevronDown, MinusIcon, PlusIcon } from '../components/Icons'
import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { SIZES, formatPrice, getProduct, isSoldOut, productSpec, products, type SizeLabel } from '../data/products'
import NotFound from './NotFound'

export default function Product() {
  const { handle } = useParams()
  const product = getProduct(handle)
  const { addLine } = useCart()

  const firstAvailable = useMemo(() => SIZES.find((s) => product?.stock[s]) ?? SIZES[0], [product])
  const [size, setSize] = useState<SizeLabel>(firstAvailable)
  const [quantity, setQuantity] = useState(1)

  if (!product) return <NotFound />

  const soldOut = isSoldOut(product)
  const sizeAvailable = product.stock[size]
  const related = products.filter((p) => p.handle !== product.handle)

  return (
    <Layout>
      <div className="lg:grid lg:grid-cols-2">
        {/* Buy box */}
        <div className="order-2 px-5 py-8 lg:order-1 lg:sticky lg:top-0 lg:self-start lg:px-8 lg:py-10">
          <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
          <p className="mt-6 text-lg font-semibold">{formatPrice(product.price)}</p>
          <p className="text-sm text-black/60">Taxes included.</p>

          <div className="mt-8 max-w-xs">
            <label htmlFor="size" className="sr-only">
              Size
            </label>
            <div className="relative">
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value as SizeLabel)}
                className="h-14 w-full appearance-none rounded-lg border border-black bg-black px-4 pr-10 text-lg text-white"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                    {product.stock[s] ? '' : ' - Unavailable'}
                  </option>
                ))}
              </select>
              <ChevronDown width={16} height={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white" />
            </div>

            <div className="mt-4 inline-flex items-center rounded-full bg-black text-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-12 w-12 place-items-center"
              >
                <MinusIcon width={16} height={16} />
              </button>
              <span className="w-10 text-center text-lg" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
                className="grid h-12 w-12 place-items-center"
              >
                <PlusIcon width={16} height={16} />
              </button>
            </div>

            <button
              type="button"
              disabled={!sizeAvailable}
              onClick={() => addLine({ handle: product.handle, size, quantity })}
              className="mt-3 block h-12 w-full rounded-full bg-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:opacity-100"
            >
              {sizeAvailable ? 'Add to cart' : 'Sold out'}
            </button>
          </div>

          <div className="relative mt-8 max-w-md overflow-hidden rounded-[2rem] bg-neutral-900 p-8 text-white">
            <img src="/images/about-2.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />
            <div className="relative">
              <h2 className="text-xl font-semibold">{productSpec.name}</h2>
              <ul className="mt-5 space-y-0.5 text-lg">
                {productSpec.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </div>

          <h2 className="mt-8 font-serif text-lg font-bold">Disclosures</h2>
          <div className="mt-3 max-w-md border-t border-black">
            <AccordionItem defaultOpen title="Sizing" titleClassName="font-serif text-base italic font-bold">
              <p>
                Shirt sizings are as per the size chart in the{' '}
                <Link to="/faq#size-chart" className="underline">
                  FAQ section
                </Link>
                .
              </p>
            </AccordionItem>
          </div>
          {soldOut && <p className="mt-6 max-w-md text-sm text-black/60">This drop is sold out. Join the list in the footer to hear about the next one.</p>}
        </div>

        {/* Gallery */}
        <div className="order-1 lg:order-2">
          {product.modelImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${product.title} on model, view ${i + 1}`}
              className="block w-full bg-neutral-900 object-cover"
            />
          ))}
          <div className="bg-white px-6 py-10 lg:py-16">
            {product.flatImages.map((src, i) => (
              <img key={src} src={src} alt={`${product.title} flat lay, ${i === 0 ? 'front' : 'back'}`} loading="lazy" className="mx-auto mb-10 block w-full max-w-xl last:mb-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Quote banner */}
      <section className="fabric-bg relative isolate flex min-h-[340px] items-center justify-center overflow-hidden border-y-[10px] border-black px-6 py-16">
        <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 -z-10 -rotate-[24deg] select-none font-serif text-[22rem] leading-none text-black">
          AI
        </span>
        <span aria-hidden className="pointer-events-none absolute -right-16 bottom-6 -z-10 rotate-[72deg] select-none text-6xl font-light text-black">
          adversity;
        </span>
        <p className="max-w-md text-center text-2xl leading-snug text-white md:text-3xl">
          Every encounter with <strong className="italic">AIBAH</strong> should leave you believing that becoming{' '}
          <strong className="italic">better is always possible.</strong>
        </p>
      </section>

      {related.length > 0 && (
        <section className="px-5 py-10 md:px-8">
          <h2 className="font-serif text-2xl font-bold">You might also like</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            {related.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        </section>
      )}
      <div className="h-6 bg-black" />
    </Layout>
  )
}

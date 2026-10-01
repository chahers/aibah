import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { isSoldOut, productPath, products, type Product } from '../data/products'

// Black edition first, matching the storefront order
const shopProducts = [...products].sort((a) => (a.colorway === 'Black' ? -1 : 1))

function ShopRow({ product }: { product: Product }) {
  const soldOut = isSoldOut(product)
  const [front, back] = product.shopImages
  return (
    <article className="grid grid-cols-2 items-start gap-4 md:gap-10">
      <div>
        <Link to={productPath(product)} className="block">
          <img src={front} alt={`${product.title} front`} loading="lazy" className="mx-auto w-full max-w-md" />
        </Link>
        <h2 className="display-tight mt-6 text-5xl font-extrabold text-neutral-300 sm:text-6xl md:text-7xl">BANGKIT.</h2>
        <Link
          to={productPath(product)}
          className={`mt-5 block max-w-md rounded-full py-4 text-center text-base text-white transition-opacity hover:opacity-90 ${soldOut ? 'bg-dustyblue' : 'bg-black'}`}
        >
          {soldOut ? 'Sold out' : 'View product'}
        </Link>
      </div>
      <Link to={productPath(product)} className="block md:pt-6">
        <img src={back} alt={`${product.title} back`} loading="lazy" className="w-full" />
      </Link>
    </article>
  )
}

export default function Shop() {
  return (
    <Layout>
      <section className="overflow-x-clip px-5 pb-6 pt-14 md:px-14 md:pt-20">
        <h1 className="display-tight whitespace-nowrap text-[10vw] font-extrabold uppercase 2xl:text-[9.5rem]">
          Collection 00
          <br />
          Bangkit.
        </h1>
        <p className="mt-3 font-serif text-2xl">
          The <em>first expression</em> of AIBAH.
        </p>
        <p className="mt-6 max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          A reminder to keep rising, whatever life puts in your way.
        </p>
      </section>

      <section className="space-y-20 px-5 py-14 md:space-y-28 md:px-14">
        {shopProducts.map((p) => (
          <ShopRow key={p.handle} product={p} />
        ))}
      </section>

      <section className="px-5 pb-20 pt-6 text-center">
        <p className="text-2xl font-bold uppercase tracking-tight">More than just a shirt.</p>
        <p className="mt-4 text-2xl font-bold tracking-tight">A reminder of who you're becoming.</p>
        <p className="mt-4 text-2xl font-bold tracking-tight">BANGKIT.</p>
      </section>

      <div className="h-6 bg-black" />
    </Layout>
  )
}

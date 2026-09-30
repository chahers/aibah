import Layout from '../components/Layout'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

// White edition first, matching the storefront order
const homeProducts = [...products].sort((a) => (a.colorway === 'White' ? -1 : 1))

export default function Home() {
  return (
    <Layout overlayHeader>
      <section className="fabric-bg flex min-h-[420px] items-center justify-center px-4 pt-16 md:min-h-[600px] md:pt-20">
        <h1 className="font-serif text-[22vw] leading-none text-white md:text-[11rem]">AIBAH.</h1>
      </section>

      <div className="h-4 bg-black" />

      <section className="relative isolate flex min-h-[420px] items-center overflow-hidden bg-black md:min-h-[520px]">
        <img
          src="/images/banner-model.webp"
          alt="Model wearing the BANGKIT. tee in front of a tiger mural"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="px-5 text-white md:px-14">
          <p className="font-serif text-base italic">Introducing</p>
          <h2 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-6xl">
            COLLECTION 00
            <br />
            BANGKIT.
          </h2>
        </div>
      </section>

      <section className="px-5 py-10 md:px-14 md:py-14" aria-labelledby="choose-to-rise">
        <h2 id="choose-to-rise" className="font-serif text-3xl font-bold">
          Choose to Rise.
        </h2>
        <div className="mt-8 flex flex-wrap gap-4">
          {homeProducts.map((p) => (
            <ProductCard key={p.handle} product={p} />
          ))}
        </div>
      </section>

      <div className="h-8 bg-black" />
    </Layout>
  )
}

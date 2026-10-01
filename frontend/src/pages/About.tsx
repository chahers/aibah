import type { ReactNode } from 'react'
import Layout from '../components/Layout'

function Split({ image, alt, overlay, overlayClass, children }: { image: string; alt: string; overlay: string; overlayClass: string; children: ReactNode }) {
  return (
    <section className="grid items-center gap-8 px-5 py-8 md:grid-cols-2 md:gap-14 md:px-14 md:py-10">
      <div className="relative max-w-xl overflow-hidden bg-neutral-800">
        <img src={image} alt={alt} loading="lazy" className="block w-full" />
        <p aria-hidden className={`absolute font-serif text-4xl leading-tight text-white md:text-5xl ${overlayClass}`}>
          {overlay}
        </p>
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  )
}

export default function About() {
  return (
    <Layout>
      <section className="fabric-bg flex min-h-[300px] items-center justify-center md:min-h-[440px]">
        <h1 className="font-serif text-[22vw] leading-none text-white md:text-[11rem]">AIBAH.</h1>
      </section>
      <div className="h-4 bg-black" />

      <Split
        image="/images/about-1.webp"
        alt="Man in a BANGKIT. tee walking past a tiger mural"
        overlay={'About\nAIBAH.'}
        overlayClass="right-[8%] top-[42%] whitespace-pre-line"
      >
        <h2 className="font-serif text-3xl font-bold uppercase leading-tight">
          You are not defined
          <br />
          by where you start.
        </h2>
        <p className="mt-3 font-serif text-lg font-bold">
          You are defined by what you <em>choose</em> to become.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          <strong>AIBAH</strong> is a personal growth company powered by apparel, media and community.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          We exist to remind people that no matter where they are in life, they can always{' '}
          <strong>Choose to Rise.</strong>
        </p>
      </Split>

      <Split
        image="/images/about-2.webp"
        alt="Woman in a black BANGKIT. tee looking up at the Kuala Lumpur skyline"
        overlay="What We Believe."
        overlayClass="left-[12%] top-[38%]"
      >
        <h2 className="font-serif text-3xl font-bold uppercase">Growth is a choice.</h2>
        <p className="mt-4 text-lg leading-relaxed">
          Discipline over motivation.
          <br />
          Purpose over excuses.
          <br />
          Faith over fear.
        </p>
        <p className="mt-6 text-lg">We believe setbacks don't define you.</p>
        <p className="mt-4 text-lg font-bold">How you respond to them does.</p>
      </Split>

      <div className="h-6" />
    </Layout>
  )
}

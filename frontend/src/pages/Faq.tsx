import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AccordionItem } from '../components/Accordion'
import { EyeIcon, HeartIcon, PersonIcon } from '../components/Icons'
import Layout from '../components/Layout'
import { faqs, sizeChart } from '../data/faq'

const pillars = [
  { icon: <EyeIcon width={34} height={34} />, title: 'Intentional design', text: 'Everything we do starts with why' },
  { icon: <HeartIcon width={34} height={34} />, title: 'Made with care', text: 'We believe in building better' },
  { icon: <PersonIcon width={34} height={34} />, title: 'A team with a goal', text: 'Real people making great products' },
]

const values = [
  {
    title: 'Intentional design',
    text: 'We create with intention. Our products solve real problems with clean design and honest materials.',
  },
  {
    title: 'Quality first',
    text: 'We obsess over the details and strive to deliver the best products at the best prices, every time.',
  },
  {
    title: 'Customer care',
    text: "We're always on your side: keeping our loyal customers happy is our top priority and number one goal.",
  },
]

export default function Faq() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash === '#size-chart') {
      document.getElementById('size-chart')?.scrollIntoView({ block: 'center' })
    }
  }, [hash])

  return (
    <Layout>
      <section className="grid gap-10 px-5 pb-6 pt-12 text-center md:grid-cols-3 md:px-14 md:pt-16">
        {pillars.map((p) => (
          <div key={p.title} className="flex flex-col items-center">
            {p.icon}
            <h2 className="mt-4 font-serif text-3xl font-bold">{p.title}</h2>
            <p className="mt-2 max-w-[14rem] text-lg">{p.text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-10 px-5 py-14 text-center md:grid-cols-3 md:px-14">
        {values.map((v) => (
          <div key={v.title} className="mx-auto max-w-xs">
            <h2 className="font-serif text-3xl italic">{v.title}</h2>
            <p className="mt-4 text-lg leading-relaxed">{v.text}</p>
          </div>
        ))}
      </section>

      <section className="px-5 pb-20 pt-6 md:px-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mb-8 font-serif text-4xl">
          Frequently asked questions
        </h2>
        <div className="border-t border-black">
          {faqs.map((f) => (
            <AccordionItem key={f.question} title={f.question} titleClassName="font-serif text-xl font-bold">
              <p className="max-w-2xl text-lg">{f.answer}</p>
            </AccordionItem>
          ))}
          <div id="size-chart">
            <AccordionItem
              key={hash}
              defaultOpen={hash === '#size-chart'}
              title="What are the shirt sizes?"
              titleClassName="font-serif text-xl font-bold"
            >
              <div className="overflow-x-auto">
                <table className="w-full max-w-2xl text-left text-lg">
                  <thead>
                    <tr className="border-b border-black/30">
                      {sizeChart.columns.map((c) => (
                        <th key={c} className="py-2 pr-6 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-black/10">
                        {row.map((cell, i) => (
                          <td key={i} className="py-2 pr-6">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionItem>
          </div>
        </div>
      </section>
    </Layout>
  )
}

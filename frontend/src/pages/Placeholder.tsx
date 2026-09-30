import type { ReactNode } from 'react'
import Layout from '../components/Layout'

export default function Placeholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Layout>
      <section className="min-h-[50vh] px-5 py-16 md:px-14">
        <h1 className="font-serif text-4xl font-bold">{title}</h1>
        <div className="mt-6 max-w-xl text-lg leading-relaxed">
          {children ?? <p>This page is a placeholder. Add your content here.</p>}
        </div>
      </section>
    </Layout>
  )
}

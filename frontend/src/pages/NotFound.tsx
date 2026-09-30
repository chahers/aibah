import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function NotFound() {
  return (
    <Layout>
      <section className="px-5 py-20 md:px-14">
        <h1 className="font-serif text-5xl font-bold">Page not found.</h1>
        <p className="mt-4 text-lg">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 text-white">
          Back to the shop
        </Link>
      </section>
    </Layout>
  )
}

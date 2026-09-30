import { Route, Routes } from 'react-router-dom'
import About from './pages/About'
import Faq from './pages/Faq'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Placeholder from './pages/Placeholder'
import Product from './pages/Product'
import Shop from './pages/Shop'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:handle" element={<Product />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<Faq />} />
      {/* Footer / menu destinations without a design yet */}
      <Route path="/contact" element={<Placeholder title="Contact Us." />} />
      <Route path="/track-order" element={<Placeholder title="Track Your Order." />} />
      <Route path="/care" element={<Placeholder title="Products Care Instructions" />} />
      <Route path="/terms" element={<Placeholder title="Terms and Policies" />} />
      <Route path="/account" element={<Placeholder title="Account" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

import { Link } from 'react-router-dom'
import { formatPrice, isSoldOut, productPath, type Product } from '../data/products'
import SoldOutBadge from './SoldOutBadge'

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = isSoldOut(product)
  return (
    <Link to={productPath(product)} className="group block w-full max-w-[15.5rem]">
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
        <img
          src={product.cardImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {soldOut && <SoldOutBadge className="absolute left-3 top-3" />}
      </div>
      <h3 className="mt-3 text-base leading-snug group-hover:underline">{product.title}</h3>
      <p className="font-serif italic">{formatPrice(product.price)}</p>
    </Link>
  )
}

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
export type SizeLabel = (typeof SIZES)[number]

export interface Product {
  handle: string
  title: string
  colorway: 'Black' | 'White'
  price: number
  currency: 'MYR'
  /** Availability per size. Flip a value to `true` to put a size back on sale. */
  stock: Record<SizeLabel, boolean>
  /** Image used on cards and in the cart */
  cardImage: string
  /** Lifestyle photos shown at the top of the product gallery */
  modelImages: string[]
  /** Flat-lay mockups (front, back) */
  flatImages: string[]
  /** Flat-lay mockups used on the Shop page (front, back) */
  shopImages: [string, string]
}

const img = (name: string) => `/images/${name}.webp`

export const products: Product[] = [
  {
    handle: 'collection-00-black-edition',
    title: 'Collection 00 - Black Edition.',
    colorway: 'Black',
    price: 99,
    currency: 'MYR',
    stock: { XS: false, S: false, M: false, L: false, XL: false },
    cardImage: img('model-black-front'),
    modelImages: [img('model-black-front'), img('model-black-back')],
    flatImages: [img('flat-black-front'), img('flat-black-back')],
    shopImages: [img('flat-black-front'), img('flat-black-back')],
  },
  {
    handle: 'collection-00-white-edition',
    title: 'Collection 00 - White Edition.',
    colorway: 'White',
    price: 99,
    currency: 'MYR',
    stock: { XS: false, S: false, M: false, L: false, XL: false },
    cardImage: img('model-white'),
    modelImages: [img('model-white')],
    flatImages: [img('flat-white-front'), img('flat-white-back')],
    shopImages: [img('flat-white-front'), img('flat-white-back')],
  },
]

export const productSpec = {
  name: 'Oversized Box Tee',
  lines: ['80% Combed Cotton', '20% Polyester', '270 GSM'],
}

export const isSoldOut = (p: Product) => Object.values(p.stock).every((v) => !v)

export const formatPrice = (amount: number, currency: Product['currency'] = 'MYR') =>
  `RM${amount.toFixed(2)} ${currency}`

export const getProduct = (handle: string | undefined) => products.find((p) => p.handle === handle)

export const productPath = (p: Product) => `/product/${p.handle}`

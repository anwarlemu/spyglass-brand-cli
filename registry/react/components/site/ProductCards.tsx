import { cn } from '@/react/lib/cn'

// The site's product cards (pages/Products/ProductCards): products in a grid ruled apart by #363636 hairlines, one
// column on phones and three or four from 768. Each card is a link on Black, 24px in (flush at the sides on phones): the
// name in Funnel Display (20/24, 24/28 from 768), the line in 16/24 #D4D4D4 8px under it and the endpoint in the code
// face, 14/20 #A3A3A3, at the foot. Under a mouse (and while pressed) the card takes the #262626 fill, a color change
// only.
export interface ProductCardItem {
  name: string
  /** One line on what it does. */
  line: string
  /** "POST /creators". */
  endpoint?: string
  href: string
}

export interface ProductCardsProps {
  products: ProductCardItem[]
  columns?: 3 | 4
  className?: string
}

export function ProductCards({ products, columns = 3, className }: ProductCardsProps) {
  return (
    <ul data-ds="product-cards" role="list" className={cn('m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-px bg-edge p-0 text-fg', columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3', className)}>
      {products.map((p) => (
        <li key={p.href} className="flex bg-surface">
          <a href={p.href} className="flex flex-1 flex-col gap-2 bg-surface py-6 outline-offset-[-4px] transition-[background-color] duration-160 ease-out active:bg-surface-raised pointer-fine:hover:bg-surface-raised md:px-6">
            <span className="type-heading-4 md:type-heading-3">{p.name}</span>
            <span className="type-body text-pretty text-fg-soft">{p.line}</span>
            {p.endpoint && <span className="mt-auto pt-2 type-code wrap-anywhere text-fg-muted">{p.endpoint}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default ProductCards

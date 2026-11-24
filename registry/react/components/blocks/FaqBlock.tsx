import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// Questions and answers, as the pricing page sets them: the heading in the first of three columns, the questions in
// the other two, each under a #363636 hairline, the question in White DM Sans 16/24 and the answer under it in #D4D4D4, no wider
// than 640px (the site's FAQ).
// One column on smaller screens. Answer only with what the product states.
export interface FaqItem {
  q: string
  a: string
}

export interface FaqBlockProps {
  items: FaqItem[]
  title?: ReactNode
  className?: string
}

export function FaqBlock({ items, title = 'Questions.', className }: FaqBlockProps) {
  return (
    <section data-ds="faq-block" className={cn('grid grid-cols-3 gap-12 text-fg max-md:grid-cols-1 max-md:gap-8', className)}>
      <h2 className="type-section">{title}</h2>
      <dl className="col-span-2 m-0 grid max-md:col-span-1">
        {items.map((i) => (
          <div key={i.q} className="grid gap-2 border-t border-edge py-5">
            <dt className="type-body text-fg">{i.q}</dt>
            <dd className="m-0 max-w-measure type-body text-fg-soft">{i.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default FaqBlock

import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// Features as a bento grid, as the site's feature cards sit: #262626 cards with the 4px corner, 24px in, a Funnel
// Display 24/28 title and a #D4D4D4 line, an optional picture above the words. Six columns from 1024 (a card takes two,
// a `wide` one four, a `tall` one two rows), two from 768, one on phones. Nothing moves.
export interface BentoItem {
  title: string
  body?: string
  /** A picture above the words (src). */
  image?: string
  /** wide (four columns), tall (two rows) or normal. */
  span?: 'normal' | 'wide' | 'tall'
}

export interface BentoBlockProps {
  items: BentoItem[]
  title?: ReactNode
  /** A line under the title. */
  body?: ReactNode
  className?: string
}

const SPAN = { normal: 'lg:col-span-2', wide: 'md:col-span-2 lg:col-span-4', tall: 'lg:col-span-2 lg:row-span-2' }

export function BentoBlock({ items, title, body, className }: BentoBlockProps) {
  return (
    <section data-ds="bento-block" className={cn('grid gap-10 text-fg', className)}>
      {(title || body) && (
        <div className="grid max-w-3xl gap-6">
          {title && <h2 className="type-section">{title}</h2>}
          {body && <p className="max-w-measure type-body-lg text-fg-soft">{body}</p>}
        </div>
      )}
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:auto-rows-[minmax(200px,auto)] lg:grid-cols-6">
        {items.map((i) => (
          <li key={i.title} className={cn('flex flex-col gap-4 overflow-hidden rounded-container bg-surface-raised p-6', SPAN[i.span ?? 'normal'])}>
            {i.image && <img src={i.image} alt="" className="aspect-[16/9] w-full rounded-ds-sm object-cover" />}
            <div className="mt-auto grid gap-2">
              <h3 className="type-heading-3">{i.title}</h3>
              {i.body && <p className="type-body text-fg-soft">{i.body}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BentoBlock

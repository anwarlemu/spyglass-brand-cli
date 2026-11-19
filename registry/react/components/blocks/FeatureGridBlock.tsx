import type { ReactNode } from 'react'
import { Card } from '@/react/components/ui/Card'
import { cn } from '@/react/lib/cn'

// What the product does, as cards: an optional Funnel Display heading and line over a grid of cards on the #171717
// fill, each a title and a sentence (the home page's three cards, as a block). Three across (or two), one on phones.
// No icons and no color: the words carry it.
export interface Feature {
  title: string
  body: string
}

export interface FeatureGridBlockProps {
  features: Feature[]
  /** A heading above the cards. */
  title?: ReactNode
  /** A line under the heading. */
  body?: ReactNode
  /** Cards across on wide screens: 2 or 3. */
  columns?: 2 | 3
  className?: string
}

export function FeatureGridBlock({ features, title, body, columns = 3, className }: FeatureGridBlockProps) {
  return (
    <section data-ds="feature-grid-block" className={cn('grid gap-10 text-fg max-sm:gap-8', className)}>
      {(title || body) && (
        <div className="grid max-w-3xl gap-4">
          {title && <h2 className="type-heading-1 text-balance max-sm:type-heading-2">{title}</h2>}
          {body && <p className="type-body-lg text-fg-soft">{body}</p>}
        </div>
      )}
      <div className={cn('grid gap-4 max-md:grid-cols-1', columns === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
        {features.map((f) => <Card key={f.title} title={f.title} description={f.body} />)}
      </div>
    </section>
  )
}

export default FeatureGridBlock

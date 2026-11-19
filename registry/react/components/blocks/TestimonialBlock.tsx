import type { ReactNode } from 'react'
import { Testimonial } from '@/react/components/site/Testimonial'
import { cn } from '@/react/lib/cn'

// One customer, as a section: an optional label in capitals, then the testimonial with the headshot beside the words
// (`side`, as a page sets it) or above them (`stacked`, as the ad does). `card` sets it on the #171717 fill. The quote
// is a customer's own words: never write one for them.
export interface TestimonialBlockProps {
  /** The words, without quote marks. */
  quote: string
  name: string
  /** Role and company, shown in capitals. */
  position?: string
  /** The headshot (src), the placeholder (undefined) or none (false). */
  image?: string | false
  /** A line in capitals above it. */
  label?: ReactNode
  /** side or stacked. */
  layout?: 'side' | 'stacked'
  /** On the card fill. */
  card?: boolean
  className?: string
}

export function TestimonialBlock({ quote, name, position, image, label, layout = 'side', card = false, className }: TestimonialBlockProps) {
  return (
    <section data-ds="testimonial-block" className={cn('grid gap-8 text-fg', card && 'rounded-container bg-surface-raised p-12 max-sm:p-6', className)}>
      {label && <p className="type-label text-fg-muted">{label}</p>}
      <Testimonial quote={quote} name={name} position={position} image={image} layout={layout} />
    </section>
  )
}

export default TestimonialBlock

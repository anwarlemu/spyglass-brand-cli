'use client'
import { Carousel } from '@/react/components/ui/Carousel'
// One quote at a time from Acme's team, on the #171717 card.
const quotes = [
  'We found the hook our competitors ran for 90 days in one search.',
  'Every brief starts with a board now. The team agrees faster.',
  'Ten minutes in Spyglass replaced a week of screenshots.',
]

export default function Quotes() {
  return (
    <div className="w-full max-w-150">
      <Carousel
        label="Quotes"
        count={quotes.length}
        slide={({ index }) => (
          <figure className="flex h-full flex-col justify-between gap-8 rounded-container bg-surface-raised p-8 max-sm:p-6">
            <blockquote className="type-heading-3">{quotes[index]}</blockquote>
            <figcaption className="type-caption text-fg-muted">Acme growth team</figcaption>
          </figure>
        )}
      />
    </div>
  )
}

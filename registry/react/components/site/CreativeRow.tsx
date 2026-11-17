import { BrandLight } from '@/react/components/visuals/BrandLight'
import { CreativeCard, type CreativeItem } from '@/react/components/site/CreativeCard'
import { peakWeights } from '@/lib/creative-layouts'
import { cn } from '@/react/lib/cn'

// A row of creatives, all 4/5. `even`: the banners' row, every creative the same size, 16px apart (X banner, Creative
// row). `peak`: the deck cover's row, rising to the middle (200, 240, 304, 240, 200 on the canvas) and centered on one
// line (Pitch deck cover, Row of creatives). The row keeps to its box: the creatives shrink with it, never scroll.
export interface CreativeRowProps {
  items: CreativeItem[]
  /** even (one size) or peak (rising to the middle). */
  variant?: 'even' | 'peak'
  className?: string
}

export function CreativeRow({ items, variant = 'even', className }: CreativeRowProps) {
  const weights = variant === 'peak' ? peakWeights(items.length) : items.map(() => 1)
  return (
    <div data-ds="creative-row" className={cn('flex items-center gap-4 max-sm:gap-2', className)}>
      {items.map(({ light, seed, ...item }, i) => (
        <div key={i} className="min-w-0 basis-0" style={{ flexGrow: weights[i], aspectRatio: '4 / 5' }}>
          {light ? <BrandLight variant="tile" seed={seed ?? i} cover className="size-full rounded-container" /> : <CreativeCard {...item} ratio="fill" />}
        </div>
      ))}
    </div>
  )
}

export default CreativeRow

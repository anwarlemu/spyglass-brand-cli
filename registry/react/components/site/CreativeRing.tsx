import type { ReactNode } from 'react'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { CreativeCard, type CreativeItem } from '@/react/components/site/CreativeCard'
import { RING_FRAME, RING_SLOTS, placeAt } from '@/lib/creative-layouts'
import { cn } from '@/react/lib/cn'

// The creative ring (Post, Creative ring): twelve tiles around the middle of a square, clockwise from the top, in the
// post's exact places and sizes; eight are creatives (squares, 7/5 and tall) and four are tiles of the brand light.
// The children sit in the middle: the lockup, as the post has it. The ring scales with its width.
export interface CreativeRingProps {
  /** Up to eight creatives, clockwise from the top (fewer repeat). */
  items: CreativeItem[]
  /** The first light tile's seed; the others follow it. */
  seed?: number
  /** What sits in the middle (the lockup). */
  children?: ReactNode
  className?: string
}

export function CreativeRing({ items, seed = 0, children, className }: CreativeRingProps) {
  let n = 0
  let lights = 0
  return (
    <div data-ds="creative-ring" className={cn('relative aspect-square', className)}>
      {RING_SLOTS.map((slot, i) => {
        const at = placeAt(slot, RING_FRAME, RING_FRAME)
        if (slot.light) return (
          <div key={i} className="absolute" style={at}>
            <BrandLight variant="tile" seed={seed + lights++} cover className="size-full rounded-container" />
          </div>
        )
        const { light: _light, seed: _seed, ...item } = items.length ? items[n++ % items.length] : ({} as CreativeItem)
        return (
          <div key={i} className="absolute" style={at}>
            <CreativeCard {...item} ratio="fill" />
          </div>
        )
      })}
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}

export default CreativeRing

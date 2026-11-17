import { BrandLight } from '@/react/components/visuals/BrandLight'
import { CreativeCard, type CreativeItem, type CreativeRatio } from '@/react/components/site/CreativeCard'
import { cn } from '@/react/lib/cn'

// Creatives in a grid, as the assets set them: the post's three by three of squares 8px apart with a light tile among
// them (Post, Any brand or creator), or the ad's three up in 3/4 (Ad, The only creative search engine). Every cell
// takes the same shape; an item with `light` is a tile of the brand light.
export interface CreativeGridProps {
  items: CreativeItem[]
  /** 2, 3 or 4 columns (4 falls to 2 on phones). */
  columns?: 2 | 3 | 4
  /** Every cell's shape. */
  ratio?: Exclude<CreativeRatio, 'fill'>
  /** sm: the post's 8px. md: the ad's wider gutter. */
  gap?: 'sm' | 'md'
  className?: string
}

const COLUMNS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4 max-sm:grid-cols-2' }
const GAPS = { sm: 'gap-2', md: 'gap-6 max-sm:gap-3' }

export function CreativeGrid({ items, columns = 3, ratio = '1/1', gap = 'sm', className }: CreativeGridProps) {
  return (
    <div data-ds="creative-grid" className={cn('grid', COLUMNS[columns] ?? COLUMNS[3], GAPS[gap] ?? GAPS.sm, className)}>
      {items.map(({ light, seed, ...item }, i) => (
        <div key={i} className="min-w-0" style={{ aspectRatio: ratio.replace('/', ' / ') }}>
          {light ? <BrandLight variant="tile" seed={seed ?? i} cover className="size-full rounded-container" /> : <CreativeCard {...item} ratio="fill" />}
        </div>
      ))}
    </div>
  )
}

export default CreativeGrid

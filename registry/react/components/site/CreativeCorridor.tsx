import { BrandLight } from '@/react/components/visuals/BrandLight'
import { CreativeCard, type CreativeItem } from '@/react/components/site/CreativeCard'
import { CORRIDOR_FRAME, CORRIDOR_LIGHT, corridorWalls, placeAt } from '@/lib/creative-layouts'
import { cn } from '@/react/lib/cn'

// The corridor (Ad, The world's largest creative search engine): creatives as walls on both sides, receding in
// perspective to a small light at the vanishing point. Twelve walls, nearest first and left then right, in the ad's
// exact places; each is clipped so its far edge is shorter. The corridor scales with its width (1080 by 744).
export interface CreativeCorridorProps {
  /** Up to twelve creatives, nearest first, alternating left and right (fewer repeat). */
  items: CreativeItem[]
  /** The light's seed. */
  seed?: number
  className?: string
}

export function CreativeCorridor({ items, seed = 0, className }: CreativeCorridorProps) {
  const { width, height } = CORRIDOR_FRAME
  return (
    <div data-ds="creative-corridor" className={cn('relative w-full overflow-hidden', className)} style={{ aspectRatio: `${width} / ${height}` }}>
      <div className="absolute" style={placeAt(CORRIDOR_LIGHT, width, height)}>
        <BrandLight variant="close-up" seed={seed} cover className="size-full" />
      </div>
      {corridorWalls().map((wall, i) => {
        const { light: _light, seed: _seed, ...item } = items.length ? items[i % items.length] : ({} as CreativeItem)
        return (
          <div key={i} className="absolute" style={{ ...placeAt(wall, width, height), clipPath: wall.clip }}>
            <CreativeCard {...item} ratio="fill" />
          </div>
        )
      })}
    </div>
  )
}

export default CreativeCorridor

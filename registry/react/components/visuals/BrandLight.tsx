import { useId, type CSSProperties } from 'react'
import { LIGHT_LAYERS, lightGeometry, type LightSource, type LightVariant } from '@/lib/light'
import { cn } from '@/react/lib/cn'

// The brand light, drawn from the seeded generator (lib/light.ts): the shape three times in Blue, Green and Red, each
// shifted sideways, blurred and blended plus-lighter on Black. It keeps the frame's proportions, or with `cover` fills
// the box its classes give it (`absolute inset-0` behind a section, `aspect-square w-full`), cropping the light. Put it at an edge or a
// corner, behind the content, never boxed in. It is decoration: hidden from assistive tech, and it does not move.
export interface BrandLightProps {
  /** band, field, corner, strip-left, strip-right, tile, close-up or curved-strip. */
  variant?: LightVariant
  /** The same seed draws the same light; seeds below the brand's own windows reproduce them exactly. */
  seed?: number
  /** 'brand' cuts windows from the brand's own heat map; 'generated' builds a new one from the seed. */
  source?: LightSource
  /** The frame the light is drawn for, in px (its proportions and its scale). */
  width?: number
  height?: number
  /** Paint the Black ground under it (on by default). */
  ground?: boolean
  /** Fill the box the classes give it (cropping the light) instead of keeping the frame's proportions. */
  cover?: boolean
  className?: string
}

/** Each variant's frame in the brand assets (px on the 1080 canvas). */
export const LIGHT_FRAMES: Record<LightVariant, [number, number]> = {
  band: [1080, 240],
  field: [1080, 612],
  corner: [1080, 1080],
  'strip-left': [160, 1080],
  'strip-right': [160, 1080],
  tile: [200, 200],
  'close-up': [280, 208],
  'curved-strip': [1920, 619],
}

export function BrandLight({ variant = 'band', seed = 0, source = 'brand', width, height, ground = true, cover = false, className }: BrandLightProps) {
  const id = `sg-light${useId().replace(/[^\w-]/g, '')}`
  const [w, h] = [width ?? LIGHT_FRAMES[variant][0], height ?? LIGHT_FRAMES[variant][1]]
  const g = lightGeometry({ width: w, height: h, variant, seed, source })
  const style: CSSProperties | undefined = cover ? undefined : { aspectRatio: `${w} / ${h}` }
  return (
    <div data-ds="brand-light" aria-hidden="true" style={style} className={cn('pointer-events-none overflow-hidden', ground && 'bg-surface', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className="block size-full isolate">
        <defs>
          <path id={`${id}-shape`} fillRule="evenodd" d={g.d} />
          <filter id={`${id}-blur`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={Math.round(g.blur * 100) / 100} />
          </filter>
        </defs>
        {LIGHT_LAYERS.map((l) => (
          <use key={l.name} href={`#${id}-shape`} x={Math.round(g.offset * l.shift * 100) / 100} fill={l.color} opacity={l.opacity} filter={`url(#${id}-blur)`} style={{ mixBlendMode: 'plus-lighter' }} />
        ))}
      </svg>
    </div>
  )
}

export default BrandLight

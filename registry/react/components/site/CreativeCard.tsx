import type { CSSProperties } from 'react'
import { cn } from '@/react/lib/cn'
import { imageFit, type ImageFit } from '@/lib/image'

// A creative as the brand assets show it: an ad, a product shot or a UGC frame in a rounded rectangle with the brand
// corner, the image's color exactly as posted (no grading, filter, overlay or neon). `src` is the image; without one it
// draws a neutral placeholder (a soft gradient from the neutral steps, with the advertiser and a headline when there is
// room), so layouts never need a third-party photo. `ratio` keeps the shapes the assets use (4/5 ads, 1/1 tiles, 3/4
// the ad's three up, 7/5 the ring's landscape tiles, 3/5 the tall ones) or `fill` takes the box its classes give it.
// `href` makes it a link. `fit` and `position` place the image in its box (object-fit, cover by default, and
// object-position). The placeholder carries data-ds-placeholder. It does not move on hover.
export type CreativeRatio = '4/5' | '1/1' | '3/4' | '7/5' | '3/5' | '9/16' | '16/9' | 'fill'
export type CreativeTone = 1 | 2 | 3 | 4

export interface CreativeCardProps {
  /** The image, used exactly as posted. */
  src?: string
  /** What the creative shows (the image's alt text, or the placeholder's name). */
  alt?: string
  /** How the image fills the card (object-fit); cover by default. */
  fit?: ImageFit
  /** Where the image is anchored (object-position), for example "50% 20%". */
  position?: string
  /** The shape: 4/5, 1/1, 3/4, 7/5, 3/5, 9/16, 16/9 (the deck's frame) or fill. */
  ratio?: CreativeRatio
  /** The placeholder's advertiser, in capitals at the foot (shown from 112px wide). */
  brand?: string
  /** The placeholder's headline (shown from 192px wide). */
  caption?: string
  /** The placeholder's neutral gradient, 1 (darkest) to 4. */
  tone?: CreativeTone
  /** Makes the creative a link. */
  href?: string
  className?: string
  style?: CSSProperties
}

// Placeholder grounds: two neutral steps apart, lighter at the top, as a photo lit from above reads on Black.
const TONES: Record<CreativeTone, string> = {
  1: 'bg-linear-to-b from-ds-neutral-4 to-ds-neutral-2',
  2: 'bg-linear-to-b from-ds-neutral-5 to-ds-neutral-3',
  3: 'bg-linear-to-b from-ds-neutral-6 to-ds-neutral-4',
  4: 'bg-linear-to-b from-ds-neutral-7 to-ds-neutral-5',
}

export function CreativeCard({ src, alt = '', fit, position, ratio = '4/5', brand, caption, tone = 2, href, className, style }: CreativeCardProps) {
  const box: CSSProperties = ratio === 'fill' ? { ...style } : { aspectRatio: ratio.replace('/', ' / '), ...style }
  const classes = cn('@container relative block overflow-hidden rounded-container', src ? 'bg-surface-subtle' : TONES[tone] ?? TONES[2], ratio === 'fill' && 'size-full', className)
  const body = src ? (
    <img src={src} alt={alt} loading="lazy" decoding="async" className="block size-full object-cover" style={imageFit({ fit, position })} />
  ) : (
    <>
      {caption && <span aria-hidden="true" className="absolute inset-x-4 top-4 hidden type-heading-4 text-fg @min-[12rem]:block">{caption}</span>}
      {brand && <span aria-hidden="true" className="absolute bottom-3 left-3 hidden type-label text-fg @min-[7rem]:block">{brand}</span>}
    </>
  )
  const label = src ? undefined : alt || [brand, caption].filter(Boolean).join(', ') || undefined
  const blank = src ? undefined : ''
  if (href) return <a data-ds="creative-card" data-ds-placeholder={blank} href={href} aria-label={label} style={box} className={classes}>{body}</a>
  return <div data-ds="creative-card" data-ds-placeholder={blank} role={label ? 'img' : undefined} aria-label={label} style={box} className={classes}>{body}</div>
}

export default CreativeCard

/** One creative in an arrangement (grid, row, ring, corridor): a creative's props, or `light` for a light tile. */
export interface CreativeItem extends Omit<CreativeCardProps, 'ratio' | 'className' | 'style'> {
  /** A tile of the brand light instead of a creative (the grid and the ring interleave them). */
  light?: boolean
  /** The light tile's seed. */
  seed?: number
}

import type { ReactNode } from 'react'
import { AsciiTexture } from '@/react/components/visuals/AsciiTexture'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { cn } from '@/react/lib/cn'

// The top of a page as the site sets it: a Funnel Display headline at 450 (the site's .t-head, 32/36 on phones, 44/48
// at 768, 56/60 from 1024; `size="display"` is the .t-display line, 48 to 112), a #D4D4D4 20/28 lead no wider than
// 640px and the actions, on Black with the light and, if asked, the ASCII texture behind. The children are
// the media under the copy (a search bar, a creative row, a ring). The placements in the assets:
//   left   the ad and the first deck cover: copy at the top left, the media under it
//   center the offer post and the Creator plan ad: everything centered, the light field above
//   right  the third deck cover: the headline at the top right, the creatives on a curved strip below
// `light` picks where the light flows: `field` from the top edge (fading out before the copy, never a hard edge),
// `corner` in from the corners (on phones, the field above the copy), `band` and `strip` behind the media (a band of the light across it, the curved strip
// running under it). The texture keeps clear of the copy. Nothing moves.
export type HeroPlacement = 'left' | 'center' | 'right'
export type HeroLight = 'field' | 'corner' | 'band' | 'strip' | 'none'
export type HeroSize = 'section' | 'display'

export interface HeroBlockProps {
  headline: ReactNode
  /** A line or two of DM Sans under the headline. */
  body?: ReactNode
  /** A label in capitals above the headline. */
  eyebrow?: ReactNode
  /** Buttons (one White primary). */
  actions?: ReactNode
  /** left, center or right. */
  placement?: HeroPlacement
  /** Where the light flows: field, corner, band, strip or none. */
  light?: HeroLight
  /** The light's (and the texture's) seed. */
  seed?: number
  /** The ASCII texture behind everything. */
  texture?: boolean
  /** section (the site's page head, by default) or display (the larger display line). */
  size?: HeroSize
  /** The media under the copy. */
  children?: ReactNode
  className?: string
}

const ALIGN: Record<HeroPlacement, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
}

// Where the texture keeps clear of the copy, in its 1440x900 frame: the copy's side of the block.
const CLEAR: Record<HeroPlacement, { x: number; y: number; w: number; h: number }[]> = {
  left: [{ x: 0, y: 0, w: 920, h: 720 }],
  center: [{ x: 200, y: 80, w: 1040, h: 680 }],
  right: [{ x: 520, y: 0, w: 920, h: 720 }],
}

export function HeroBlock({ headline, body, eyebrow, actions, placement = 'left', light = 'field', seed = 0, texture = false, size = 'section', children, className }: HeroBlockProps) {
  const media = light === 'band' || light === 'strip'
  return (
    <section data-ds="hero-block" className={cn('relative isolate overflow-hidden bg-surface text-fg', className)}>
      {texture && <AsciiTexture seed={seed} width={1440} height={900} density={0.4} clear={CLEAR[placement] ?? CLEAR.left} cover className="absolute inset-0 -z-10 size-full" />}
      {light === 'field' && <BrandLight variant="field" seed={seed} ground={false} cover className="absolute inset-x-0 top-0 -z-10 h-80 mask-b-from-40% max-sm:h-48" />}
      {light === 'corner' && <BrandLight variant="corner" seed={seed} ground={false} cover className="absolute inset-0 -z-10 size-full max-sm:hidden" />}
      {light === 'corner' && <BrandLight variant="field" seed={seed} ground={false} cover className="absolute inset-x-0 top-0 -z-10 h-48 mask-b-from-40% sm:hidden" />}
      <div className={cn('mx-auto flex w-full max-w-page-wide flex-col gap-6 px-12 max-sm:px-4', ALIGN[placement] ?? ALIGN.left, light === 'field' ? 'pt-72 max-sm:pt-44' : light === 'corner' ? 'pt-24 max-sm:pt-44' : 'pt-24 max-sm:pt-16', children ? 'pb-12 max-sm:pb-10' : 'pb-24 max-sm:pb-16')}>
        {eyebrow && <p className="type-label text-fg-muted">{eyebrow}</p>}
        <h1 className={cn('max-w-4xl text-balance', size === 'display' ? 'type-display-fluid' : 'type-section')}>{headline}</h1>
        {body && <p className="max-w-measure type-body-lg text-fg-soft">{body}</p>}
        {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children && (
        <div className={cn('relative', media ? 'py-14 max-sm:py-10' : 'pb-24 max-sm:pb-16')}>
          {light === 'band' && <BrandLight variant="band" seed={seed} ground={false} cover className="absolute inset-0 -z-10 size-full" />}
          {light === 'strip' && <BrandLight variant="curved-strip" seed={seed} ground={false} cover className="absolute inset-0 -z-10 size-full" />}
          <div className="mx-auto w-full max-w-page-wide px-12 max-sm:px-4">{children}</div>
        </div>
      )}
    </section>
  )
}

export default HeroBlock

import type { ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { ASCII_TEXTURE } from '@/lib/textures'
import { cn } from '@/react/lib/cn'

// The site's product feature rows (pages/Products/ProductFeatures): one row per thing the product does, the copy (a
// Funnel Display 450 title, 24/28 on phones, 32/36 at 768 and 40/44 at 1280, a 20/28 lead 16px under it and a quiet
// button 32px under that) beside a 4:3 stage on the #262626 fill with the 8px corner, where the ASCII texture shows at
// half strength around a clear middle (screen blended, its tile placed differently in each row) and the feature's
// picture sits on top. From 1024 the copy takes 5 parts and the stage 7, 64px apart (96 at 1280), every other row
// flipped; below, the copy sits over the stage. Rows 80px apart (120 from 768). Nothing moves here; the pictures bring
// their own motion.
export interface ProductFeature {
  headline: string
  text: string
  /** A quiet button under the text. */
  link?: { label: string; href: string }
  /** What sits on the stage (a product visual). */
  visual?: ReactNode
}

export interface ProductFeaturesProps {
  features: ProductFeature[]
  /** Prefix for the heading ids. */
  id?: string
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
export const FEATURE_ASCII_AT = ['0 0', '40% 24%', '64% 56%', '20% 80%']

export function ProductFeatures({ features, id = 'product', className }: ProductFeaturesProps) {
  return (
    <div data-ds="product-features" className={cn('py-(--ds-layout-section) text-fg', className)}>
      <style href="ds-product-features" precedence="ds">{css}</style>
      <div className={cn(WRAP, 'grid gap-y-20 md:gap-y-30')}>
        {features.map((f, i) => (
          <section key={f.headline} aria-labelledby={`${id}-feature-${i + 1}`} className={cn('grid grid-cols-[minmax(0,1fr)] items-center gap-y-8 lg:gap-x-16 xl:gap-x-24', i % 2 ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]')}>
            <div className={cn('flex flex-col items-start', i % 2 ? 'lg:order-2' : '')}>
              <h2 id={`${id}-feature-${i + 1}`} className="ds-pf-title">{f.headline}</h2>
              <p className="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{f.text}</p>
              {f.link && <Button href={f.link.href} variant="secondary" className="mt-8">{f.link.label}</Button>}
            </div>
            <div className="ds-pf-stage relative isolate aspect-4/3 min-w-0 overflow-clip rounded-panel bg-surface-raised">
              <span aria-hidden="true" className="ds-pf-ascii" style={{ backgroundImage: `url("${ASCII_TEXTURE}")`, backgroundPosition: FEATURE_ASCII_AT[i % FEATURE_ASCII_AT.length] }} />
              {f.visual}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ProductFeatures

const css = `
.ds-pf-title { font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-heading); font-size: var(--ds-text-heading-3); line-height: var(--ds-text-heading-3-leading); letter-spacing: 0; text-wrap: balance; }
@media (min-width: 768px) { .ds-pf-title { font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); } }
@media (min-width: 1280px) { .ds-pf-title { font-size: var(--ds-text-figure); line-height: var(--ds-text-figure-leading); } }
.ds-pf-stage { container: stage / inline-size; }
.ds-pf-ascii { position: absolute; inset: 0; z-index: -1; pointer-events: none; background-size: var(--ds-feature-ascii-tile) var(--ds-feature-ascii-tile); opacity: var(--ds-feature-ascii-opacity); mix-blend-mode: screen; mask-image: radial-gradient(ellipse var(--ds-feature-ascii-clear-w) var(--ds-feature-ascii-clear-h) at 50% 50%, transparent 40%, var(--ds-color-black) 100%); }
`

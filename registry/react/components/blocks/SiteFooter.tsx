'use client'
import type { ReactNode } from 'react'
import { Badge } from '@/react/components/ui/Badge'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { Logo } from '@/react/components/visuals/Logo'
import { cn } from '@/react/lib/cn'
import { LOGOS } from '@/lib/logos'
import { homeLinkClick } from '@/lib/home-link'

// The site's footer (site/Footer): the wordmark across the page width in the footer gray (#373737), the brand light
// running through its lower half, and a #262626 card with a #363636 hairline and the 8px corner rising over the
// wordmark's descender. In the card: the link columns (a Funnel Display 20/24 title over #D4D4D4 16/24 links, six
// across from 1280, three from 768, two on phones, the wide ones two by two), then under a hairline the lockup and the
// legal line in #A3A3A3 14/20. A link without `href` is not live yet: it shows in #858585 with a "Coming soon" badge.
// Links turn White under the pointer; nothing moves. The light is decoration and stays still.
export interface SiteFooterLink {
  label: string
  /** Leave it out for a page that is not live yet. */
  href?: string
}

export interface SiteFooterColumn {
  title: string
  links: SiteFooterLink[]
  /** On phones, a column across the card with its links two by two. */
  wide?: boolean
}

export interface SiteFooterProps {
  columns: SiteFooterColumn[]
  /** The line beside the lockup: "© 2026 Acme Inc." */
  legal?: ReactNode
  /** Where the lockup links. */
  homeHref?: string
  /** The badge on a link that is not live yet. */
  soon?: string
  /** The big wordmark and its light above the card (on by default). */
  wordmark?: boolean
  /** The light's seed. */
  seed?: number
  /** The lockup's accessible name. */
  label?: string
  className?: string
}

const LINK = 'flex min-h-10 items-center rounded-ds-sm type-body text-fg-soft transition-[color] duration-160 ease-out hover:text-fg md:block md:min-h-0 md:py-1'

/** The wordmark as a mask image, so the light shows only inside the letters. */
function wordmarkMask() {
  const w = LOGOS.wordmark
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.width} ${w.height}" fill="#000">${w.body}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export function SiteFooter({ columns, legal, homeHref = '/', soon = 'Coming soon', wordmark = true, seed = 0, label = 'Spyglass', className }: SiteFooterProps) {
  const w = LOGOS.wordmark
  const mask = wordmarkMask()
  return (
    <footer data-ds="site-footer" className={cn('relative isolate bg-surface pt-(--ds-layout-section) text-fg', className)}>
      <div className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)">
        {wordmark && (
          <div aria-hidden="true" className="relative w-full" style={{ aspectRatio: `${w.width} / ${w.height}` }}>
            <svg viewBox={`0 0 ${w.width} ${w.height}`} className="absolute inset-0 block size-full fill-wordmark-gray" dangerouslySetInnerHTML={{ __html: w.body }} />
            <div className="absolute inset-0" style={{ maskImage: mask, WebkitMaskImage: mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }}>
              <BrandLight variant="curved-strip" seed={seed} ground={false} cover className="absolute inset-x-0 top-1/4 h-3/4 mix-blend-screen" />
            </div>
          </div>
        )}
        <div className={cn('relative z-1 pb-8', wordmark && '-mt-[2.54%]')}>
          <div className="rounded-panel border border-edge bg-surface-raised px-12 pt-12 max-md:px-6 max-md:pt-8">
            <nav aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 md:gap-y-12 xl:grid-cols-6">
                {columns.map((c) => (
                  <div key={c.title} className={cn(c.wide && 'max-md:col-span-full')}>
                    <h2 className="mb-4 type-heading-4 text-fg">{c.title}</h2>
                    <ul role="list" className={cn(c.wide && 'max-md:grid max-md:grid-cols-2 max-md:gap-x-6')}>
                      {c.links.map((l) => (
                        <li key={l.label}>
                          {l.href ? (
                            <a href={l.href} className={LINK}>{l.label}</a>
                          ) : (
                            <span aria-disabled="true" className="flex min-h-10 flex-wrap items-center gap-x-2 type-body text-fg-faint md:min-h-0 md:py-1">{l.label}<Badge variant="secondary">{soon}</Badge></span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
            <div className="mt-16 flex items-center justify-between gap-6 border-t border-edge pt-5 pb-6 max-md:mt-12 max-sm:flex-col max-sm:items-start">
              <a href={homeHref} aria-label={label} onClick={(e) => homeLinkClick(e.nativeEvent)} className="rounded-ds-sm"><Logo height={20} label={label} /></a>
              {legal && <p className="type-ui text-fg-muted">{legal}</p>}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter

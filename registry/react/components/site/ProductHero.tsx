'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Logo } from '@/react/components/visuals/Logo'
import { PRODUCT_HERO_CSS, startResultsRun, type HeroResult, type HeroSet } from '@/lib/product-hero'
import { ASCII_TEXTURE } from '@/lib/textures'
import { WORKS_STILLS } from '@/lib/works-light'
import { cn } from '@/react/lib/cn'

// The site's product hero (pages/Products/ProductHero and ResultsRun): the product's name in the page head type and its
// line centered, a White and a quiet button (stacked full width on phones), then the composer (a #262626 card with the
// 20px corner in a #4D4D4D hairline: the question, a caret, the attach square, the MCP chip with the logomark and the
// send square, White while there is text) over a row of result cards turned away in perspective (192px, 144 on phones;
// up to five from 768 to 1279). The run types each question at a human pace and flicks its row in, lets it drift while
// it is read and flicks it out as the question is erased (lib/product-hero.ts). A card under a mouse, or focused, turns
// to face you and comes forward, and its detail rises in over a dark scrim, one fact after another; the run eases to a
// stop meanwhile. Lit (the default): the site's works light behind it, fading out at the foot (its pre-drawn still, or
// your own `light`, such as the dispersion field); unlit: the ASCII texture in the margins from 1024. Reduced motion:
// the first question and row stay still and the cards do not turn.
export type { HeroResult, HeroSet } from '@/lib/product-hero'

export interface ProductHeroAction { label: string; href: string }

export interface ProductHeroProps {
  /** The product's name: the page's h1. */
  name: string
  /** One line on what it does. */
  line: string
  primary?: ProductHeroAction
  secondary?: ProductHeroAction
  /** One question and its results per set, run in order. */
  sets: HeroSet[]
  /** The works light behind the hero (true) or the texture in its margins (false). */
  lit?: boolean
  /** Your own light in place of the still (the dispersion field). */
  light?: ReactNode
  /** The composer's hint while it is empty. */
  placeholder?: string
  /** The chip's label. */
  tool?: string
  /** Prefix for ids. */
  id?: string
  className?: string
}

function Card({ result, id }: { result: HeroResult; id: string }) {
  const { picture, pair, stat, notes, mark, label, meta, detail } = result
  const detailId = `${id}-${result.id}-detail`
  return (
    <li data-card="" tabIndex={0} aria-describedby={detailId} className="ds-ph-card relative flex-none outline-none">
      <div className="ds-ph-turn">
        <div data-face="" className={cn('ds-ph-face relative flex aspect-4/5 overflow-hidden rounded-ds-sm bg-surface-raised', pair ? 'gap-px' : '')}>
          {picture && <span className="relative flex-[1_1_0]"><img src={picture.src} alt={picture.alt} className="absolute inset-0 size-full object-cover" /></span>}
          {pair && <span className="relative flex-[1_1_0]"><img src={pair.src} alt={pair.alt} className="absolute inset-0 size-full object-cover" /></span>}
          {!picture && stat && (
            <span className="flex flex-[1_1_0] flex-col justify-end gap-2 p-4">
              <span className="ds-ph-stat-value text-fg">{stat.value}</span>
              <span className="type-ui text-fg-soft">{stat.caption}</span>
            </span>
          )}
          {notes?.length ? (
            <span className="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
              {notes.map((n) => <span key={n} className="max-w-full rounded-panel bg-surface-subtle px-2 py-1 type-ui text-fg">{n}</span>)}
            </span>
          ) : null}
          <div id={detailId} data-detail="" className="ds-ph-detail pointer-events-none absolute inset-0 z-1 flex flex-col justify-end gap-3 overflow-hidden p-4">
            <p className="ds-ph-reveal flex-none truncate type-ui-strong text-fg" style={{ '--i': 0 } as CSSProperties}>{detail.title}</p>
            <dl className="m-0 flex flex-none flex-col gap-3">
              {detail.facts.map((f, i) => (
                <div key={f.term} data-fact="" className="ds-ph-reveal ds-ph-fact flex flex-none flex-col gap-1" style={{ '--i': i + 1 } as CSSProperties}>
                  <dt className="type-caption text-fg-soft">{f.term}</dt>
                  <dd className="m-0 type-ui text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <p className="ds-ph-label mt-3 flex flex-col gap-1 px-3 type-ui">
        <span className="flex items-center gap-2 overflow-hidden font-medium text-ellipsis whitespace-nowrap text-fg">
          {mark && <img src={mark} alt="" width={20} height={20} className="size-5 flex-none rounded-ds-sm" />}
          {label}
        </span>
        {meta && <span className="text-fg-muted">{meta}</span>}
      </p>
    </li>
  )
}

export function ProductHero({
  name,
  line,
  primary = { label: 'Get a free API key', href: '#' },
  secondary = { label: 'Read the docs', href: '#' },
  sets,
  lit = true,
  light,
  placeholder = 'Ask about any brand’s ads',
  tool = 'MCP',
  id = 'product',
  className,
}: ProductHeroProps) {
  const runRef = useRef<HTMLDivElement>(null)
  const questions = sets.map((s) => s.question)
  const key = questions.join('\n')
  useEffect(() => {
    const run = runRef.current
    if (!run) return
    return startResultsRun(run, key.split('\n'))
  }, [key])

  return (
    <section data-ds="product-hero" aria-labelledby={`${id}-heading`} className={cn('ds-ph relative isolate overflow-x-clip pb-(--ds-layout-section) text-fg', className)}>
      <style href="ds-product-hero" precedence="ds">{PRODUCT_HERO_CSS(ASCII_TEXTURE)}</style>
      {!lit && <span aria-hidden="true" className="ds-ph-ascii" />}
      <div className="mx-auto flex max-w-(--ds-ph-head-w) flex-col items-center gap-6 px-(--ds-layout-gutter) pt-30 text-center">
        <h1 id={`${id}-heading`} className="max-w-180 type-section">{name}</h1>
        <p className="max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{line}</p>
        <div className="flex flex-wrap justify-center gap-3 max-md:flex-col max-md:self-stretch">
          <Button href={primary.href}>{primary.label}</Button>
          <Button href={secondary.href} variant="secondary">{secondary.label}</Button>
        </div>
      </div>
      <div ref={runRef} data-ph-run="" className="mt-10 flex flex-col items-center">
        <div aria-hidden="true" className="ds-ph-composer flex flex-col gap-3 rounded-ds-lg border border-edge-surface bg-surface-raised p-3">
          <p className="min-h-12 px-2 pt-2 type-body text-fg">
            <span data-ph-text="" />
            <span className="ds-ph-caret" />
            <span data-ph-hint="" hidden className="text-fg-muted">{placeholder}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="grid size-8 flex-none place-items-center rounded-panel border border-edge-surface text-fg-soft">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
            </span>
            <span className="inline-flex h-8 items-center gap-2 rounded-panel bg-surface-inset px-3 type-ui-strong text-fg-soft">
              <Logo variant="mark" height={16} label="" className="text-fg" />
              {tool}
            </span>
            <span data-ph-send="" data-awake="" className="ds-ph-send ml-auto grid size-8 flex-none place-items-center rounded-panel bg-surface-inset text-fg-faint">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
            </span>
          </div>
        </div>
        <p className="sr-only">{questions.join(' ')}</p>
        <div data-stage="" className="ds-ph-stage mt-12 grid pt-6 pb-16">
          {sets.map((set) => (
            <ul key={set.question} data-row="" role="list" aria-label={set.resultsLabel} className="ds-ph-row m-0 flex list-none justify-center gap-2 p-0">
              {set.results.map((r) => <Card key={r.id} result={r} id={id} />)}
            </ul>
          ))}
        </div>
      </div>
      {lit && (light ?? (
        <picture aria-hidden="true" className="ds-ph-light">
          {WORKS_STILLS.slice(0, -1).map((s) => <source key={s.width} media={s.media} srcSet={s.picture} />)}
          <img src={WORKS_STILLS[WORKS_STILLS.length - 1].picture} alt="" draggable={false} />
        </picture>
      ))}
    </section>
  )
}

export default ProductHero

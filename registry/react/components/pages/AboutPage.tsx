import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { Button } from '@/react/components/ui/Button'
import { HERO_BAND } from '@/lib/effects/light-art'
import { LIGHT_TILE_B, LIGHT_TILE_C } from '@/lib/light-tiles'
import { aboutContent, type AboutContent, type AboutPhoto } from '@/lib/pages/about'
import { cn } from '@/react/lib/cn'

// The site's about and careers page (pages/About/AboutPage, About.module.css): the header; the head centered (the
// title 40/44, 44/48 from 768, at 720px; the lead 32px under it; the White button 56px under that, the full width on
// phones), 128px from the top; a strip of seven 4:5 columns (120px each on phones, overflowing both edges; the width,
// 12px apart, from 768) in front of the site's band of light, which drifts 4% each way over 14s and holds still with
// reduced motion; the story at 720px (a 24/28 subhead over 16/24 paragraphs); the benefits (the subhead, a lead, then
// each group's title beside its list from 640) and the footer. The strip takes your team's photos through `photos`
// (`src` and `alt`); `light` puts one of the site's light tiles in a column, and a tile with neither stays empty.
// `content` replaces the copy (lib/pages/about.ts).
export interface AboutPageProps {
  content?: AboutContent
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const LIGHT = { b: LIGHT_TILE_B, c: LIGHT_TILE_C }

function Tile({ photo }: { photo: AboutPhoto }) {
  const src = photo.light ? LIGHT[photo.light] : photo.src
  return (
    <li aria-hidden={photo.light || !src ? 'true' : undefined} className={cn('relative aspect-4/5 overflow-hidden', photo.light ? 'bg-surface' : 'bg-surface-raised', photo.wide && 'col-span-2 aspect-auto')}>
      {src ? <img src={src} alt={photo.light ? '' : photo.alt ?? ''} decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
    </li>
  )
}

export function AboutPage({ content: c = aboutContent, className }: AboutPageProps) {
  return (
    <div data-ds="about-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <style href="ds-about-page" precedence="ds">{css}</style>
      <div className={cn(CONTAINER, 'relative z-10')}>
        <SiteHeader links={c.shell.header.nav} secondary={c.shell.header.secondary} />
      </div>
      <main id="main">
        <section aria-labelledby={`${c.id}-heading`} className="pt-32 text-center">
          <div className={CONTAINER}>
            <h1 id={`${c.id}-heading`} className="mx-auto max-w-180 type-figure text-balance md:text-heading-1">{c.head.lines.join(' ')}</h1>
            <p className="mt-8 type-body-lg text-fg-soft">{c.head.lead}</p>
            <div className="mt-14 flex flex-col md:flex-row md:justify-center">
              <Button href={c.head.primary.href}>{c.head.primary.label}</Button>
            </div>
          </div>
        </section>
        <section aria-label={c.film} className="relative isolate overflow-clip py-24">
          <span aria-hidden="true" className="ds-about-band" style={{ backgroundImage: `url("${HERO_BAND.picture}")` }} />
          <ul role="list" className="grid grid-cols-[repeat(7,--spacing(30))] justify-center gap-2 md:grid-cols-7 md:gap-3">
            {c.photos.map((photo, i) => <Tile key={i} photo={photo} />)}
          </ul>
        </section>
        <section aria-labelledby={`${c.id}-story`} className="px-(--ds-layout-gutter) pb-24">
          <div className="mx-auto w-full max-w-180">
            <h2 id={`${c.id}-story`} className="mb-8 type-heading-3 text-balance">{c.story.headline}</h2>
            {c.story.paragraphs.map((p) => <p key={p} className="mb-6 type-body text-pretty text-fg last:mb-0">{p}</p>)}
          </div>
        </section>
        <section id={c.perks.id} aria-labelledby={`${c.id}-perks`} className="px-(--ds-layout-gutter) pb-32">
          <div className="mx-auto w-full max-w-180">
            <h2 id={`${c.id}-perks`} className="mb-2 type-heading-4 font-medium text-balance md:text-heading-3">{c.perks.headline}</h2>
            <p className="mb-16 type-body text-fg">{c.perks.lead}</p>
            <dl className="grid gap-10">
              {c.perks.groups.map((g) => (
                <div key={g.title} className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[--spacing(60)_minmax(0,1fr)] sm:gap-4">
                  <dt className="type-heading-4 font-medium text-fg">{g.title}</dt>
                  <dd>
                    <ul role="list" className="grid gap-1 type-body text-fg">
                      {g.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
      <SiteFooter columns={c.shell.footer.columns} legal={c.shell.footer.legal} />
    </div>
  )
}

export default AboutPage

const css = `
.ds-about-band {
  position: absolute; inset-block: 0; left: -10%; z-index: -1; width: 120%; pointer-events: none;
  background-position: 50% 50%; background-size: 100% 100%; background-repeat: no-repeat;
  will-change: transform;
  animation: ds-about-band 14s var(--ds-easing-drift) infinite alternate;
}
@keyframes ds-about-band { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
@media (prefers-reduced-motion: reduce) { .ds-about-band { animation: none; } }
`

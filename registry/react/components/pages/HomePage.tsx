import { Button } from '@/react/components/ui/Button'
import { Card } from '@/react/components/ui/Card'
import { SearchBar } from '@/react/components/product/SearchBar'
import { CreativeCorridor } from '@/react/components/site/CreativeCorridor'
import { CreativeGrid } from '@/react/components/site/CreativeGrid'
import { CreativeRing } from '@/react/components/site/CreativeRing'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { Testimonial } from '@/react/components/site/Testimonial'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { OfferBlock } from '@/react/components/blocks/OfferBlock'
import { StatBlock } from '@/react/components/blocks/StatBlock'
import { Logo } from '@/react/components/visuals/Logo'
import { homeContent, type HomeContent } from '@/lib/pages/home'
import { cn } from '@/react/lib/cn'

// The home page, built only from library items, in the order the ads tell the story: the search (the hero on a band
// of the light, three creatives under it), the index (the corridor), what it does (three cards), the numbers, agents
// (the ring), one customer, and the offer. `content` replaces the copy (lib/pages/home.ts holds the template's).
export interface HomePageProps {
  content?: HomeContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function HomePage({ content: c = homeContent, className }: HomePageProps) {
  return (
    <div data-ds="home-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.nav} secondary={c.secondary} cta={c.cta} />
      </div>
      <main>
        <HeroBlock headline={c.hero.headline} body={c.hero.body} actions={<Button href={c.hero.action.href}>{c.hero.action.label}</Button>} light="band" seed={2} texture>
          <SearchBar placeholder={c.hero.search} label="Search creatives" />
        </HeroBlock>
        <section aria-label="Results" className={cn(WRAP, 'pt-12 pb-24 max-sm:pt-8 max-sm:pb-16')}>
          <CreativeGrid items={c.results} ratio="3/4" gap="md" />
        </section>
        <section className={cn(WRAP, 'flex flex-col items-center gap-12 py-24 text-center max-sm:gap-8 max-sm:py-16')}>
          <h2 className="max-w-3xl type-section">{c.index.headline}</h2>
          <CreativeCorridor items={c.index.corridor} className="max-w-page" />
          <p className="max-w-120 type-body-lg text-fg-soft">{c.index.body}</p>
        </section>
        <section aria-label="What it does" className={cn(WRAP, 'grid grid-cols-3 gap-4 py-24 max-md:grid-cols-1 max-sm:py-16')}>
          {c.features.map((f) => <Card key={f.title} title={f.title} description={f.body} />)}
        </section>
        <div className={cn(WRAP, 'py-24 max-sm:py-16')}>
          <StatBlock title={c.stats.title} stats={c.stats.items} />
        </div>
        <section className={cn(WRAP, 'grid grid-cols-2 items-center gap-12 py-24 max-md:grid-cols-1 max-sm:py-16')}>
          <h2 className="max-w-xl type-section">{c.agents.headline}</h2>
          <CreativeRing items={c.agents.ring} className="w-full">
            <Logo height={20} />
          </CreativeRing>
        </section>
        <div className={cn(WRAP, 'py-24 max-sm:py-16')}>
          <Testimonial layout="side" quote={c.testimonial.quote} name={c.testimonial.name} position={c.testimonial.position} />
        </div>
        <OfferBlock headline={c.offer.headline} note={c.offer.note} cta={c.offer.cta} />
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default HomePage

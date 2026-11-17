import { Button } from '@/react/components/ui/Button'
import { Card } from '@/react/components/ui/Card'
import { CreativeRow } from '@/react/components/site/CreativeRow'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { StatBlock } from '@/react/components/blocks/StatBlock'
import { aboutContent, type AboutContent } from '@/lib/pages/about'
import { cn } from '@/react/lib/cn'

// The about page from library items: the deck's line centered under the light field, a row of creatives, what the
// company keeps to (three cards, from the guidelines' imagery rules), the numbers and a way in. `content` replaces the
// copy (lib/pages/about.ts).
export interface AboutPageProps {
  content?: AboutContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function AboutPage({ content: c = aboutContent, className }: AboutPageProps) {
  return (
    <div data-ds="about-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <HeroBlock eyebrow={c.hero.eyebrow} headline={c.hero.headline} body={c.hero.body} placement="center" light="field" />
        <div className={cn(WRAP, 'pb-24 max-sm:pb-16')}>
          <CreativeRow items={c.row} />
        </div>
        <section className={cn(WRAP, 'grid gap-10 py-24 max-sm:gap-8 max-sm:py-16')}>
          <h2 className="type-heading-1 text-balance max-sm:type-heading-2">{c.beliefs.title}</h2>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {c.beliefs.items.map((b) => <Card key={b.title} title={b.title} description={b.body} />)}
          </div>
        </section>
        <div className={cn(WRAP, 'py-24 max-sm:py-16')}>
          <StatBlock title={c.stats.title} stats={c.stats.items} />
        </div>
        <section className={cn(WRAP, 'flex flex-col items-start gap-6 py-24 max-sm:py-16')}>
          <h2 className="type-heading-1 text-balance max-sm:type-heading-2">{c.join.title}</h2>
          <p className="max-w-140 type-body-lg text-fg-soft">{c.join.body}</p>
          <Button href={c.join.cta.href} className="mt-2">{c.join.cta.label}</Button>
        </section>
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default AboutPage

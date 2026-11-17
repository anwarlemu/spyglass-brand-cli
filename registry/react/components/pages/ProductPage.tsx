import type { ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Card } from '@/react/components/ui/Card'
import { SearchBar } from '@/react/components/product/SearchBar'
import { CreativeGrid } from '@/react/components/site/CreativeGrid'
import { CreativeRing } from '@/react/components/site/CreativeRing'
import { CreativeRow } from '@/react/components/site/CreativeRow'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { OfferBlock } from '@/react/components/blocks/OfferBlock'
import { StatBlock } from '@/react/components/blocks/StatBlock'
import { Logo } from '@/react/components/visuals/Logo'
import { productContent, type ProductContent } from '@/lib/pages/product'
import { cn } from '@/react/lib/cn'

// The product page from library items: the deck cover's hero (the headline at the right, creatives on the curved
// strip), then one section per thing the product does, copy and picture side by side and alternating (search, the
// brief, the category, adding a brand, agents), and the offer. `content` replaces the copy (lib/pages/product.ts).
export interface ProductPageProps {
  content?: ProductContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

function Split({ headline, body, reverse, children }: { headline: string; body?: string; reverse?: boolean; children: ReactNode }) {
  return (
    <section className={cn(WRAP, 'grid grid-cols-2 items-center gap-12 py-24 max-md:grid-cols-1 max-sm:gap-8 max-sm:py-16')}>
      <div className={cn('grid gap-6', reverse && 'md:order-last')}>
        <h2 className="type-heading-1 text-balance max-sm:type-heading-2">{headline}</h2>
        {body && <p className="type-body-lg text-fg-soft">{body}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export function ProductPage({ content: c = productContent, className }: ProductPageProps) {
  return (
    <div data-ds="product-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <HeroBlock headline={c.hero.headline} body={c.hero.body} actions={<Button href={c.hero.action.href}>{c.hero.action.label}</Button>} placement="right" light="strip" texture>
          <CreativeRow items={c.hero.row} variant="peak" className="mt-32 max-sm:mt-16" />
        </HeroBlock>
        <Split headline={c.search.headline} body={c.search.body}>
          <div className="grid gap-4">
            <SearchBar placeholder={c.search.prompt} label="Search creatives" />
            <CreativeGrid items={c.search.results} ratio="3/4" />
          </div>
        </Split>
        <Split headline={c.brief.headline} body={c.brief.body} reverse>
          <Card title={c.brief.card.title}>
            <ul className="flex flex-col gap-2 type-ui text-fg">
              {c.brief.card.lines.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </Card>
        </Split>
        <Split headline={c.category.headline} body={c.category.body}>
          <StatBlock stats={c.category.stats} variant="card" />
        </Split>
        <Split headline={c.add.headline} reverse>
          <CreativeGrid items={c.add.grid} />
        </Split>
        <Split headline={c.agents.headline}>
          <CreativeRing items={c.agents.ring} className="w-full">
            <Logo height={20} />
          </CreativeRing>
        </Split>
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

export default ProductPage

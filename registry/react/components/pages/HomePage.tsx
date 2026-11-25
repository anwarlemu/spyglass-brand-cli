import { SiteHeader } from '@/react/components/site/SiteHeader'
import { ProofBlock } from '@/react/components/site/ProofBlock'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PlaygroundHero } from '@/react/components/blocks/PlaygroundHero'
import { FeaturesBlock } from '@/react/components/blocks/FeaturesBlock'
import { WhyBlock } from '@/react/components/blocks/WhyBlock'
import { HowItWorksBlock } from '@/react/components/blocks/HowItWorksBlock'
import { CaseStoriesBlock } from '@/react/components/blocks/CaseStoriesBlock'
import { PricingPanelsBlock } from '@/react/components/blocks/PricingPanelsBlock'
import { FaqBlock } from '@/react/components/blocks/FaqBlock'
import { CloseBlock } from '@/react/components/blocks/CloseBlock'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { homeContent, homeSections, type HomeBlocks, type HomeContent, type HomeSection } from '@/lib/pages/home'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'
import type { HeaderMenus } from '@/lib/site-header'

// The site's home (app/page.tsx, which renders app/v2/page.tsx), from library items in the site's order: the ASCII
// trail behind the page (a mouse leaves it), the header,
// the playground hero, the proof row, the features, the reasons, the set-up steps beside the MCP session, the case
// stories, the pricing strip, the questions, the close among the creatives and the footer. Each block carries its own
// copy (lib/home/*); `content` replaces the header, proof row, questions and footer (lib/pages/home.ts). `blocks`
// passes each block its own data, pictures included; `sections` lists the sections to show, in order (hero, proof,
// features, why, steps, stories, pricing, faq, close): leave one out to omit it.
export interface HomePageProps {
  content?: HomeContent
  /** Each block's data, pictures included: hero, features, why, steps, stories, pricing, close. */
  blocks?: HomeBlocks
  /** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
  menus?: HeaderMenus
  /** The sections to show, in order; all of them in the site's order by default. */
  sections?: readonly HomeSection[]
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function HomePage({ content: c = homeContent, blocks: b = {}, menus, sections, className }: HomePageProps) {
  const parts: Record<HomeSection, ReactNode> = {
    hero: <PlaygroundHero session={b.hero?.session} />,
    proof: <ProofBlock title={c.proof.title} logos={c.proof.logos} />,
    features: <FeaturesBlock ads={b.features?.ads} burst={b.features?.burst} ring={b.features?.ring} tally={b.features?.tally} />,
    why: <WhyBlock creatives={b.why?.creatives} logo={b.why?.logo} />,
    steps: <HowItWorksBlock session={b.steps?.session} />,
    stories: <CaseStoriesBlock cases={b.stories?.cases} quotes={b.stories?.quotes} />,
    pricing: <PricingPanelsBlock sets={b.pricing?.sets} />,
    faq: (
      <div className={cn(WRAP, 'py-(--ds-layout-section)')}>
        <FaqBlock id="home-faq" title={c.faq.title} body={c.faq.lead} action={c.faq.action} items={c.faq.items} />
      </div>
    ),
    close: <CloseBlock creatives={b.close?.creatives} />,
  }
  return (
    <div data-ds="home-page" className={cn('bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader menus={menus} links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main id="main">
        {pageSections(homeSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default HomePage

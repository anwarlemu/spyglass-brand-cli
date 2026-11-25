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
import { homeContent, type HomeContent } from '@/lib/pages/home'
import { cn } from '@/react/lib/cn'

// The site's home (app/page.tsx, which renders app/v2/page.tsx), from library items in the site's order: the ASCII
// trail behind the page (a mouse leaves it), the header,
// the playground hero, the proof row, the features, the reasons, the set-up steps beside the MCP session, the case
// stories, the pricing strip, the questions, the close among the creatives and the footer. Each block carries its own
// copy (lib/home/*); `content` replaces the header, proof row, questions and footer (lib/pages/home.ts).
export interface HomePageProps {
  content?: HomeContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function HomePage({ content: c = homeContent, className }: HomePageProps) {
  return (
    <div data-ds="home-page" className={cn('bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main id="main">
        <PlaygroundHero />
        <ProofBlock title={c.proof.title} logos={c.proof.logos} />
        <FeaturesBlock />
        <WhyBlock />
        <HowItWorksBlock />
        <CaseStoriesBlock />
        <PricingPanelsBlock />
        <div className={cn(WRAP, 'py-(--ds-layout-section)')}>
          <FaqBlock id="home-faq" title={c.faq.title} body={c.faq.lead} action={c.faq.action} items={c.faq.items} />
        </div>
        <CloseBlock />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default HomePage

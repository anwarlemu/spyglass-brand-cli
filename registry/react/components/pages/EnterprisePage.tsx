import { AutomationRun } from '@/react/components/site/AutomationRun'
import { EnterpriseFeatures } from '@/react/components/site/EnterpriseFeatures'
import { EnterpriseHero } from '@/react/components/site/EnterpriseHero'
import { PageClose } from '@/react/components/site/PageClose'
import { ProofStrip, proofPlaceholders, type ProofLogo } from '@/react/components/site/ProofStrip'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import type { RunItem } from '@/lib/automation-run'
import type { RingCard } from '@/lib/enterprise-ring'
import type { EnterpriseFeaturesContent } from '@/lib/enterprise-features'
import { enterprisePageContent, type EnterprisePageContent } from '@/lib/pages/enterprise'
import { cn } from '@/react/lib/cn'

// The site's enterprise page (app/enterprise, pages/Enterprise/EnterprisePage), from library items in the site's order:
// the header, the hero inside its ring of creatives, the logo row (24px under the hero, 16 from 768, the section's
// padding below), the automation run under its quote, the eight features, and the close with two buttons and no drifts,
// then the footer. `content` replaces the copy; `cards`, `logos`, `run` and `features` take your creatives and marks
// (Acme placeholders by default).
export interface EnterprisePageProps {
  content?: EnterprisePageContent
  cards?: RingCard[][]
  logos?: ProofLogo[]
  run?: RunItem[]
  features?: EnterpriseFeaturesContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function EnterprisePage({ content: c = enterprisePageContent, cards, logos = proofPlaceholders, run, features, className }: EnterprisePageProps) {
  return (
    <div data-ds="enterprise-page" className={cn('bg-surface text-fg', className)}>
      <SiteHeader links={c.header.links} secondary={c.header.secondary} variant="centered" />
      <main>
        <EnterpriseHero content={c.hero} cards={cards} />
        <section aria-label={c.proof} className="pt-(--ds-ent-logos-above) pb-(--ds-layout-section) md:pt-(--ds-ent-logos-above-md)">
          <div className={cn(WRAP, 'flex justify-center')}>
            <ProofStrip logos={logos} />
          </div>
        </section>
        <AutomationRun items={run} id="monday-report" />
        <EnterpriseFeatures content={features} />
        <PageClose id="enterprise-close" lines={c.close.title} note={c.close.note} primary={c.close.primary} secondary={c.close.secondary} control={null} texture={false} />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default EnterprisePage

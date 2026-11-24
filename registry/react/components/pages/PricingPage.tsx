import { CompareTable } from '@/react/components/site/CompareTable'
import { PageClose } from '@/react/components/site/PageClose'
import { PageHead } from '@/react/components/site/PageHead'
import { PricingTable } from '@/react/components/site/PricingTable'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { FaqBlock } from '@/react/components/blocks/FaqBlock'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { pricingContent, type PricingContent } from '@/lib/pages/pricing'
import { cn } from '@/react/lib/cn'

// The site's pricing page (app/pricing, pages/Pricing/PricingPage.tsx), from library items: the header, the centered
// page head ("Start free. Pay for what you use"), the plan cards with the billing switch, the compare table (from 768;
// the site leaves it out on phones), the questions, the closing section with the connect menu and the footer.
// `content` replaces the copy (lib/pages/pricing.ts).
export interface PricingPageProps {
  content?: PricingContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function PricingPage({ content: c = pricingContent, className }: PricingPageProps) {
  return (
    <div data-ds="pricing-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <PageHead id="pricing" lines={c.head.lines} lead={c.head.lead} align="centre" />
        <section aria-label="Plans" className="pb-[calc(var(--ds-layout-section)-var(--ds-space-xs))] md:pb-(--ds-layout-section)">
          <div className={WRAP}><PricingTable plans={c.plans} billing={c.billing} note={c.note} /></div>
        </section>
        <section aria-label={c.compare.label} className="py-(--ds-layout-section) max-md:hidden">
          <div className={WRAP}><CompareTable plans={c.compare.plans} groups={c.compare.groups} defaultPlan={c.compare.defaultPlan} /></div>
        </section>
        <div className={cn(WRAP, 'py-(--ds-layout-section)')}>
          <FaqBlock title={c.faq.title} body={c.faq.lead} action={c.faq.action} items={c.faq.items} />
        </div>
        <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default PricingPage

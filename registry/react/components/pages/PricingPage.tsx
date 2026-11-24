import { PlanCard } from '@/react/components/site/PlanCard'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { OfferBlock } from '@/react/components/blocks/OfferBlock'
import { pricingContent, type PricingContent } from '@/lib/pages/pricing'
import { cn } from '@/react/lib/cn'

// The pricing page from library items: the Creator plan ad as the top (the offer headline under the light field, the
// plan card below it) and the questions, answered only with what the plan says. `content` replaces the copy
// (lib/pages/pricing.ts); more plans in `plans` sit side by side.
export interface PricingPageProps {
  content?: PricingContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function PricingPage({ content: c = pricingContent, className }: PricingPageProps) {
  return (
    <div data-ds="pricing-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <OfferBlock headline={c.offer.headline} light="field" seed={0}>
          <div className="flex w-full flex-wrap justify-center gap-4">
            {c.plans.map((p) => <PlanCard key={p.title} title={p.title} price={p.price} features={p.features} cta={p.cta} href={p.href} className="w-150 max-w-full text-left" />)}
          </div>
        </OfferBlock>
        <section className={cn(WRAP, 'grid grid-cols-3 gap-12 py-24 max-md:grid-cols-1 max-md:gap-8 max-sm:py-16')}>
          <h2 className="type-section">{c.faq.title}</h2>
          <dl className="col-span-2 m-0 grid max-md:col-span-1">
            {c.faq.items.map((i) => (
              <div key={i.q} className="grid gap-2 border-t border-edge py-6">
                <dt className="type-heading-4">{i.q}</dt>
                <dd className="m-0 type-body text-fg-soft">{i.a}</dd>
              </div>
            ))}
          </dl>
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

export default PricingPage

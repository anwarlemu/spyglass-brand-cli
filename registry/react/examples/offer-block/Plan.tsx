import { OfferBlock } from '@/react/components/blocks/OfferBlock'
import { PlanCard } from '@/react/components/site/PlanCard'
// The Creator plan ad: the light field over the headline and the plan card.

export default function Plan() {
  return (
    <OfferBlock headline="Stop screenshotting at midnight." light="field" seed={0}>
      <PlanCard
        className="w-150 max-w-full text-left"
        title="Creator"
        price="$10 for your first month, then $20/month"
        features={['AI-powered research across brands, creators, ads, and campaigns', 'Unlimited board swipe files, alerts, and tracked brands', 'Unlimited team seats']}
        cta="Start Creator for 50% off"
      />
    </OfferBlock>
  )
}

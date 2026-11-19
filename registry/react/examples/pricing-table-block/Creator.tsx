import { PricingTableBlock } from '@/react/components/blocks/PricingTableBlock'
// The Creator plan, exactly as the ad states it.

const plans = [
  { title: 'Creator', price: '$10 for your first month, then $20/month', features: ['AI-powered research across brands, creators, ads, and campaigns', 'Unlimited board swipe files, alerts, and tracked brands', 'Unlimited team seats'], cta: 'Start Creator for 50% off', href: '/sign-up' },
]

export default function Creator() {
  return <PricingTableBlock title="One plan. Everything in it." plans={plans} />
}

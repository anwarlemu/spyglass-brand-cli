import { PricingTableBlock } from '@/react/components/blocks/PricingTableBlock'
// Acme's own three plans, side by side (placeholder plans: state yours exactly).

const plans = [
  { title: 'Acme Solo', price: '$12/month', features: ['One seat', 'Ten tracked brands'], cta: 'Start Solo' },
  { title: 'Acme Team', price: '$40/month', features: ['Five seats', 'Fifty tracked brands', 'Shared boards'], cta: 'Start Team' },
  { title: 'Acme Studio', price: '$90/month', features: ['Unlimited seats', 'Unlimited tracked brands', 'Shared boards', 'Alerts'], cta: 'Start Studio' },
]

export default function Plans() {
  return <PricingTableBlock title="Plans for every team." body="Every plan is billed monthly." plans={plans} />
}

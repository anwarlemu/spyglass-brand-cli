import { ProductPricing } from '@/react/components/site/ProductPricing'
// What each plan buys at one credit per creator.

export default function Plans() {
  return (
    <ProductPricing
      variant="plans"
      id="creator-search"
      value="1 credit"
      unit="per creator found"
      noun="creators"
      plans={[
        { name: 'Free', price: '$0', unit: 'a month', credits: '500 credits a month' },
        { name: 'Creator', price: '$10', unit: 'a month', credits: '5,000 credits a month' },
        { name: 'Pro', price: '$20', unit: 'minimum a month', credits: '$1.50 per 1K credits', after: 'Pay as you go' },
        { name: 'Enterprise', price: 'Custom', credits: 'Volume pricing', after: 'Volume pricing' },
      ]}
    />
  )
}

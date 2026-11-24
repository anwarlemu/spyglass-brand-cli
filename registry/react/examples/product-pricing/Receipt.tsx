import { ProductPricing } from '@/react/components/site/ProductPricing'
// The site's receipt for Creator search: three Acme creators at one credit each and the free row.

export default function Receipt() {
  return (
    <ProductPricing
      id="creator-search"
      value="1 credit"
      unit="per creator found"
      product="Creator search"
      rows={[
        { name: 'Acme Fit', meta: '@acmefit' },
        { name: 'Acme Run', meta: '@acmerun' },
        { name: 'Acme Yoga', meta: '@acmeyoga' },
      ]}
      free={{ name: 'Add a missing creator', meta: 'Indexed automatically' }}
      tally="3 creators found"
    />
  )
}

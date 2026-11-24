import { ProductPricing } from '@/react/components/site/ProductPricing'
// The rate set large beside what is free.

export default function Open() {
  return (
    <ProductPricing
      variant="open"
      id="creator-search"
      value="1 credit"
      unit="per creator found"
      example="Find 20 creators, use 20 credits."
      freeRows={[
        { label: '500 credits a month, no card', value: 'Free' },
        { label: 'Adding a missing brand or creator', value: 'Free' },
        { label: 'Looking up product categories', value: 'Free' },
        { label: 'The API and the MCP server', value: 'One pool' },
      ]}
    />
  )
}

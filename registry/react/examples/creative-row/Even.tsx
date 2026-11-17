import { CreativeRow } from '@/react/components/site/CreativeRow'
// The banner's row: six creatives of one size.

const items = [
  { brand: 'Acme Skin', tone: 2 as const },
  { brand: 'Acme Drinks', tone: 3 as const },
  { brand: 'Acme Studio', tone: 1 as const },
  { brand: 'Acme Fit', tone: 4 as const },
  { brand: 'Acme Drinks', tone: 2 as const },
  { brand: 'Acme Motors', tone: 3 as const },
]

export default function Even() {
  return <CreativeRow items={items} />
}

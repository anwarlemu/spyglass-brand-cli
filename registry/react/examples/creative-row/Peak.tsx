import { CreativeRow } from '@/react/components/site/CreativeRow'
// The deck cover's row: five creatives rising to the middle.

const items = [
  { brand: 'Acme Drinks', tone: 3 as const },
  { brand: 'Acme Fit', caption: 'Ten minute plan.', tone: 2 as const },
  { brand: 'Acme Studio', caption: 'Made to move.', tone: 4 as const },
  { brand: 'Acme Skin', caption: 'Does it work?', tone: 1 as const },
  { brand: 'Acme Drinks', tone: 3 as const },
]

export default function Peak() {
  return <CreativeRow items={items} variant="peak" />
}

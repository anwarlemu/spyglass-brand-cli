import { CreativeGrid } from '@/react/components/site/CreativeGrid'
// The ad's three up: 3/4 creatives under the search bar.

const items = [
  { brand: 'Acme Skin', caption: 'Glow in two steps.', tone: 3 as const },
  { brand: 'Acme Skin', caption: 'The travel kit.', tone: 2 as const },
  { brand: 'Acme Skin', caption: 'Night repair.', tone: 4 as const },
]

export default function ThreeUp() {
  return <CreativeGrid items={items} ratio="3/4" gap="md" />
}

import { CreativeCorridor } from '@/react/components/site/CreativeCorridor'
// The ad's corridor: twelve walls receding to the light.

const items = [
  { brand: 'Acme Studio', tone: 3 as const },
  { brand: 'Acme Studio', tone: 2 as const },
  { brand: 'Acme Fit', tone: 4 as const },
  { brand: 'Acme Drinks', tone: 3 as const },
  { brand: 'Acme Skin', tone: 2 as const },
  { brand: 'Acme Fit', tone: 1 as const },
]

export default function Corridor() {
  return <CreativeCorridor items={items} />
}

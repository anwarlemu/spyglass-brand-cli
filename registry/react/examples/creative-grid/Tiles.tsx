import { CreativeGrid } from '@/react/components/site/CreativeGrid'
// The post's grid: nine squares 8px apart, a light tile in the middle.

const items = [
  { brand: 'Acme Skin', tone: 2 as const },
  { brand: 'Acme Studio', tone: 1 as const },
  { brand: 'Acme Drinks', tone: 3 as const },
  { brand: 'Acme Motors', tone: 1 as const },
  { light: true, seed: 0 },
  { brand: 'Acme Drinks', tone: 4 as const },
  { brand: 'Acme Fit', tone: 3 as const },
  { brand: 'Acme Studio', tone: 2 as const },
  { brand: 'Acme Skin', tone: 4 as const },
]

export default function Tiles() {
  return <CreativeGrid items={items} className="w-120 max-w-full" />
}

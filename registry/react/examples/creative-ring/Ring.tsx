import { CreativeRing } from '@/react/components/site/CreativeRing'
import { Logo } from '@/react/components/visuals/Logo'
// The post's ring around the lockup.

const items = [
  { brand: 'Acme Skin', tone: 4 as const },
  { brand: 'Acme Studio', tone: 2 as const },
  { brand: 'Acme Motors', tone: 3 as const },
  { brand: 'Acme Fit', tone: 1 as const },
  { brand: 'Acme Drinks', tone: 3 as const },
  { brand: 'Acme Drinks', tone: 4 as const },
  { brand: 'Acme Motors', tone: 2 as const },
  { brand: 'Acme Fit', tone: 3 as const },
]

export default function Ring() {
  return (
    <CreativeRing items={items} className="w-140 max-w-full">
      <Logo height={20} />
    </CreativeRing>
  )
}

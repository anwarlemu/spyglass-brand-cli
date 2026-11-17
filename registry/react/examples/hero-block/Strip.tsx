import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { CreativeRow } from '@/react/components/site/CreativeRow'
// The third deck cover: the headline at the top right, creatives over the curved strip.

const items = [
  { brand: 'Acme Studio', tone: 2 as const },
  { brand: 'Acme Fit', tone: 3 as const },
  { brand: 'Acme Drinks', tone: 4 as const },
  { brand: 'Acme Skin', tone: 1 as const },
  { brand: 'Acme Studio', tone: 3 as const },
  { brand: 'Acme Drinks', tone: 2 as const },
  { brand: 'Acme Fit', tone: 4 as const },
]

export default function Strip() {
  return (
    <HeroBlock headline="The only creative search engine." placement="right" light="strip" seed={0} texture>
      <CreativeRow items={items} className="mt-32 max-sm:mt-16" />
    </HeroBlock>
  )
}

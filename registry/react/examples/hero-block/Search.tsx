import { Button } from '@/react/components/ui/Button'
import { SearchBar } from '@/react/components/product/SearchBar'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
// The ad's top: the headline and the line, the search bar across a band of the light.

export default function Search() {
  return (
    <HeroBlock
      headline="The only creative search engine."
      body="AI search across millions of creatives. Ask a question and get instant, structured results."
      actions={<Button href="#pricing">Get 50% off</Button>}
      light="band"
      seed={2}
      texture
    >
      <SearchBar placeholder="Show me UGC ads for skincare brands using before/after hooks" label="Search creatives" />
    </HeroBlock>
  )
}

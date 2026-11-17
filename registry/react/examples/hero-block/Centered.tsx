import { Button } from '@/react/components/ui/Button'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
// Centered under the light field, as the offer post sets it.

export default function Centered() {
  return (
    <HeroBlock
      headline="Know what changed before your next meeting."
      body="Spyglass follows the brands, creators, and niches that matter to you then turns the changes into a brief you actually want to read."
      actions={<><Button href="#pricing">Get 50% off</Button><Button href="#product" variant="secondary">Explore the product</Button></>}
      placement="center"
      light="field"
      seed={0}
    />
  )
}

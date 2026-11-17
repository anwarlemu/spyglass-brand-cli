import { CreativeCard } from '@/react/components/site/CreativeCard'
// Placeholders in the four neutral tones, with the advertiser and a headline, until the real creatives arrive.

export default function Placeholder() {
  return (
    <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-2">
      <CreativeCard tone={1} brand="Acme Skin" caption="Morning routine." />
      <CreativeCard tone={2} brand="Acme Drinks" caption="Two new flavors." />
      <CreativeCard tone={3} brand="Acme Studio" caption="Made to move." />
      <CreativeCard tone={4} brand="Acme Fit" caption="Ten minute plan." />
    </div>
  )
}

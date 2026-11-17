import { CreativeCard } from '@/react/components/site/CreativeCard'
// The shapes the assets use: 4/5 ads, 1/1 tiles, 7/5 landscape, 3/5 tall stories.

export default function Shapes() {
  return (
    <div className="flex items-end gap-4 max-sm:gap-2">
      <CreativeCard ratio="4/5" tone={2} brand="Acme" className="w-40 max-sm:w-20" />
      <CreativeCard ratio="1/1" tone={3} brand="Acme" className="w-40 max-sm:w-20" />
      <CreativeCard ratio="7/5" tone={1} brand="Acme" className="w-48 max-sm:w-24" />
      <CreativeCard ratio="3/5" tone={4} brand="Acme" className="w-32 max-sm:w-16" />
    </div>
  )
}

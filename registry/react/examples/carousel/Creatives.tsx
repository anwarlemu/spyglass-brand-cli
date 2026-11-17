'use client'
import { Carousel } from '@/react/components/ui/Carousel'
// Saved creatives, three in view on wide screens and one on phones. Placeholders stand in for the ads.
const creatives = [
  { title: 'Acme summer UGC', meta: 'Video, 41 days running' },
  { title: 'Acme serum launch', meta: 'Carousel, 18 days running' },
  { title: 'Acme founder story', meta: 'Video, 63 days running' },
  { title: 'Acme bundle offer', meta: 'Image, 9 days running' },
  { title: 'Acme before and after', meta: 'Video, 27 days running' },
]

export default function Creatives() {
  return (
    <div className="w-full max-w-238">
      <Carousel
        label="Saved creatives"
        count={creatives.length}
        perView={3}
        slide={({ index }) => (
          <div className="flex flex-col gap-3">
            <div className="flex aspect-[4/5] items-end rounded-container bg-surface-raised p-4">
              <span className="type-label text-fg-muted">{`Creative ${index + 1}`}</span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="type-ui-strong">{creatives[index]!.title}</p>
              <p className="type-caption text-fg-muted">{creatives[index]!.meta}</p>
            </div>
          </div>
        )}
      />
    </div>
  )
}

import { BrandLight } from '@/react/components/visuals/BrandLight'
// Every variant at seed 0, as the brand assets cut it.

const VARIANTS = ['band', 'field', 'corner', 'tile', 'close-up', 'curved-strip'] as const

export default function Variants() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {VARIANTS.map((v) => (
        <figure key={v} className="flex flex-col gap-2">
          <BrandLight variant={v} cover className="aspect-[4/3] w-full rounded-container" />
          <figcaption className="type-label text-fg-muted">{v}</figcaption>
        </figure>
      ))}
      <figure className="flex flex-col gap-2">
        <div className="flex aspect-[4/3] w-full justify-between overflow-hidden rounded-container bg-surface">
          <BrandLight variant="strip-left" className="h-full" />
          <BrandLight variant="strip-right" className="h-full" />
        </div>
        <figcaption className="type-label text-fg-muted">strip-left, strip-right</figcaption>
      </figure>
    </div>
  )
}

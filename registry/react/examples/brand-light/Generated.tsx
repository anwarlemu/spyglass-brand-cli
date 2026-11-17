import { BrandLight } from '@/react/components/visuals/BrandLight'
// Heat maps built from a seed, the same way as the brand's: each seed is another light.

export default function Generated() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[3, 7, 11].map((seed) => (
        <figure key={seed} className="flex flex-col gap-2">
          <BrandLight variant="corner" source="generated" seed={seed} cover className="aspect-square w-full rounded-container" />
          <figcaption className="type-label text-fg-muted">seed {seed}</figcaption>
        </figure>
      ))}
    </div>
  )
}

import { AspectRatio } from '@/react/components/ui/AspectRatio'
import { BrandLight } from '@/react/components/visuals/BrandLight'
// The brand's three canvases holding their shape at any width: a 1:1 post, a 4:5 ad and a 16:9 slide, each with the
// light behind its label.
const formats = [
  { label: 'Post 1:1', ratio: 1, variant: 'corner' as const },
  { label: 'Ad 4:5', ratio: 4 / 5, variant: 'strip-left' as const },
  { label: 'Slide 16:9', ratio: 16 / 9, variant: 'field' as const },
]

export default function Formats() {
  return (
    <div className="grid w-200 max-w-full grid-cols-3 items-end gap-4 max-sm:grid-cols-1">
      {formats.map((f) => (
        <AspectRatio key={f.label} ratio={f.ratio} className="rounded-container bg-surface-raised">
          <BrandLight variant={f.variant} seed={1} cover className="absolute inset-0" />
          <span className="absolute bottom-3 left-3 type-label text-fg">{f.label}</span>
        </AspectRatio>
      ))}
    </div>
  )
}

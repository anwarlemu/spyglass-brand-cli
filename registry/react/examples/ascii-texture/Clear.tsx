import { AsciiTexture } from '@/react/components/visuals/AsciiTexture'
import { BrandLight } from '@/react/components/visuals/BrandLight'
// Behind the light and a headline, with the headline's area kept clear.

export default function Clear() {
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-container bg-surface">
      <BrandLight variant="field" seed={0} cover className="absolute inset-0 size-full" />
      <AsciiTexture seed={9} width={1080} height={540} clear={[{ x: 80, y: 300, w: 640, h: 180 }]} cover className="absolute inset-0 size-full" />
      <h2 className="absolute bottom-[9%] left-[7%] max-w-[60%] type-hero max-sm:type-heading-3">Stop screenshotting at midnight.</h2>
    </div>
  )
}

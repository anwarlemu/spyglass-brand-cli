'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// Who posts with a brand and who tags it, by window. Acme's copy; every picture is a neutral shape.

export default function Timelines() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="collabs-timeline" texture={0} />
      <ProductVisual kind="tagged-timeline" texture={1} />
    </div>
  )
}

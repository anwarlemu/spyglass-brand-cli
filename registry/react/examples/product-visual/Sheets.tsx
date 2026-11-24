'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// Ranked sheets with a two-way switch: the media mix, campaigns and landing pages. Acme's copy; every picture is a neutral shape.

export default function Sheets() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="media-mix" texture={0} />
      <ProductVisual kind="campaigns" texture={1} />
      <ProductVisual kind="pages-switch" texture={2} />
    </div>
  )
}

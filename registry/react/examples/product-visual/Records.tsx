'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// A brand, a creative and a landing page record, each cycling through its sets beside its picture. Acme's copy; every picture is a neutral shape.

export default function Records() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="brand-record" texture={0} />
      <ProductVisual kind="creative-record" texture={1} />
      <ProductVisual kind="page-record" texture={2} />
    </div>
  )
}

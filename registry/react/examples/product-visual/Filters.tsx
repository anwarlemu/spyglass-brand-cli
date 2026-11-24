'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// A creator search narrowing by filters, and two searches narrowing a grid of results. Acme's copy; every picture is a neutral shape.

export default function Filters() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="creator-filters" texture={0} />
      <ProductVisual kind="filter-narrow" texture={1} />
      <ProductVisual kind="posts-narrow" texture={2} />
    </div>
  )
}

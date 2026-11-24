'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// The links board and the patterns switch. Acme's copy; every picture is a neutral shape.

export default function Board() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="links-board" texture={0} />
      <ProductVisual kind="patterns-switch" texture={1} />
    </div>
  )
}

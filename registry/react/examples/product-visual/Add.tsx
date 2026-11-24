'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// Adding a brand and a creator by their handles, and comments sorted into themes. Acme's copy; every picture is a neutral shape.

export default function Add() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="add-account" texture={0} />
      <ProductVisual kind="add-creator" texture={1} />
      <ProductVisual kind="comment-themes" texture={2} />
    </div>
  )
}

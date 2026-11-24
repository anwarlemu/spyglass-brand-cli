'use client'
import { ProductVisual } from '@/react/components/site/ProductVisual'
// A creator record, a tagged post record and a post with its top comments. Acme's copy; every picture is a neutral shape.

export default function People() {
  return (
    <div className="flex w-192 max-w-full flex-col gap-6">
      <ProductVisual kind="creator-record" texture={0} />
      <ProductVisual kind="tagged-record" texture={1} />
      <ProductVisual kind="comment-thread" texture={2} />
    </div>
  )
}

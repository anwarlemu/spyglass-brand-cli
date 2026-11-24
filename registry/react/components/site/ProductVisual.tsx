'use client'
import { useEffect, useRef } from 'react'
import { mountProductVisual, productVisualCss, type ProductVisualDataMap, type ProductVisualKind } from '@/lib/product-visual'
import { cn } from '@/react/lib/cn'

// The site's product visuals (pages/Products/visuals, v2/V2Features LinksBoard and PatternsSwitch): the 4:3 stage a
// product page's feature row shows, a #262626 panel with the 8px corner, the ASCII field around its clear middle and one
// small looping scene of the product. `kind` picks the scene: a record cycling through its sets beside a picture
// (brand, creative, page, creator, tagged, a post's comment thread), adding an account (added, indexing, ready),
// comment themes, a creator search narrowing by filters, a search narrowing a grid of results, a timeline of who posts
// with a brand by window, a ranked sheet with a two-way switch (media mix, campaigns, landing pages), the links board
// and the patterns switch. `data` takes the kind's content (Acme by default; every picture is a neutral shape unless
// you pass one). The scenes step at the site's reading pace while on screen and rest with reduced motion; the ranked
// sheet's and the patterns' tabs can be pressed (arrow keys move between them) and stop the loop on that view.
// The stage measures itself (its width picks the site's 440 and 560 layouts), so it fits any column.
export interface ProductVisualProps<K extends ProductVisualKind = ProductVisualKind> {
  kind: K
  /** The kind's content; Acme by default. */
  data?: ProductVisualDataMap[K]
  /** The ASCII field's position, 0 to 3 (a product page alternates by row), or false for none. */
  texture?: number | false
  className?: string
}

export function ProductVisual<K extends ProductVisualKind>({ kind, data, texture = 0, className }: ProductVisualProps<K>) {
  const ref = useRef<HTMLDivElement>(null)
  const key = JSON.stringify(data ?? null)
  useEffect(() => {
    const stage = ref.current
    if (!stage) return
    return mountProductVisual(stage, { kind, data: key === 'null' ? undefined : (JSON.parse(key) as ProductVisualDataMap[K]), texture })
  }, [kind, key, texture])
  return (
    <div ref={ref} data-ds="product-visual" data-kind={kind} className={cn('ds-pv', className)}>
      <style href="ds-product-visual" precedence="ds">{productVisualCss}</style>
    </div>
  )
}

export default ProductVisual

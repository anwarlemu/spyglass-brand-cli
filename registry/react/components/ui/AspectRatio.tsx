import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// shadcn's aspect ratio: a box that keeps its shape as it grows (CSS aspect-ratio), for a creative or a frame that
// must not reflow: a 1:1 post, a 4:5 ad, a 16:9 deck slide. `ratio` is width over height; the content fills it. It
// draws nothing itself: add rounded-container for the brand corner, and bg-surface-raised for a ground while a picture
// loads.
export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** Width over height (1 for a post, 4 / 5 for an ad, 16 / 9 for a slide). */
  ratio?: number
}

export function AspectRatio({ ratio = 1, className, style, children, ...rest }: AspectRatioProps) {
  return (
    <div data-ds="aspect-ratio" className={cn('relative w-full overflow-hidden', className)} style={{ ...style, aspectRatio: String(ratio) }} {...rest}>
      {children}
    </div>
  )
}

export default AspectRatio

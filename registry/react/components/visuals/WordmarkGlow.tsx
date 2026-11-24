'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { LOGOS } from '@/lib/logos'
import { startWordmarkGlow } from '@/lib/effects/wordmark-glow'
import { GLOW_CSS, wordmarkMask } from '@/lib/effects/wordmark-glow-css'
import { cn } from '@/react/lib/cn'

// The site's wordmark glow (effect/WordmarkGlow with site/Footer/FooterWordmarkGlow): the big wordmark across the
// area in the footer gray over a faint 20px dot grid; a mouse lights the dots near it in the spectrum and, over the
// wordmark, its letters, the light easing after the pointer and leaving when it does. `children` follow the wordmark
// inside the area (a footer's card, pulled up over the descender). The site's footer uses the dispersion field's
// light instead by default; this is its other look. Only for a fine pointer; with reduced motion the letters keep a
// still glow and the dots stay plain. Decoration: the wordmark is hidden from assistive tech.
export interface WordmarkGlowProps {
  /** What follows the wordmark inside the area. */
  children?: ReactNode
  className?: string
}

export function WordmarkGlow({ children, className }: WordmarkGlowProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const area = ref.current
    return area ? startWordmarkGlow(area) : undefined
  }, [])
  const w = LOGOS.wordmark
  return (
    <div ref={ref} data-ds="wordmark-glow" className={cn('relative isolate', className)} style={{ '--ds-glow-wordmark': wordmarkMask() } as CSSProperties}>
      <style href="ds-wordmark-glow" precedence="ds">{GLOW_CSS}</style>
      <span className="ds-glow-grid" aria-hidden="true" />
      <span className="ds-glow-dots" data-glow-dots="" aria-hidden="true" />
      <div className="relative w-full [container-type:inline-size]" data-glow-word="" aria-hidden="true" style={{ aspectRatio: `${w.width} / ${w.height}` }}>
        <svg viewBox={`0 0 ${w.width} ${w.height}`} className="absolute inset-0 block size-full fill-wordmark-gray" dangerouslySetInnerHTML={{ __html: w.body }} />
        <span className="ds-glow-letters" data-glow-letters="" />
      </div>
      {children}
    </div>
  )
}

export default WordmarkGlow

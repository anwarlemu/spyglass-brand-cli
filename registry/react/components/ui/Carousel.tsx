'use client'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'

// shadcn's carousel in the brand: slides in a row on the Black ground, 16px apart, one or more in view, with two ghost
// arrow buttons and the place in tabular figures between them. Native scroll snap, so a swipe or a trackpad moves it
// as the arrows do; the arrows and the arrow keys on the focused track glide it with the browser's smooth scroll, and
// jump with reduced motion. It never plays on its own. Pass `count` and draw each slide with `slide({ index })`;
// `perView` sets how many show at 768px and up (one on phones).
export interface CarouselProps {
  /** How many slides. */
  count: number
  /** What it holds, for assistive tech. */
  label: string
  /** How many show at 768px and up. */
  perView?: 1 | 2 | 3
  /** Draws slide `index`. */
  slide?: (slot: { index: number }) => ReactNode
}

export function Carousel({ count, label, perView = 1, slide }: CarouselProps) {
  const track = useRef<HTMLDivElement | null>(null)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(1)
  const last = Math.max(0, count - visible)
  const countRef = useRef(count)
  countRef.current = count

  // One step: a slide and the gap after it.
  function stride(el: HTMLElement) {
    const [a, b] = el.children as unknown as HTMLElement[]
    return a ? (b ? b.offsetLeft - a.offsetLeft : a.offsetWidth) : 0
  }
  function measure() {
    const el = track.current
    const step = el ? stride(el) : 0
    if (!el || !step) return
    const v = Math.max(1, Math.round((el.clientWidth + step - (el.firstElementChild as HTMLElement).offsetWidth) / step))
    setVisible(v)
    setCurrent(Math.min(Math.max(0, countRef.current - v), Math.round(el.scrollLeft / step)))
  }
  function go(i: number) {
    const el = track.current
    const step = el ? stride(el) : 0
    if (!el || !step) return
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: Math.max(0, Math.min(last, i)) * step, behavior: reduce ? 'auto' : 'smooth' })
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1) }
  }
  useEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    return () => ro.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section data-ds="carousel" className="flex min-w-0 flex-col gap-3" role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        className="ds-carousel flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain rounded-container focus-visible:outline-offset-2"
        data-per-view={perView}
        tabIndex={0}
        aria-label={`${label}, use the arrow keys to move`}
        onScroll={measure}
        onKeyDown={onKey}
      >
        {Array.from({ length: count }, (_, k) => (
          <div key={k + 1} className="ds-carousel-slide min-w-0 shrink-0 snap-start" role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${count}`}>
            {slide?.({ index: k })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1">
        <Button variant="ghost" size="sm" icon disabled={current <= 0} aria-label={`Previous ${label}`} onClick={() => go(current - 1)}><ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
        <span className="min-w-12 text-center type-caption text-fg-muted tabular-nums" aria-live="polite">{`${current + 1} / ${last + 1}`}</span>
        <Button variant="ghost" size="sm" icon disabled={current >= last} aria-label={`Next ${label}`} onClick={() => go(current + 1)}><ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
      </div>
      <style href="ds-carousel" precedence="ds">{css}</style>
    </section>
  )
}

export default Carousel

const css = `
.ds-carousel { scrollbar-width: none; }
.ds-carousel::-webkit-scrollbar { display: none; }
.ds-carousel-slide { width: 100%; }
@media (min-width: 768px) {
  .ds-carousel[data-per-view="2"] .ds-carousel-slide { width: calc((100% - var(--ds-space-lg)) / 2); }
  .ds-carousel[data-per-view="3"] .ds-carousel-slide { width: calc((100% - 2 * var(--ds-space-lg)) / 3); }
}
`

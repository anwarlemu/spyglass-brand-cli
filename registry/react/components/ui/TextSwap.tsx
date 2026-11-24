'use client'
import { useEffect, useRef, useState } from 'react'
import { prefersReduced, SWAP_CSS, swapLeaveMs, swapTo, type SwapItem } from '@/lib/text-swap'
import { cn } from '@/react/lib/cn'

// The site's animated value swap (pages/Pricing/Swap): a price, a plan name or a sort label that changes in place. The
// old value rises 12px and fades out while the new one rises in from below, in one grid cell clipped 4px out, over
// 480ms on the loop curve; a value that changes again mid-swap takes over from where it is. `unit` follows the value in
// small muted type ("/month"), `tag` as a small badge ("Save 20%"). The type comes from the page (`className`). With
// reduced motion the value changes at once. The leaving value is hidden from assistive tech.
export interface TextSwapProps {
  text: string
  /** Small muted text after the value ("/month"). */
  unit?: string
  /** A small badge after the value ("Save 20%"). */
  tag?: string
  className?: string
}

export function TextSwap({ text, unit, tag, className }: TextSwapProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [items, setItems] = useState<SwapItem[]>([{ id: 0, text, unit, tag, state: 'in' }])
  const [asked, setAsked] = useState({ text, unit, tag })
  const dropAt = useRef(new Map<number, number>())

  if (asked.text !== text || asked.unit !== unit || asked.tag !== tag) {
    setAsked({ text, unit, tag })
    setItems(swapTo(items, { text, unit, tag }, prefersReduced()))
  }

  useEffect(() => {
    let frame = 0
    if (items.some((i) => i.state === 'enter')) {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setItems((now) => now.map((i) => (i.state === 'enter' ? { ...i, state: 'in' as const } : i))))
      })
    }
    const now = performance.now()
    const leaving = items.filter((i) => i.state === 'out')
    const live = new Set(leaving.map((i) => i.id))
    for (const id of dropAt.current.keys()) if (!live.has(id)) dropAt.current.delete(id)
    const ms = ref.current ? swapLeaveMs(ref.current) : 480
    for (const i of leaving) if (!dropAt.current.has(i.id)) dropAt.current.set(i.id, now + ms)
    let timer = 0
    if (leaving.length) {
      const due = Math.min(...leaving.map((i) => dropAt.current.get(i.id) ?? now))
      timer = window.setTimeout(() => {
        const t = performance.now()
        const done = new Set(leaving.filter((i) => (dropAt.current.get(i.id) ?? 0) <= t).map((i) => i.id))
        setItems((cur) => cur.filter((c) => !done.has(c.id)))
      }, Math.max(0, due - now))
    }
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [items])

  return (
    <span ref={ref} data-ds="text-swap" className={cn('inline-grid overflow-clip align-top [overflow-clip-margin:var(--ds-space-xs)]', className)}>
      <style href="ds-text-swap" precedence="ds">{SWAP_CSS}</style>
      {items.map((item) => (
        <span key={item.id} className="ds-swap-item" data-state={item.state} aria-hidden={item.state === 'out' || undefined}>
          {item.text}
          {item.unit ? <span className="ms-2 font-text text-ui/5 text-fg-muted">{item.unit}</span> : null}
          {item.tag ? <span className="relative ms-2 inline-block rounded-ds-sm bg-surface px-2 font-text text-caption/5 font-medium whitespace-nowrap text-fg inset-ring inset-ring-edge-surface">{item.tag}</span> : null}
        </span>
      ))}
    </span>
  )
}

export default TextSwap

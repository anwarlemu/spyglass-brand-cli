'use client'
import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// The site's segmented switch (pages/Pricing Segmented.tsx, controls.css --seg-*): one choice out of a few, as radios.
// A #1A1A1A tray in a #262626 ring with the 8px corner, 4px in; each option 28px tall, 12px in, DM Sans Medium 14/20 in
// #A3A3A3, the chosen one White on a #363636 pill (the small corner) that glides to the option chosen. The pill is
// one layer under the options, clipped to the chosen option's box, and the clip moves over 160ms on the loop ease
// (still with reduced motion). Arrows, Home and End move the choice. `block` stretches it to its container (the
// compare table's plan picker on phones). `value` with `onValueChange` controls it (or `defaultValue` alone).
export interface SegmentedOption<K extends string = string> {
  key: K
  label: ReactNode
}

export interface SegmentedProps<K extends string = string> {
  /** The group's name for assistive tech. */
  label: string
  options: SegmentedOption<K>[]
  value?: K
  defaultValue?: K
  onValueChange?: (value: K) => void
  /** Full width, the options sharing it. */
  block?: boolean
  className?: string
}

const NEXT: Record<string, (i: number, last: number) => number> = {
  ArrowRight: (i, last) => (i === last ? 0 : i + 1),
  ArrowDown: (i, last) => (i === last ? 0 : i + 1),
  ArrowLeft: (i, last) => (i === 0 ? last : i - 1),
  ArrowUp: (i, last) => (i === 0 ? last : i - 1),
  Home: () => 0,
  End: (_, last) => last,
}

export function Segmented<K extends string = string>({ label, options, value, defaultValue, onValueChange, block = false, className }: SegmentedProps<K>) {
  const [current, setCurrent] = useControllable<K>(value, defaultValue ?? options[0]?.key, onValueChange)
  const tray = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ l: number, r: number } | null>(null)

  useLayoutEffect(() => {
    const el = tray.current
    if (!el) return
    const measure = () => {
      const o = el.querySelector<HTMLElement>('[aria-checked="true"]')
      if (o) setPill({ l: o.offsetLeft, r: el.clientWidth - o.offsetLeft - o.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [current])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT[e.key]
    if (!step) return
    e.preventDefault()
    const next = step(options.findIndex((o) => o.key === current), options.length - 1)
    setCurrent(options[next].key)
    tray.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div
      ref={tray}
      data-ds="segmented"
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('relative isolate flex gap-1 rounded-control bg-surface-subtle p-1 shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-neutral-4)]', block ? 'w-full' : 'w-fit', className)}
    >
      {pill && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-1 bg-surface-inset transition-[clip-path] duration-160 ease-loop motion-reduce:transition-none"
          style={{ clipPath: `inset(var(--ds-space-xs) ${pill.r}px var(--ds-space-xs) ${pill.l}px round var(--ds-radius-sm))` } as CSSProperties}
        />
      )}
      {options.map((o) => {
        const on = o.key === current
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => setCurrent(o.key)}
            className={cn(
              'relative inline-flex h-7 cursor-pointer items-center gap-2 rounded-ds-sm border-0 bg-transparent type-ui-strong whitespace-nowrap tabular-nums text-fg-muted transition-[color] duration-160 ease-loop hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg motion-reduce:transition-none aria-checked:text-fg pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-2 pointer-coarse:after:content-[\'\']',
              block ? 'flex-1 justify-center px-2' : 'px-3',
              on && !pill && 'bg-surface-inset',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export default Segmented

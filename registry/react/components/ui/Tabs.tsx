'use client'
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// Views of one thing, one at a time. `variant` default is a segmented control: a #171717 track with the brand corner,
// the current view a White block with a Black DM Sans Medium label, the rest muted and White under the pointer. `line`
// is for a page's sections: labels 24px apart over a #262626 hairline, the current one White with a 2px White line
// under it. Colors change over 150ms; nothing slides. Arrow keys move between tabs and select (Home and End for the
// ends); Tab moves into the panel. Pass `panels` (content by value) to draw the current panel under the list. The
// value is `value` with `onValueChange` (or `defaultValue` alone).
export type TabOption<T extends string> = T | { value: T, label: string, disabled?: boolean }
export type TabsVariant = 'default' | 'line'

export interface TabsProps<T extends string> {
  /** The tabs: values, or { value, label, disabled }. */
  options: readonly TabOption<T>[]
  /** The tab list's name for assistive tech. */
  label: string
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** default (a segmented control) or line (labels over a hairline). */
  variant?: TabsVariant
  /** The panel for each tab, by value. */
  panels?: Partial<Record<T, ReactNode>>
  className?: string
}

const norm = <T extends string>(o: TabOption<T>) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })

const LIST: Record<TabsVariant, string> = {
  default: 'inline-flex h-control-md w-fit max-w-full items-center gap-1 rounded-control bg-surface-raised p-1',
  line: 'flex items-center gap-6 border-b border-edge',
}
const TAB: Record<TabsVariant, string> = {
  default: 'inline-flex h-full flex-1 cursor-pointer items-center justify-center rounded-ds-sm px-3 type-ui-strong whitespace-nowrap transition-[background-color,color] duration-150 ease-standard disabled:cursor-not-allowed disabled:text-fg-faint',
  line: '-mb-px inline-flex h-control-md cursor-pointer items-center border-b-2 type-ui-strong whitespace-nowrap transition-[border-color,color] duration-150 ease-standard disabled:cursor-not-allowed disabled:text-fg-faint',
}
const ON: Record<TabsVariant, string> = { default: 'bg-action-primary text-action-primary-fg', line: 'border-action-primary text-fg' }
const OFF: Record<TabsVariant, string> = { default: 'text-fg-muted hover:not-disabled:text-fg', line: 'border-transparent text-fg-muted hover:not-disabled:text-fg' }

/** The id-safe form of a value. */
const slug = (v: string) => v.replace(/[^\w-]/g, '-')

export function Tabs<T extends string>({ options, label, value, defaultValue, onValueChange, variant = 'default', panels, className }: TabsProps<T>) {
  const opts = options.map(norm)
  const [current, setCurrent] = useControllable<T | undefined>(value, defaultValue ?? opts.find((o) => !o.disabled)?.value, (v) => v !== undefined && onValueChange?.(v))
  const base = `tabs-${useId().replace(/:/g, '')}`
  const list = useRef<HTMLDivElement | null>(null)
  const v = LIST[variant] ? variant : 'default'

  function onKeyDown(event: KeyboardEvent) {
    const enabled = opts.filter((o) => !o.disabled)
    const at = enabled.findIndex((o) => o.value === current)
    let next: number
    if (event.key === 'ArrowRight') next = (at + 1) % enabled.length
    else if (event.key === 'ArrowLeft') next = (at - 1 + enabled.length) % enabled.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = enabled.length - 1
    else return
    event.preventDefault()
    const pick = enabled[next]
    if (!pick) return
    setCurrent(pick.value)
    list.current?.querySelector<HTMLElement>(`#${base}-tab-${slug(pick.value)}`)?.focus()
  }

  const panel = current !== undefined ? panels?.[current] : undefined
  return (
    <div data-ds="tabs" className={cn('flex flex-col gap-4', className)}>
      <div ref={list} role="tablist" aria-label={label} className={LIST[v]} onKeyDown={onKeyDown}>
        {opts.map((o) => (
          <button
            key={o.value}
            id={`${base}-tab-${slug(o.value)}`}
            type="button"
            role="tab"
            aria-selected={current === o.value}
            aria-controls={panels?.[o.value] !== undefined ? `${base}-panel-${slug(o.value)}` : undefined}
            tabIndex={current === o.value ? 0 : -1}
            disabled={o.disabled}
            className={cn(TAB[v], current === o.value ? ON[v] : OFF[v])}
            onClick={() => setCurrent(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {panel !== undefined && current !== undefined && (
        <div id={`${base}-panel-${slug(current)}`} role="tabpanel" tabIndex={0} aria-labelledby={`${base}-tab-${slug(current)}`}>{panel}</div>
      )}
    </div>
  )
}

export default Tabs

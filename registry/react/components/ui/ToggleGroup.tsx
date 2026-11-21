'use client'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'

// Buttons that stay pressed, side by side on one track: a #363636 hairline on Black with the brand corner, 4px in,
// each pressed one a White block with Black text (the small corner, nested inside the track's), the rest soft gray
// that turns White under a hovering pointer. 32px (sm) or 40px (md) tall in all. `multiple` lets several stay on (the
// value is an array); otherwise one at most, and pressing it again lets it go. Colors change over 150ms; a press gives
// a little (scale 0.97, not with reduced motion). For views of one thing use Tabs; this is for options that are on or
// off. `value` with `onValueChange` controls it (or `defaultValue` alone).
export type ToggleGroupOption<T extends string> = T | { value: T, label: string, disabled?: boolean }
export type ToggleGroupSize = 'sm' | 'md'

const ITEM: Record<ToggleGroupSize, string> = { sm: 'h-5.5 px-2', md: 'h-7.5 px-3' }

export interface ToggleGroupProps<T extends string> {
  /** The buttons: a label that is its own value, or { value, label, disabled }. */
  options: readonly ToggleGroupOption<T>[]
  /** The group's name for assistive tech. */
  label: string
  /** Several can stay on (the value is an array). */
  multiple?: boolean
  /** sm (32px) or md (40px) in all. */
  size?: ToggleGroupSize
  value?: T | T[] | null
  defaultValue?: T | T[] | null
  onValueChange?: (value: T | T[] | null) => void
  className?: string
}

const norm = <T extends string>(o: ToggleGroupOption<T>) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })

export function ToggleGroup<T extends string>({ options, label, multiple, size = 'md', value, defaultValue = null, onValueChange, className }: ToggleGroupProps<T>) {
  const [model, setModel] = useControllable<T | T[] | null>(value, defaultValue, onValueChange)
  const on = (v: T) => (Array.isArray(model) ? model.includes(v) : model === v)
  function press(v: T) {
    if (multiple) {
      const list = Array.isArray(model) ? model : []
      setModel(list.includes(v) ? list.filter(x => x !== v) : [...list, v])
    }
    else setModel(model === v ? null : v)
  }
  return (
    <div data-ds="toggle-group" role="group" aria-label={label} className={cn('inline-flex max-w-full rounded-control border border-edge-strong bg-surface', className)}>
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto p-1 fade-x">
        {options.map(norm).map(o => (
          <button
            key={o.value}
            type="button"
            aria-pressed={on(o.value)}
            disabled={o.disabled}
            onClick={() => press(o.value)}
            className={cn('inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-ds-sm whitespace-nowrap type-ui-strong text-fg-soft select-none transition-[background-color,color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100 not-aria-pressed:hover:not-disabled:text-fg aria-pressed:bg-action-primary aria-pressed:text-action-primary-fg disabled:cursor-not-allowed disabled:text-action-disabled-fg', ITEM[size])}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ToggleGroup
